import { NextResponse } from "next/server";
import * as line from "@line/bot-sdk";
import { createCarousel, createCategoryBubble, createProductBubble, createCartBubble, createOptionBubble, createOrderFoodBubble } from "../../../../lib/flex-templates";
import { prisma } from "../../../../lib/db";
import { handleCheckoutFlow, startCheckout, handlePaymentSlip, handleOrderCompletion, handleOrderCancellation } from "../../../../lib/checkout-handler";
import { handleRegistrationFlow } from "../../../../lib/registration-handler";

// Configuration
const FALLBACK_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_ACCESS_TOKEN || "";
const FALLBACK_SECRET = process.env.LINE_CHANNEL_SECRET || "";

async function getBranchConfig(branchCode: string) {
    const branch = await prisma.branch.findUnique({
        where: { code: branchCode.toUpperCase() }
    });

    if (!branch) return null;

    return {
        channelAccessToken: branch.lineChannelAccessToken || FALLBACK_ACCESS_TOKEN,
        channelSecret: branch.lineChannelSecret || FALLBACK_SECRET,
        branchCode: branch.code,
        branchId: branch.id
    };
}

export async function GET(req: Request, props: { params: Promise<{ branch: string }> }) {
    const params = await props.params;
    const branchConfig = await getBranchConfig(params.branch);
    if (!branchConfig) {
        return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json({
        status: "ODM_VIDWA_LIVE_VERIFIED",
        branch: branchConfig.branchCode,
        timestamp: new Date().toISOString(),
        env_check: {
            has_secret: !!branchConfig.channelSecret,
            has_token: !!branchConfig.channelAccessToken,
            has_blob_token: !!process.env.BLOB_READ_WRITE_TOKEN,
            has_gemini_key: !!process.env.GEMINI_API_KEY,
        }
    });
}

export async function POST(req: Request, props: { params: Promise<{ branch: string }> }) {
    const params = await props.params;
    console.log(`=== LINE WEBHOOK [Branch: ${params.branch}]: START ===`);

    try {
        const branchConfig = await getBranchConfig(params.branch);
        if (!branchConfig) {
            console.error(`Branch config not found for: ${params.branch}`);
            return NextResponse.json({ error: "Branch not found" }, { status: 404 });
        }

        const client = new line.messagingApi.MessagingApiClient({
            channelAccessToken: branchConfig.channelAccessToken // MessagingApiClient only takes channelAccessToken
        });

        const body = await req.json();
        const events = body.events || [];

        console.log(`Received ${events.length} events for branch ${branchConfig.branchCode}`);

        if (events.length === 0) {
            return NextResponse.json({ message: "OK (No events)" });
        }

        for (const event of events) {
            const replyToken = (event as any).replyToken;
            const userId = (event.source as any).userId;

            console.log(`Processing event type: ${event.type}`);

            // Ignore LINE webhook verification dummy events
            if (replyToken === "00000000000000000000000000000000" || replyToken === "ffffffffffffffffffffffffffffffff") {
                console.log("Received LINE webhook verification ping. Skipping.");
                continue;
            }

            // --- SHOP CONFIG CHECK (Schedule & Busy) ---
            // Move block here to apply to ALL event types (Message & Postback)
            let shopConfig: any = null;
            let currentSession: any = null;
            try {
                const results = await Promise.all([
                    prisma.shopConfig.findFirst(),
                    prisma.cartSession.findUnique({
                        where: { lineUserId: userId }
                    })
                ]);
                shopConfig = results[0];
                currentSession = results[1];

                // Check if user is in middle of payment (allow to finish)
                // We need to fetch session to know state
                const isPaying = currentSession?.state === "AWAITING_PAYMENT";

                if (shopConfig && !isPaying) {
                    // 1. SCHEDULE CHECK
                    if (shopConfig.isScheduleEnabled && shopConfig.openTime && shopConfig.closeTime) {
                        // Convert current time to Bangkok Time
                        const now = new Date();
                        const bangkokTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
                        const currentMinutes = bangkokTime.getHours() * 60 + bangkokTime.getMinutes();

                        const [openH, openM] = shopConfig.openTime.split(":").map(Number);
                        const openMinutes = openH * 60 + openM;

                        const [closeH, closeM] = shopConfig.closeTime.split(":").map(Number);
                        const closeMinutes = closeH * 60 + closeM;

                        // Not Open Yet
                        if (currentMinutes < openMinutes) {
                            console.log(`Shop Schedule: Not Open Yet (Current: ${currentMinutes}, Open: ${openMinutes})`);
                            await client.replyMessage({
                                replyToken,
                                messages: [{ type: "text", text: `🥱 ร้านยังไม่เปิดครับ\n\n⏰ เปิดรับออเดอร์เวลา ${shopConfig.openTime} น. ครับ\n(ขออภัยในความไม่สะดวก)` }]
                            });
                            continue;
                        }

                        // Closed Already
                        if (currentMinutes >= closeMinutes) {
                            console.log(`Shop Schedule: Closed (Current: ${currentMinutes}, Close: ${closeMinutes})`);
                            await client.replyMessage({
                                replyToken,
                                messages: [{ type: "text", text: `😴 ร้านปิดรับออเดอร์แล้วครับ\n\n⏰ เวลาทำการ ${shopConfig.openTime} - ${shopConfig.closeTime} น.\n(เจอกันใหม่พรุ่งนี้นะครับ 👋)` }]
                            });
                            continue;
                        }
                    }

                    // 2. BUSY MODE CHECK
                    if (shopConfig.isBusyMode) {
                        console.log("Busy Mode Active. Blocking interaction.");
                        await client.replyMessage({
                            replyToken,
                            messages: [{ type: "text", text: shopConfig.busyMessage || "ขออภัย ขณะนี้ร้านมีออเดอร์จำนวนมาก ของดรับออเดอร์ออนไลน์ชั่วคราวครับ" }]
                        });
                        continue;
                    }
                }
            } catch (configError) {
                console.error("Shop Config Check Error:", configError);
            }

            // Handle Image Messages (Payment Slip)
            if (event.type === "message" && event.message?.type === "image") {
                const messageId = event.message.id;
                console.log("Image received. checking for payment slip context...");

                // PRIORITY 1: Check if user is in payment state
                let handledByPayment = false;
                if (currentSession?.state === "AWAITING_PAYMENT") {
                    handledByPayment = await handlePaymentSlip(userId, messageId, client, replyToken);
                }

                if (handledByPayment) {
                    console.log("Image handled by payment flow");
                    continue;
                }
            }

            // Handle Text Messages
            if (event.type === "message" && event.message?.type === "text") {
                const userMessage = event.message.text.trim();
                console.log("User message:", userMessage);


                // PRIORITY 0: Check for cancel keywords FIRST (before checkout flow)
                if (userMessage.match(/cancel|ยกเลิก|ไม่เอา/i)) {
                    console.log("Cancel command detected");
                    const handledCancel = await handleOrderCancellation(userId, client, replyToken);
                    if (handledCancel) continue;
                    // Otherwise just clear cart
                    try {
                        await prisma.cartSession.update({
                            where: { lineUserId: userId },
                            data: { state: null, items: [], tempData: {}, orderId: null }
                        });
                        await client.replyMessage({
                            replyToken,
                            messages: [{ type: "text", text: "✅ ล้างตะกร้าแล้ว\nสามารถเลือกสินค้าใหม่ได้เลยค่ะ" }]
                        });
                        continue;
                    } catch (e: any) {
                        if (e.code !== 'P2025') console.error("Cancel Error:", e);
                    }
                }

                // ADMIN COMMAND: Reset Rich Menu
                if (userMessage.toLowerCase() === "resetmenu") {
                    console.log("Resetting Rich Menu for user:", userId);
                    try {
                        await client.unlinkRichMenuIdFromUser(userId);
                        await client.replyMessage({
                            replyToken,
                            messages: [{ type: "text", text: "✅ Reset Rich Menu แล้ว!\nกรุณาปิดและเปิดห้องแชทใหม่เพื่อดูเมนูใหม่ครับ" }]
                        });
                    } catch (err: any) {
                        console.error("Reset Menu Error:", err);
                        await client.replyMessage({
                            replyToken,
                            messages: [{ type: "text", text: `❌ Error: ${err.message}` }]
                        });
                    }
                    continue;
                }

                // PRIORITY 1.1: Check if user is in registration conversation flow
                let handledByRegistration = false;
                if (currentSession?.state && currentSession.state.startsWith("AWAITING_REGISTRATION_")) {
                    handledByRegistration = await handleRegistrationFlow(userId, userMessage, client, replyToken, currentSession);
                }

                if (handledByRegistration) {
                    console.log("Message handled by registration flow");
                    continue;
                }

                // PRIORITY 1.2: Check if user is in checkout conversation flow
                let handledByCheckout = false;
                if (currentSession?.state && !["SHOPPING", "AWAITING_PAYMENT"].includes(currentSession.state) && !currentSession.state.startsWith("AWAITING_REGISTRATION_")) {
                    handledByCheckout = await handleCheckoutFlow(userId, userMessage, client, replyToken);
                }

                if (handledByCheckout) {
                    console.log("Message handled by checkout flow");
                    continue;
                }

                // REMOVED: Duplicate cancel check (now handled at PRIORITY 0 above)
                if (false && userMessage.toLowerCase().includes("xxx")) {
                    console.log("Cancel command detected");
                    // Try cancelling pending order first
                    const handledCancel = await handleOrderCancellation(userId, client, replyToken);
                    if (handledCancel) continue;
                    // Otherwise just clear cart
                    try {
                        await prisma.cartSession.update({
                            where: { lineUserId: userId },
                            data: {
                                state: null,
                                items: [], // Clear items
                                tempData: {},
                                orderId: null
                            }
                        });

                        await client.replyMessage({
                            replyToken: replyToken,
                            messages: [{ type: "text", text: "❌ ยกเลิกรายการเรียบร้อยค่ะ\n\nสนใจรับอะไรดีคะ? กดดูเมนูได้เลย 👇" }]
                        });
                        continue;
                    } catch (e) {
                        console.error("Cancel Error:", e);
                    }
                }

                // --- LOGIC 1: VIEW PRODUCTS IN CATEGORY ---
                // Pattern: "ดูเมนู [CategoryName]"
                if (userMessage.startsWith("ดูเมนู ")) {
                    const categoryName = userMessage.replace("ดูเมนู ", "").trim();
                    console.log(`Fetching products for category: ${categoryName}`);

                    try {
                        const products = await prisma.product.findMany({
                            where: {
                                Category: {
                                    name: categoryName
                                },
                                isActive: true
                            },
                            take: 10,
                            orderBy: { name: 'asc' }
                        });

                        console.log(`Found ${products.length} products`);

                        if (products.length === 0) {
                            if (replyToken === "test-token-12345") continue;
                            await client.replyMessage({
                                replyToken: replyToken,
                                messages: [{ type: "text", text: `ไม่พบสินค้าในหมวดหมู่ ${categoryName} ค่ะ` }]
                            });
                            continue;
                        }

                        const bubbles = products.map((p: any) => createProductBubble({
                            id: p.id,
                            name: p.name,
                            price: Number(p.price), // Convert Decimal to Number
                            image: p.images && p.images.length > 0 ? p.images[0] : null,
                            specifications: p.specifications // Pass specs to enable option flow
                        }, userId, branchConfig.branchCode));

                        const carousel = createCarousel(bubbles);

                        // Mock for test
                        if (replyToken === "test-token-12345") {
                            console.log("Test token detected. Mocking Product Carousel.");
                            console.log(JSON.stringify(carousel, null, 2));
                            continue;
                        }

                        await client.replyMessage({
                            replyToken: replyToken,
                            messages: [carousel as any]
                        });
                        console.log("Product Carousel sent!");
                        continue; // Stop processing this event

                    } catch (err) {
                        console.error("Error fetching products:", err);
                        if (replyToken === "test-token-12345") continue;
                        await client.replyMessage({
                            replyToken: replyToken,
                            messages: [{ type: "text", text: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า" }]
                        });
                        continue;
                    }
                }

                // --- LOGIC 3: VIEW CART / CHECKOUT ---
                // Pattern: "ตะกร้า", "cart", "สรุป", "checkout"
                const cartKeywords = ["ตะกร้า", "cart", "สรุป", "checkout"];
                if (cartKeywords.some(k => userMessage.toLowerCase().includes(k))) {
                    console.log("View Cart requested");

                    try {
                        const cart = await prisma.cartSession.findUnique({
                            where: { lineUserId: userId }
                        });

                        if (!cart || !cart.items || (cart.items as any[]).length === 0) {
                            if (replyToken === "test-token-12345") continue;
                            await client.replyMessage({
                                replyToken: replyToken,
                                messages: [{ type: "text", text: "ตะกร้าของคุณยังว่างอยู่ค่ะ ลองเลือกเมนูแนะนำไหมคะ?" }]
                            });
                            continue;
                        }

                        const bubble = createCartBubble(cart.items as any[]);

                        if (replyToken === "test-token-12345") {
                            console.log("Test token detected. Mocking Cart View.");
                            console.log(JSON.stringify(bubble, null, 2));
                            continue;
                        }

                        await client.replyMessage({
                            replyToken: replyToken,
                            messages: [{ type: "flex", altText: "สรุปรายการสินค้า", contents: bubble as any }]
                        });
                        console.log("Cart Bubble sent!");
                        continue;

                    } catch (err: any) {
                        console.error("View Cart Error:", err);
                        console.error("Cart error details:", err?.message, err?.response?.data);
                        if (replyToken === "test-token-12345") continue;
                        try {
                            await client.replyMessage({
                                replyToken: replyToken,
                                messages: [{ type: "text", text: "ขออภัยค่ะ ไม่สามารถแสดงตะกร้าได้" }]
                            });
                        } catch (e: any) {
                            console.error("Cart fallback failed:", e?.message);
                            console.error("Cart fallback response:", e?.response?.data);
                        }
                    }
                    continue; // Stop processing even if fallback failed
                }

                // --- LOGIC 2: GREETING / SHOW CATEGORIES ---
                // Pattern: "สวัสดี", "เมนู", "menu"
                const greetingKeywords = ["สวัสดี", "หวัดดี", "hello", "hi", "เมนู", "menu"];
                const isGreeting = greetingKeywords.some(k => userMessage.toLowerCase().includes(k));

                if (isGreeting) {
                    console.log("Greeting detected. Checking profile...");

                    try {
                        let profile = await prisma.customerProfile.findUnique({ where: { lineUserId: userId } });
                        
                        if (!profile) {
                            // NEW CUSTOMER: Start Registration Flow
                            console.log("No profile found. Starting registration flow.");
                            
                            await prisma.cartSession.upsert({
                                where: { lineUserId: userId },
                                update: { state: "AWAITING_REGISTRATION_CONSENT", branchCode: branchConfig.branchCode },
                                create: { lineUserId: userId, state: "AWAITING_REGISTRATION_CONSENT", items: [], branchCode: branchConfig.branchCode }
                            });

                            await client.replyMessage({
                                replyToken,
                                messages: [{
                                    type: "text",
                                    text: "ร้านขออนุญาตเก็บข้อมูล ชื่อ เบอร์โทร เพื่อการสะสมแต้มและกิจกรรมร่วมกับทางร้านค้าเท่านั้น โดยจะได้คะแนนสะสม 100คะแนน ครบ สองร้อยคะแนน รับฟรี 1 one -dish- meals (1จาน)",
                                    quickReply: {
                                        items: [
                                            { type: "action", action: { type: "message", label: "❌ ไม่อนุญาต", text: "ไม่อนุญาต" } },
                                            { type: "action", action: { type: "message", label: "✅ อนุญาต", text: "อนุญาต" } }
                                        ]
                                    }
                                }]
                            });
                            continue;
                        }
                    } catch (e) {
                        console.error("Error checking customer profile:", e);
                    }

                    console.log("Fetching categories...");
                    let categories: any[] = [];

                    try {
                        categories = await prisma.category.findMany({
                            include: {
                                _count: {
                                    select: { Product: true }
                                }
                            },
                            orderBy: { name: 'asc' }
                        });
                    } catch (e) {
                        console.error("Error fetching categories:", e);
                        await client.replyMessage({
                            replyToken: replyToken,
                            messages: [{ type: "text", text: "ขออภัยค่ะ ไม่สามารถดึงข้อมูลหมวดหมู่ได้ในขณะนี้" }]
                        });
                        continue;
                    }

                    // 2. Construct Payload (Standardized)
                    console.log("Constructing Standardized Flex Carousel...");
                    const bubbles = categories.map((c) => {
                        return createCategoryBubble({
                            name: c.name,
                            image: c.image,
                            count: c._count.Product
                        });
                    });

                    // Add "Order via Web" Bubble (Using standardized template) - Removed to reduce clutter
                    // bubbles.unshift(createOrderFoodBubble(branchConfig.branchCode));

                    const carousel = createCarousel(bubbles);

                    // 3. Send Message
                    try {
                        console.log("Sending Flex Carousel...");
                        await client.replyMessage({
                            replyToken: replyToken,
                            messages: [carousel as any]
                        });
                        console.log("Flex Carousel sent!");
                    } catch (flexError: any) {
                        console.error("Flex Message Failed:", flexError);
                        // Fallback to Text
                        try {
                            const textList = "สั่งอาหารกดที่นี่: https://liff.line.me/2006637207-Kq80Jp1l/ecommerce/food\n\nรายการหมวดหมู่สินค้า:\n" + categories.map(c => `- ${c.name}`).join("\n") + "\n\n(กดเมนูไม่ติด โปรดพิมพ์ชื่อหมวดหมู่)";
                            await client.pushMessage({
                                to: userId,
                                messages: [{ type: "text", text: textList }]
                            });
                        } catch (e) { }
                    }
                    continue;
                }

                // --- DEFAULT: ECHO (for debugging) ---
                console.log("No command matched. Echoing...");
                if (replyToken === "test-token-12345") continue;
                // Optional: Don't reply if it's random text to avoid spamming
            }

            // Handle Postback Events
            if (event.type === "postback") {
                const data = event.postback.data;
                const userId = event.source.userId;
                console.log("Postback received:", data);

                const params = new URLSearchParams(data);
                const action = params.get("action");



                if (action === "quick_add") {
                    const productId = params.get("productId");
                    if (!productId) continue;

                    try {
                        const product = await prisma.product.findUnique({ where: { id: productId } });
                        if (!product) continue;

                        let cart = await prisma.cartSession.findUnique({ where: { lineUserId: userId } });
                        let items: any[] = cart?.items ? (cart.items as any[]) : [];

                        // Check if item already exists with NO options (since this is quick add)
                        const existingItemIndex = items.findIndex((item: any) =>
                            item.productId === productId &&
                            (!item.selectedOptions || Object.keys(item.selectedOptions).length === 0)
                        );

                        if (existingItemIndex !== -1) {
                            items[existingItemIndex].quantity += 1;
                        } else {
                            items.push({
                                productId: product.id,
                                name: product.name,
                                price: Number(product.price),
                                quantity: 1,
                                image: product.images && product.images.length > 0 ? product.images[0] : null,
                                selectedOptions: {}
                            });
                        }

                        await prisma.cartSession.upsert({
                            where: { lineUserId: userId },
                            update: { items: items, updatedAt: new Date(), state: "SHOPPING", branchCode: branchConfig.branchCode },
                            create: { lineUserId: userId, items: items, state: "SHOPPING", branchCode: branchConfig.branchCode }
                        });

                        // Reply with Cart Bubble directly
                        const bubble = createCartBubble(items as any[]);
                        await client.replyMessage({
                            replyToken: replyToken,
                            messages: [{ type: "flex", altText: "เพิ่มลงตะกร้าเรียบร้อย", contents: bubble as any }]
                        });

                    } catch (e) {
                        console.error("Quick Add Error:", e);
                    }
                    continue;
                }

                if (action === "select_option") {
                    const productId = params.get("productId");
                    const optionIndexStr = params.get("optionIndex");
                    if (!productId || !optionIndexStr) continue;

                    try {
                        const product = await prisma.product.findUnique({ where: { id: productId } });
                        if (!product) continue;

                        let specs: any = null;
                        try {
                            if (typeof product.specifications === 'string') {
                                specs = JSON.parse(product.specifications);
                            } else if (typeof product.specifications === 'object') {
                                specs = product.specifications;
                            }
                        } catch (e) { }

                        const options = (specs && specs.options) ? specs.options : [];
                        const currentIndex = parseInt(optionIndexStr);

                        // Collect current selections from params (keys starting with s_)
                        const currentSelection: Record<string, string> = {};
                        params.forEach((value, key) => {
                            if (key.startsWith("s_")) {
                                const optionId = key.substring(2); // remove s_
                                currentSelection[optionId] = value;
                            }
                        });

                        // 1. If we have more options to show
                        if (currentIndex < options.length) {
                            const nextOption = options[currentIndex];
                            // Show bubble for this option
                            // We pass currentIndex + 1 as the *next* index for the buttons inside this bubble
                            await client.replyMessage({
                                replyToken: replyToken,
                                messages: [{
                                    type: "flex",
                                    altText: `เลือก ${nextOption.label}`,
                                    contents: createOptionBubble(
                                        product.name,
                                        nextOption,
                                        product.id,
                                        currentIndex + 1,
                                        currentSelection
                                    ) as any
                                }]
                            });
                        } else {
                            // 2. All options selected -> Add to Cart
                            let finalPrice = Number(product.price);
                            const selectedOptionsDisplay: any = {};
                            const addonsList: string[] = []; // Legacy support for schema, but we should use 'items' options JSON really

                            // Calculate price from selections
                            options.forEach((opt: any) => {
                                const val = currentSelection[opt.id];
                                if (val && val !== 'none') {
                                    const choice = opt.choices.find((c: any) => c.value === val);
                                    if (choice) {
                                        if (choice.price) finalPrice += choice.price;

                                        selectedOptionsDisplay[opt.label] = choice.label;
                                        // Legacy 'addons' array for display if needed
                                        // But our new checkout-handler just JSON.stringify(options) so we should be good if we pass this object.
                                    }
                                }
                            });

                            let cart = await prisma.cartSession.findUnique({ where: { lineUserId: userId } });
                            let items: any[] = cart?.items ? (cart.items as any[]) : [];

                            items.push({
                                productId: product.id,
                                name: product.name,
                                price: finalPrice,
                                quantity: 1,
                                image: product.images && product.images.length > 0 ? product.images[0] : null,
                                selectedOptions: selectedOptionsDisplay // Save friendly { "Spiciness": "Mild" }
                            });

                            await prisma.cartSession.upsert({
                                where: { lineUserId: userId },
                                update: { items: items, updatedAt: new Date(), branchCode: branchConfig.branchCode },
                                create: { lineUserId: userId, items: items, state: "SHOPPING", branchCode: branchConfig.branchCode }
                            });

                            // Format option string for display
                            const optionText = Object.entries(selectedOptionsDisplay)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ");

                            await client.replyMessage({
                                replyToken: replyToken,
                                messages: [
                                    {
                                        type: "flex",
                                        altText: "เพิ่มลงตะกร้าเรียบร้อย",
                                        contents: {
                                            type: "bubble",
                                            size: "kilo",
                                            body: {
                                                type: "box",
                                                layout: "vertical",
                                                contents: [
                                                    { type: "text", text: `เพิ่ม ${product.name} แล้ว!`, weight: "bold", size: "sm", color: "#1DB446" },
                                                    { type: "text", text: optionText || "ปกติ", size: "xs", color: "#555555", margin: "xs", wrap: true },
                                                    { type: "text", text: `ในตะกร้ามี ${items.length} รายการ`, size: "xs", color: "#888888", margin: "sm" }
                                                ],
                                                paddingAll: "12px"
                                            },
                                            footer: {
                                                type: "box",
                                                layout: "horizontal",
                                                contents: [
                                                    { type: "button", action: { type: "message", label: "เลือกต่อ", text: "เมนู" }, style: "secondary", height: "sm", flex: 1 },
                                                    { type: "button", action: { type: "message", label: "ดูตะกร้า", text: "ตะกร้า" }, style: "primary", height: "sm", flex: 1, color: "#EAB308" }
                                                ],
                                                spacing: "sm"
                                            }
                                        } as any
                                    }
                                ]
                            });
                        }

                    } catch (e) {
                        console.error("Select Option Error:", e);
                    }
                    continue;
                }

                // Handle increase quantity
                if (action === "increase") {
                    const productId = params.get("productId");
                    if (!productId || !userId) continue;

                    try {
                        const cart = await prisma.cartSession.findUnique({
                            where: { lineUserId: userId }
                        });

                        if (cart && cart.items) {
                            const items = [...(cart.items as any[])];
                            const index = items.findIndex((i: any) => i.productId === productId);

                            if (index !== -1) {
                                items[index].quantity += 1;
                                
                                await prisma.cartSession.update({
                                    where: { lineUserId: userId },
                                    data: { items: items }
                                });

                                const bubble = createCartBubble(items as any[]);
                                await client.replyMessage({
                                    replyToken: replyToken,
                                    messages: [{ type: "flex", altText: "อัพเดทตะกร้าสินค้า", contents: bubble as any }]
                                });
                            }
                        }
                    } catch (err) {
                        console.error("Increase Item Error:", err);
                    }
                    continue;
                }

                // Handle decrease quantity
                if (action === "decrease") {
                    const productId = params.get("productId");
                    if (!productId || !userId) continue;

                    try {
                        const cart = await prisma.cartSession.findUnique({
                            where: { lineUserId: userId }
                        });

                        if (cart && cart.items) {
                            const items = [...(cart.items as any[])];
                            const index = items.findIndex((i: any) => i.productId === productId);

                            if (index !== -1) {
                                items[index].quantity -= 1;
                                
                                if (items[index].quantity <= 0) {
                                    items.splice(index, 1);
                                }

                                await prisma.cartSession.update({
                                    where: { lineUserId: userId },
                                    data: { items: items }
                                });

                                if (items.length > 0) {
                                    const bubble = createCartBubble(items as any[]);
                                    await client.replyMessage({
                                        replyToken: replyToken,
                                        messages: [{ type: "flex", altText: "อัพเดทตะกร้าสินค้า", contents: bubble as any }]
                                    });
                                } else {
                                    await client.replyMessage({
                                        replyToken: replyToken,
                                        messages: [{ type: "text", text: "ลบสินค้าเรียบร้อย ตะกร้าของคุณว่างเปล่าค่ะ" }]
                                    });
                                }
                            }
                        }
                    } catch (err) {
                        console.error("Decrease Item Error:", err);
                    }
                    continue;
                }

                // Handle remove item
                if (action === "remove") {
                    const productId = params.get("productId");
                    if (!productId || !userId) continue;

                    try {
                        const cart = await prisma.cartSession.findUnique({
                            where: { lineUserId: userId }
                        });

                        if (cart && cart.items) {
                            const items = [...(cart.items as any[])];
                            const index = items.findIndex((i: any) => i.productId === productId);

                            if (index !== -1) {
                                items.splice(index, 1);
                            }

                            await prisma.cartSession.update({
                                where: { lineUserId: userId },
                                data: { items: items }
                            });

                            // Reply with updated cart
                            if (items.length > 0) {
                                const bubble = createCartBubble(items as any[]);
                                await client.replyMessage({
                                    replyToken: replyToken,
                                    messages: [{ type: "flex", altText: "ตะกร้าสินค้า", contents: bubble as any }]
                                });
                            } else {
                                await client.replyMessage({
                                    replyToken: replyToken,
                                    messages: [{ type: "text", text: "ลบสินค้าเรียบร้อย ตะกร้าของคุณว่างเปล่าค่ะ" }]
                                });
                            }
                        }
                    } catch (err) {
                        console.error("Remove Item Error:", err);
                    }
                    continue;
                }

                // Handle checkout button
                if (action === "checkout") {
                    await startCheckout(userId, client, replyToken);
                    continue;
                }

                if (action === "receive") {
                    const orderId = params.get("orderId");
                    if (orderId) {
                        const { handleOrderCompletion } = await import("@/lib/checkout-handler");
                        await handleOrderCompletion(orderId, client, replyToken);
                    }
                    continue;
                }

                // Handle rating button postback
                if (action === "rate") {
                    const orderId = params.get("orderId");
                    const rating = params.get("rating");

                    if (orderId && rating) {
                        try {
                            const score = parseInt(rating);
                            // Save rating to database
                            await prisma.review.upsert({
                                where: { orderId: orderId },
                                update: { rating: score, lineUserId: userId },
                                create: {
                                    orderId: orderId,
                                    rating: score,
                                    lineUserId: userId
                                }
                            });

                            // Update cart session to await comment
                            await prisma.cartSession.upsert({
                                where: { lineUserId: userId },
                                update: {
                                    state: "AWAITING_REVIEW_COMMENT",
                                    tempData: { orderId, rating }
                                },
                                create: {
                                    lineUserId: userId,
                                    items: [],
                                    state: "AWAITING_REVIEW_COMMENT",
                                    tempData: { orderId, rating }
                                }
                            });

                            // Send Thank You and ask for comment using Quick Reply
                            await client.replyMessage({
                                replyToken: replyToken,
                                messages: [{
                                    type: "text",
                                    text: `ขอบคุณสำหรับ ${rating} ดาว! ⭐\n\nต้องการแสดงความคิดเห็นเพิ่มเติมไหมคะ?`,
                                    quickReply: {
                                        items: [
                                            {
                                                type: "action",
                                                action: {
                                                    type: "message",
                                                    label: "อร่อยถูกใจ!",
                                                    text: "อร่อยถูกใจ!"
                                                }
                                            },
                                            {
                                                type: "action",
                                                action: {
                                                    type: "message",
                                                    label: "บริการรวดเร็ว!",
                                                    text: "บริการรวดเร็ว!"
                                                }
                                            },
                                            {
                                                type: "action",
                                                action: {
                                                    type: "message",
                                                    label: "อื่นๆ (พิมพ์เอง)",
                                                    text: "อื่นๆ (พิมพ์เอง)"
                                                }
                                            },
                                            {
                                                type: "action",
                                                action: {
                                                    type: "message",
                                                    label: "ข้าม",
                                                    text: "ข้าม"
                                                }
                                            }
                                        ]
                                    }
                                }]
                            });
                        } catch (err) {
                            console.error("Rating Save Error:", err);
                        }
                    }
                    continue;
                }

                if (action === "receive") {
                    const orderId = params.get("orderId");
                    if (orderId) {
                        await handleOrderCompletion(orderId, client, replyToken);
                    }
                    continue;
                }
            }
        }

        return NextResponse.json({ message: "OK" });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({
            error: "Error",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
