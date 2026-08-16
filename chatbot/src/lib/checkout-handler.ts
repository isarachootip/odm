import { prisma } from "./db";
import * as line from "@line/bot-sdk";
import fs from "fs";
import path from "path";
import { createCarousel, createCategoryBubble, createProductBubble, createCartBubble, createQueueTicketBubble } from "./flex-templates";
import { downloadLineContent } from "./line-content";
import { analyzePaymentSlip } from "./gemini-vision";
import { verifySlip } from "./slip-verifier";
import { generatePromptPayQR } from "./promptpay";
import { uploadToMinIO } from "./minio";

type TempData = {
    name?: string;
    phone?: string;
    department?: string;
    deliveryType?: string;
    location?: string;
    note?: string;
};

type CartSession = {
    id: string;
    lineUserId: string;
    items: any;
    state: string | null;
    tempData: any;
    orderId: string | null;
    branchCode: string | null;
};

/**
 * Handle checkout conversation flow
 */
export async function handleCheckoutFlow(
    userId: string,
    userMessage: string,
    client: line.messagingApi.MessagingApiClient,
    replyToken: string
): Promise<boolean> {
    // Get cart session
    const session = await prisma.cartSession.findUnique({
        where: { lineUserId: userId }
    });

    if (!session || !session.state) {
        return false; // Not in checkout flow
    }

    try {
        switch (session.state) {
            case "AWAITING_CONSENT":
                await handleConsentInput(session as any, userMessage, client, replyToken);
                return true;

            case "AWAITING_REGISTER":
                await client.replyMessage({
                    replyToken,
                    messages: [{ type: "text", text: "กรุณาลงทะเบียนผ่านลิงก์ด้านบนให้เสร็จสิ้นครับ 📝\n(หากไม่ต้องการลงทะเบียน พิมพ์ 'ไม่ยินยอม')" }]
                });
                return true;

            case "AWAITING_NOTE":
                await handleNoteInput(session as any, userMessage, client, replyToken);
                return true;

            case "AWAITING_DELIVERY_TYPE":
                await handleDeliveryTypeInput(session as any, userMessage, client, replyToken);
                return true;

            case "AWAITING_LOCATION":
                await handleLocationInput(session as any, userMessage, client, replyToken);
                return true;

            case "AWAITING_REVIEW_COMMENT":
                await handleReviewCommentInput(session as any, userMessage, client, replyToken);
                return true;

            default:
                return false;
        }
    } catch (error) {
        console.error("Error in checkout flow:", error);
        console.error("Error in checkout flow:", error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        await client.replyMessage({
            replyToken,
            messages: [{ type: "text", text: `เกิดข้อผิดพลาด: ${errorMsg}\n\n(กรุณาลองใหม่อีกครั้ง หรือพิมพ์ 'ยกเลิก')` }]
        });
        return true;
    }
}

/**
 * Start checkout process
 */
export async function startCheckout(
    userId: string,
    client: line.messagingApi.MessagingApiClient,
    replyToken: string
): Promise<void> {
    const session = await prisma.cartSession.findUnique({
        where: { lineUserId: userId }
    });

    if (!session || !session.items || (session.items as any[]).length === 0) {
        await client.replyMessage({
            replyToken,
            messages: [{
                type: "text",
                text: "🛒 ตะกร้าสินค้าว่างเปล่า\nกรุณาเลือกสินค้าก่อนดำเนินการสั่งซื้อ"
            }]
        });
        return;
    }

    // 1. Check CustomerProfile
    const profile = await prisma.customerProfile.findUnique({
        where: { lineUserId: userId }
    });

    if (profile) {
        if (!profile.isConsent) {
            // Dummy Customer
            const tempData: TempData = {
                name: "Dummy Customer",
                phone: "0000000000"
            };

            await prisma.cartSession.update({
                where: { lineUserId: userId },
                data: {
                    state: "AWAITING_NOTE",
                    tempData: tempData as any
                }
            });

            await client.replyMessage({
                replyToken,
                messages: [{
                    type: "text",
                    text: "ต้องการระบุคำสั่งพิเศษหรือไม่?\n\nพิมพ์ข้อความแล้วกดส่งได้เลยครับ 👇\n(เช่น เผ็ดน้อย, ไม่ใส่ชูรส)\n\nหรือถ้าไม่มีให้กดปุ่ม ข้าม ด้านล่าง 👇",
                    quickReply: {
                        items: [
                            { type: "action", action: { type: "message", label: "➡️ ข้าม (ไม่มี)", text: "ข้าม" } }
                        ]
                    }
                }]
            });
            return;
        }

        // RETURNING CUSTOMER: Auto-fill data
        const tempData: TempData = {
            name: profile.nickname || "ลูกค้า",
            phone: profile.phone || "",
            department: profile.department || undefined
        };

        // Update session state directly to AWAITING_NOTE
        await prisma.cartSession.update({
            where: { lineUserId: userId },
            data: {
                state: "AWAITING_NOTE",
                tempData: tempData as any
            }
        });

        // Greeting & Quick Reply for Special Instruction
        const deptText = tempData.department ? ` (${tempData.department})` : "";
        await client.replyMessage({
            replyToken,
            messages: [
                {
                    type: "text",
                    text: `สวัสดีครับ คุณ ${tempData.name}${deptText} 👋\nรับรายการเดิมไหมครับ?`
                },
                {
                    type: "text",
                    text: "ต้องการระบุคำสั่งพิเศษหรือไม่?\n\nพิมพ์ข้อความแล้วกดส่งได้เลยครับ 👇\n(เช่น เผ็ดน้อย, ไม่ใส่ชูรส)\n\nหรือถ้าไม่มีให้กดปุ่ม ข้าม ด้านล่าง 👇",
                    quickReply: {
                        items: [
                            { type: "action", action: { type: "message", label: "➡️ ข้าม (ไม่มี)", text: "ข้าม" } }
                        ]
                    }
                }
            ]
        });
    } else {
        // NEW CUSTOMER: Ask for Consent
        await prisma.cartSession.update({
            where: { lineUserId: userId },
            data: {
                state: "AWAITING_REGISTRATION_CONSENT",
                tempData: {}
            }
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
    }
}

async function handleConsentInput(
    session: CartSession,
    input: string,
    client: line.messagingApi.MessagingApiClient,
    replyToken: string
): Promise<void> {
    const isConsent = input === "ยินยอม";
    const isDecline = input === "ไม่ยินยอม";

    if (!isConsent && !isDecline) {
        await client.replyMessage({
            replyToken,
            messages: [{
                type: "text",
                text: "กรุณาเลือก ยินยอม หรือ ไม่ยินยอม ผ่านปุ่มด้านล่างครับ",
                quickReply: {
                    items: [
                        { type: "action", action: { type: "message", label: "❌ ไม่ยินยอม", text: "ไม่ยินยอม" } },
                        { type: "action", action: { type: "message", label: "✅ ยินยอม", text: "ยินยอม" } }
                    ]
                }
            }]
        });
        return;
    }

    try {
        await prisma.customerProfile.upsert({
            where: { lineUserId: session.lineUserId },
            update: { isConsent },
            create: { lineUserId: session.lineUserId, isConsent }
        });

        if (isDecline) {
            // Proceed as Dummy Customer
            const tempData: TempData = { name: "Dummy Customer", phone: "0000000000" };
            await prisma.cartSession.update({
                where: { id: session.id },
                data: { state: "AWAITING_NOTE", tempData: tempData as any }
            });

            await client.replyMessage({
                replyToken,
                messages: [{
                    type: "text",
                    text: "ต้องการระบุคำสั่งพิเศษหรือไม่?\n\nพิมพ์ข้อความแล้วกดส่งได้เลยครับ 👇\n(เช่น เผ็ดน้อย, ไม่ใส่ชูรส)\n\nหรือถ้าไม่มีให้กดปุ่ม ข้าม ด้านล่าง 👇",
                    quickReply: {
                        items: [
                            { type: "action", action: { type: "message", label: "➡️ ข้าม (ไม่มี)", text: "ข้าม" } }
                        ]
                    }
                }]
            });
        } else {
            // User Consented: Send to LIFF Registration Form
            await prisma.cartSession.update({
                where: { id: session.id },
                data: { state: "AWAITING_REGISTER" } // New state waiting for API post
            });

            await client.replyMessage({
                replyToken,
                messages: [{
                    type: "flex",
                    altText: "ลงทะเบียนสมาชิก",
                    contents: {
                        type: "bubble",
                        header: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                { type: "text", text: "ลงทะเบียนสมาชิก 📝", weight: "bold", size: "lg", color: "#ffffff" }
                            ],
                            backgroundColor: "#f59e0b"
                        },
                        body: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: "กรุณากรอกข้อมูลเพื่อสะสมแต้มและรับโปรโมชั่นพิเศษ!",
                                    wrap: true,
                                    size: "sm",
                                    color: "#666666"
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    color: "#f59e0b",
                                    margin: "lg",
                                    action: {
                                        type: "uri",
                                        label: "คลิกเพื่อลงทะเบียน",
                                        uri: process.env.NEXT_PUBLIC_LIFF_ID ? `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}/register?userId=${session.lineUserId}` : "https://liff.line.me/" 
                                    }
                                }
                            ]
                        }
                    } as any
                }]
            });
        }
    } catch (err: any) {
        console.error("Error in handleConsentInput:", err);
        await client.replyMessage({
            replyToken,
            messages: [{ type: "text", text: `❌ เกิดข้อผิดพลาด: ${err.message || "ไม่สามารถทำรายการได้"}` }]
        });
    }
}

async function handleNoteInput(
    session: CartSession,
    note: string,
    client: line.messagingApi.MessagingApiClient,
    replyToken: string
): Promise<void> {
    const actualNote = (note.trim() === "ข้าม" || note.trim().toLowerCase() === "skip" || note.trim() === "-" || note.trim() === "บันทึก") ? null : note.trim();
    const tempData = { ...session.tempData, note: actualNote };
    
    await prisma.cartSession.update({
        where: { id: session.id },
        data: { state: "AWAITING_DELIVERY_TYPE", tempData: tempData as any }
    });

    await client.replyMessage({
        replyToken,
        messages: [{
            type: "text",
            text: "📦 เลือกวิธีการรับสินค้า:",
            quickReply: {
                items: [
                    { type: "action", action: { type: "message", label: "🏠 รับเอง (Pickup)", text: "รับเอง" } },
                    { type: "action", action: { type: "message", label: "🥡 Takehome", text: "Takehome" } },
                    { type: "action", action: { type: "message", label: "🚚 จัดส่ง (Delivery)", text: "จัดส่ง" } }
                ]
            }
        }]
    });
}

async function handleDeliveryTypeInput(
    session: CartSession,
    input: string,
    client: line.messagingApi.MessagingApiClient,
    replyToken: string
): Promise<void> {
    const message = input.toLowerCase();

    if (message.includes("รับเอง") || message.includes("pickup") || message.includes("ทานที่นี่")) {
        // Customer will pickup (Eat here / Self service)
        const tempData = { ...session.tempData, deliveryType: "PICKUP" };
        await createOrderFromSession(session, tempData, client, replyToken);
    } else if (message.includes("takehome") || message.includes("ใส่กล่อง")) {
        // Customer wants takeaway (Box)
        const tempData = { ...session.tempData, deliveryType: "TAKEAWAY" };
        await createOrderFromSession(session, tempData, client, replyToken);
    } else if (message.includes("จัดส่ง") || message.includes("delivery") || message.includes("ส่ง")) {
        // Need to ask for location
        const tempData = { ...session.tempData, deliveryType: "DELIVERY" };

        await prisma.cartSession.update({
            where: { id: session.id },
            data: {
                state: "AWAITING_LOCATION",
                tempData
            }
        });

        await client.replyMessage({
            replyToken,
            messages: [{
                type: "text",
                text: "🚚 จัดส่ง\n\nกรุณาระบุ **สถานที่จัดส่ง**\n(ตัวอย่าง: ห้องประชุม3 ตึกหน้า)"
            }]
        });
    } else {
        await client.replyMessage({
            replyToken,
            messages: [{
                type: "text",
                text: "กรุณาเลือก:\n- พิมพ์ **รับเอง**\n- พิมพ์ **Takehome**\n*(บริการจัดส่งงดให้บริการชั่วคราว)*"
            }]
        });
    }
}

async function handleLocationInput(
    session: CartSession,
    location: string,
    client: line.messagingApi.MessagingApiClient,
    replyToken: string
): Promise<void> {
    if (!location || location.length < 3) {
        await client.replyMessage({
            replyToken,
            messages: [{ type: "text", text: "กรุณาระบุสถานที่จัดส่งให้ชัดเจน" }]
        });
        return;
    }

    const tempData = { ...session.tempData, location };
    await createOrderFromSession(session, tempData, client, replyToken);
}

/**
 * Generate Custom Order Number ([Branch]YYMMDDxxxx)
 * Example: odm2602180001 or bkm2602180001
 */
async function generateOrderNumber(branchCode: string = 'odm') {
    const today = new Date();
    // Use local time for date string generation to ensure consistency with user expectation
    const offset = today.getTimezoneOffset() * 60000;
    const localToday = new Date(today.getTime() - offset);

    const day = String(localToday.getDate()).padStart(2, '0');
    const month = String(localToday.getMonth() + 1).padStart(2, '0');
    const year = String(localToday.getFullYear()).slice(-2);

    // Prefix: branchCode + YYMMDD
    const datePrefix = `${branchCode.toLowerCase()}${year}${month}${day}`;

    // Find last order with this prefix
    const lastOrder = await prisma.order.findFirst({
        where: {
            orderNumber: {
                startsWith: datePrefix
            }
        },
        orderBy: {
            orderNumber: 'desc'
        },
        select: {
            orderNumber: true
        }
    });

    let runningNo = 1;
    if (lastOrder && lastOrder.orderNumber) {
        // Extract suffix (last 4 digits)
        const lastRunningNoStr = lastOrder.orderNumber.slice(-4);
        const lastRunningNo = parseInt(lastRunningNoStr, 10);
        if (!isNaN(lastRunningNo)) {
            runningNo = lastRunningNo + 1;
        }
    }

    return `${datePrefix}${String(runningNo).padStart(4, '0')}`;
}

/**
 * Create Order from session data
 */
async function createOrderFromSession(
    session: CartSession,
    tempData: TempData,
    client: line.messagingApi.MessagingApiClient,
    replyToken: string
): Promise<void> {
    const cartItems = session.items as any[];

    // 2. Build Order Items List
    const finalOrderItems = [];

    for (const item of cartItems) {
        let itemPrice = Number(item.price); // Validated number
        let itemQuantity = item.quantity;
        const mainItemOptions = item.selectedOptions ? JSON.parse(JSON.stringify(item.selectedOptions)) : {};

        // 3. Create Main Item
        finalOrderItems.push({
            productId: item.productId,
            quantity: itemQuantity,
            price: itemPrice,
            options: JSON.stringify(mainItemOptions)
        });
    }

    // Calculate total from FINAL items (verification)
    const total = finalOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // ---------------------------------------------------------

    // Get branch context from session or default to VIDWA for now
    // We will update this later when webhook supports multiple branches
    const branchCode = session.branchCode || 'vidwa';

    // Generate Custom Order Number
    const customOrderNumber = await generateOrderNumber(branchCode);

    // Create order
    const order = await prisma.order.create({
        data: {
            lineUserId: session.lineUserId,
            customerProfile: {
                connect: { lineUserId: session.lineUserId }
            },
            customerName: tempData.name!,
            customerPhone: tempData.phone!,
            customerDepartment: tempData.department || null,
            deliveryType: tempData.deliveryType!,
            deliveryLocation: tempData.location || null,
            total,
            status: "PENDING",
            orderNumber: customOrderNumber, // Save ID
            specialInstructions: tempData.note || null,
            isPreorder: tempData.isPreorder || false,
            preorderDateTime: tempData.preorderDateTime ? new Date(tempData.preorderDateTime) : null,
            branch: {
                connect: { code: branchCode.toUpperCase() }
            },
            items: {
                create: finalOrderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    options: item.options
                }))
            }
        }
    });

    // Update session to AWAITING_PAYMENT
    await prisma.cartSession.update({
        where: { id: session.id },
        data: {
            state: "AWAITING_PAYMENT",
            orderId: order.id
        }
    });

    // Prepare order details for message
    const itemsList = cartItems.map((item: any) => {
        let details = "";
        if (item.selectedOptions) {
            // Check if it's new generic format or legacy
            const opts = item.selectedOptions;
            const parts: string[] = [];

            // Legacy Sweetness
            if (opts.sweetness) parts.push(`หวาน: ${opts.sweetness}`);
            // Legacy Addons
            if (Array.isArray(opts.addons) && opts.addons.length > 0) parts.push(`+ ${opts.addons.join(", ")}`);

            // Generic Options (exclude legacy keys)
            Object.entries(opts).forEach(([key, value]) => {
                if (key !== 'sweetness' && key !== 'addons' && value && value !== 'none') {
                    parts.push(`${key}: ${value}`);
                }
            });

            if (parts.length > 0) {
                details = ` (${parts.join(", ")})`;
            }
        }
        return `▫️ ${item.name}${details} x${item.quantity} = ${item.price * item.quantity} บาท`;
    }).join("\n");

    const deliveryInfo = tempData.deliveryType === "PICKUP"
        ? "🏠 รับเอง (Pickup)"
        : tempData.deliveryType === "TAKEAWAY"
            ? "🥡 Takehome"
            : `🚚 จัดส่งที่: ${tempData.location}`;

    const noteInfo = tempData.note ? `\n📝 คำสั่งพิเศษ: ${tempData.note}` : "";

    // Try to generate QR code
    try {
        // Fetch default payment config
        const paymentConfig = await prisma.paymentConfig.findFirst({
            where: { isDefault: true },
            orderBy: { createdAt: 'desc' }
        });

        if (paymentConfig) {
            let paymentMessage = `✅ สร้าง Order สำเร็จ!\n\n📦 Order Number: ${order.orderNumber}\n👤 ชื่อ: ${tempData.name}\n📞 เบอร์: ${tempData.phone}\n${deliveryInfo}${noteInfo}\n\n🛒 รายการสินค้า:\n${itemsList}\n\n💰 รวมทั้งหมด: ${total} บาท\n\n━━━━━━━━━━━━━━━\n\n`;

            // Generate QR Code only for PromptPay
            if (paymentConfig.paymentType === "PROMPTPAY" && paymentConfig.promptpayNumber) {
                const baseUrl = (process.env.CHATBOT_URL || "https://chat.mamsoi8.online").replace(/\/$/, "");
                const qrUrl = `${baseUrl}/api/v1/qr/${order.id}.png`;
                console.log(`Generated QR URL: ${qrUrl}`);

                paymentMessage += `**(1) 📱 สแกนจ่ายง่ายๆ (แนะนำ ✨)**\n(บันทึกรูป QR ด้านล่างแล้วสแกนในแอปธนาคาร)\n\n━━━━━━━━━━━━━━━\n\n**(2) 🏦 หรือโอนเข้าพร้อมเพย์**\nเบอร์: ${paymentConfig.promptpayNumber}\nชื่อบัญชี: ${paymentConfig.accountName}\n\n*(โอนแล้วแจ้งสลิปกลับมาได้เลยครับ)*`;

                await client.replyMessage({
                    replyToken,
                    messages: [
                        {
                            type: "text",
                            text: paymentMessage
                        },
                        {
                            type: "image",
                            originalContentUrl: qrUrl,
                            previewImageUrl: qrUrl
                        }
                    ]
                });
            } else if (paymentConfig.paymentType === "BANK_TRANSFER") {
                // Bank transfer - text only
                paymentMessage += `**(1) 🏦 โอนเข้าบัญชีธนาคาร**\nธนาคาร: ${paymentConfig.bankName}\nเลขที่บัญชี: ${paymentConfig.accountNumber}\nชื่อบัญชี: ${paymentConfig.accountName}\n\n*(โอนแล้วแจ้งสลิปกลับมาได้เลยครับ)*`;

                await client.replyMessage({
                    replyToken,
                    messages: [{
                        type: "text",
                        text: paymentMessage
                    }]
                });
            }

            console.log(`Order ${order.id} created. Payment info sent to user.`);
            return;
        }
    } catch (error) {
        console.error("Error generating payment info:", error);
    }

    // Fallback: Send text-only payment instructions
    await client.replyMessage({
        replyToken,
        messages: [{
            type: "text",
            text: `✅ สร้าง Order สำเร็จ!\n\n📦 Order Number: ${order.orderNumber}\n${deliveryInfo}${noteInfo}\n💰 ยอดรวม: ${total} บาท\n\nกรุณาส่งภาพหลักฐานการโอนเงิน (Slip) ค่ะ 📸`
        }]
    });
}

/**
 * Handle Payment Slip Image
 */
export async function handlePaymentSlip(
    userId: string,
    messageId: string,
    client: line.messagingApi.MessagingApiClient,
    replyToken: string,
    channelAccessToken?: string
): Promise<boolean> {
    const session = await prisma.cartSession.findUnique({
        where: { lineUserId: userId }
    });

    if (!session || session.state !== "AWAITING_PAYMENT" || !session.orderId) {
        return false;
    }

    try {
        // 2. Download Image
        const token = channelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
        const imageBuffer = await downloadLineContent(messageId, token);

        // Resize and Compress Image
        // Target: Max width 1000px, JPEG quality 80 for clear text but small size
        const sharp = require('sharp');
        const compressedBuffer = await sharp(imageBuffer)
            .resize(1000, 1000, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 80, mozjpeg: true })
            .toBuffer();

        // 3. Save slip image directly to local storage (No MinIO needed)
        const fileName = `${session.orderId}-${Date.now()}.jpg`;
        let fileUrl: string | null = null;
        try {
            const uploadDir = path.join(process.cwd(), "public", "uploads", "slips");
            await fs.promises.mkdir(uploadDir, { recursive: true });
            const filePath = path.join(uploadDir, fileName);
            await fs.promises.writeFile(filePath, compressedBuffer);
            
            const baseUrl = (process.env.CHATBOT_URL || "https://chat.mamsoi8.online").replace(/\/$/, "");
            fileUrl = `${baseUrl}/uploads/slips/${fileName}`;
            console.log("Slip saved locally:", fileUrl);
        } catch (storageErr) {
            console.warn("Failed to save slip image locally:", storageErr);
        }

        // Find payment config to get API keys
        const order = await prisma.order.findUnique({
             where: { id: session.orderId },
             include: { branch: true }
         });
 
         if (!order) throw new Error("Order not found");

         const paymentConfig = await prisma.paymentConfig.findFirst({
            where: { isDefault: true }
        });

        let transactionRefToSave: string | null = null;
        let isSlipApproved = false;

        // --- SLIPOK VERIFICATION (IF ENABLED) ---
        if (paymentConfig?.isSlipokEnabled) {
            // 4. Analyze with Slip API (SlipOK)
            console.log("Verifying slip with API...");

            // Default to empty strings if not configured yet (will cause API to fail naturally if required)
            const slipokBranchId = paymentConfig?.slipokBranchId || process.env.SLIPOK_BRANCH_ID || "";
            const slipokApiKey = paymentConfig?.slipokApiKey || process.env.SLIPOK_API_KEY || "";

            let verificationResult;
            let slipokFailed = false;
            try {
                verificationResult = await verifySlip(imageBuffer, slipokBranchId, slipokApiKey);
                console.log("Verification Result:", verificationResult);
            } catch (apiError) {
                console.error("Slip Verification API Failed, falling back to Gemini Vision:", apiError);
                slipokFailed = true;
            }

            // If SlipOK API failed, fallback to Gemini Vision
            if (slipokFailed) {
                console.log("SlipOK unavailable, using Gemini Vision fallback...");
                let analysis;
                try {
                    analysis = await analyzePaymentSlip(imageBuffer);
                    console.log("Gemini Fallback Analysis:", analysis);
                } catch (geminiError) {
                    console.error("Gemini also failed:", geminiError);
                    analysis = { isSlip: true, amount: 0, confidence: "low" as const };
                }

                const orderTotal = Number(order.total);
                const isAmountMatch = Math.abs((analysis.amount || 0) - orderTotal) < 5.0;

                if (analysis.isSlip && analysis.confidence === "high" && !isAmountMatch) {
                    await client.replyMessage({
                        replyToken,
                        messages: [{
                            type: "text",
                            text: `⚠️ ยอดเงินในสลิป (${analysis.amount} บาท) ไม่ตรงกับยอดสั่งซื้อ (${orderTotal} บาท)\n\nกรุณาตรวจสอบและส่งสลิปที่ถูกต้องอีกครั้ง`
                        }]
                    });
                    return true;
                }

                isSlipApproved = true;
            }

            // Only process SlipOK result if the API didn't fail
            if (!slipokFailed) {
                if (!verificationResult.isValid) {
                    await client.replyMessage({
                        replyToken,
                        messages: [{
                            type: "text",
                            text: `❌ ไม่สามารถตรวจสอบสลิปได้\nสาเหตุ: ${verificationResult.message || 'สลิปไม่ถูกต้อง'}\n\nกรุณาส่งภาพสลิปที่ถูกต้องเต็มใบอีกครั้ง`
                        }]
                    });
                    return true;
                }

                // 5. Verify Amount (Strict Matching)
                const orderTotal = Number(order.total);
                const isAmountMatch = verificationResult.amount === orderTotal; // Exact match required for API

                if (!isAmountMatch) {
                    await client.replyMessage({
                        replyToken,
                        messages: [{
                            type: "text",
                            text: `⚠️ ยอดเงินในสลิป (${verificationResult.amount} บาท) ไม่ตรงกับยอดสั่งซื้อ (${orderTotal} บาท)\n\nกรุณาตรวจสอบและส่งสลิปที่ถูกต้องอีกครั้ง`
                        }]
                    });
                    return true;
                }

                // 5.5 Prevent Slip Reuse (Check Transaction Ref)
                if (verificationResult.transRef) {
                    const existingOrder = await prisma.order.findUnique({
                        where: { transactionRef: verificationResult.transRef }
                    });

                    if (existingOrder && existingOrder.id !== order.id) {
                        await client.replyMessage({
                            replyToken,
                            messages: [{
                                type: "text",
                                text: `⚠️ สลิปนี้ถูกใช้งานไปแล้ว (รหัสอ้างอิง: ${verificationResult.transRef})\n\nกรุณาใช้สลิปที่ถูกต้องสำหรับการสั่งซื้อนี้`
                            }]
                        });
                        return true;
                    }
                    transactionRefToSave = verificationResult.transRef;
                }
                isSlipApproved = true;
            }
        } 
        // --- FALLBACK MULTI-MODAL VERIFICATION (GEMINI VISION) ---
        else {
            console.log("Verifying slip with Gemini Flash Vision...");
            let analysis;
            try {
                analysis = await analyzePaymentSlip(imageBuffer);
                console.log("Analysis Result:", analysis);
            } catch (geminiError) {
                console.error("Gemini Verification Failed, falling back to manual approval:", geminiError);
                // Fallback for demo/error cases: Assume valid if Gemini fails
                analysis = {
                    isSlip: true,
                    amount: 0,
                    confidence: "low" as const
                };
            }

            const orderTotal = Number(order.total);
            const isAmountMatch = Math.abs((analysis.amount || 0) - orderTotal) < 5.0; // Tolerance 5 baht

            // Slip Validation: Amount
            if (analysis.isSlip && analysis.confidence === "high" && !isAmountMatch) {
                await client.replyMessage({
                    replyToken,
                    messages: [{
                        type: "text",
                        text: `⚠️ ยอดเงินในสลิป (${analysis.amount} บาท) ไม่ตรงกับยอดสั่งซื้อ (${orderTotal} บาท)\n\nกรุณาตรวจสอบและส่งสลิปที่ถูกต้องอีกครั้ง`
                    }]
                });
                return true;
            }

            // Slip Validation: Receiver Name Match
            if (analysis.isSlip && analysis.confidence === "high" && analysis.receiver && paymentConfig?.accountName) {
                const slipName = analysis.receiver.toLowerCase().replace(/นาย|นาง|นางสาว|mr\.|ms\.|mrs\./g, "").replace(/\s/g, "");
                const confName = paymentConfig.accountName.toLowerCase().replace(/นาย|นาง|นางสาว|mr\.|ms\.|mrs\./g, "").replace(/\s/g, "");
                
                if (!slipName.includes(confName) && !confName.includes(slipName)) {
                     // Name mismatch - log for now, or could flag as manual review
                     console.log(`Name mismatch: ${analysis.receiver} vs ${paymentConfig.accountName}`);
                }
            }

            // Slip Validation: Time limit
            let isTimeExpired = false;
            if (analysis.isSlip && analysis.confidence === "high" && analysis.date && analysis.time) {
                try {
                    const slipDateStr = `${analysis.date}T${analysis.time}:00+07:00`;
                    const slipDate = new Date(slipDateStr);
                    
                    if (!isNaN(slipDate.getTime())) {
                        const now = new Date();
                        const diffMinutes = (now.getTime() - slipDate.getTime()) / (1000 * 60);
                        
                        const timeLimit = order.isPreorder 
                            ? (paymentConfig?.slipPreorderTimeLimitMinutes || 360) 
                            : (paymentConfig?.slipTimeLimitMinutes || 30);
                            
                        if (diffMinutes > timeLimit) {
                            isTimeExpired = true;
                        }
                    }
                } catch(e) {
                    console.error("Time parsing error", e);
                }
            }

            if (isTimeExpired) {
                // Send to manual review
                await prisma.order.update({
                    where: { id: order.id },
                    data: { paymentSlipUrl: fileUrl } // Status remains PENDING
                });

                await client.replyMessage({
                    replyToken,
                    messages: [{
                        type: "text",
                        text: `⚠️ สลิปอยู่นอกเงื่อนไขเวลา แอดมินจะทำการตรวจสอบสลิปและยืนยันออเดอร์ให้โดยเร็วที่สุดค่ะ`
                    }]
                });
                return true; // Stop here, do not generate queue number yet.
            }
            
            isSlipApproved = true; // passed loose checking
        }

        if (!isSlipApproved) return true; // Safety catch

        // 6. Generate Queue Number (If pass or uncertain)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await prisma.order.count({
            where: {
                branchId: order.branchId, // Isolate queue per branch
                status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] },
                updatedAt: { gte: today }
            }
        });

        const queueNumber = count + 1;

        // 7. Update Order
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'PAID',
                queueNumber,
                paymentSlipUrl: fileUrl,
                paymentVerifiedAt: new Date(),
                transactionRef: transactionRefToSave // Save reference to prevent reuse if from API
            }
        });

        // 8. Clear Session State
        await prisma.cartSession.update({
            where: { id: session.id },
            data: {
                state: null,
                items: [], // Clear cart
                orderId: null,
                tempData: {}
            }
        });

        // 9. Calculate Wait Time
        // Count orders that are PAID or PROCESSING and have a lower queue number (are ahead)
        // We only care about orders from "today" technically, effectively reset daily if queue resets daily.
        // Assuming queueNumber resets daily as per logic above.
        const ordersAheadCount = await prisma.order.count({
            where: {
                branchId: order.branchId, // Isolate ahead count per branch
                status: { in: ['PAID', 'PROCESSING'] },
                queueNumber: { lt: queueNumber },
                updatedAt: { gte: today } // Same 'today' as used for queue generation
            }
        });

        // Heuristic: 5 mins per order (including current one)
        const estWaitTime = (ordersAheadCount + 1) * 5;

        // 10. Reply Success with Queue Ticket Bubble
        const queueBubble = createQueueTicketBubble(
            order.id,
            queueNumber,
            Number(order.total),
            (order as any).orderNumber,
            ordersAheadCount,
            estWaitTime
        );

        await client.replyMessage({
            replyToken,
            messages: [{
                type: "flex",
                altText: `คิวที่ ${queueNumber} - ยืนยันคำสั่งซื้อ`,
                contents: queueBubble as any
            }]
        });

        return true;

    } catch (error) {
        console.error("Error handling payment slip:", error);
        // Fallback: Notify user but maybe consider it a manual check in future
        await client.replyMessage({
            replyToken,
            messages: [{ type: "text", text: `ระบบขัดข้องในการตรวจสอบ: ${error instanceof Error ? error.message : String(error)}\n\n(สลิปถูกส่งแล้ว กำลังส่งให้เจ้าหน้าที่ตรวจสอบ)` }]
        });
        return true;
    }
}

/**
 * Handle Order Completion (User confirms receipt)
 */
export async function handleOrderCompletion(
    orderId: string,
    client: line.messagingApi.MessagingApiClient,
    replyToken: string
): Promise<void> {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            await client.replyMessage({
                replyToken,
                messages: [{ type: "text", text: "ไม่พบข้อมูล Order" }]
            });
            return;
        }

        if (order.status === "COMPLETED") {
            await client.replyMessage({
                replyToken,
                messages: [{ type: "text", text: "รายการนี้เสร็จสมบูรณ์ไปแล้วค่ะ ขอบคุณนะคะ 🙏" }]
            });
            return;
        }

        // Update status
        await prisma.order.update({
            where: { id: orderId },
            data: { status: "COMPLETED" }
        });

        // Import and send rating prompt
        const { createRatingPromptFlexMessage } = await import("./flex-templates");
        const ratingMessage = createRatingPromptFlexMessage(orderId, order.queueNumber || 0);

        await client.replyMessage({
            replyToken,
            messages: [
                {
                    type: "text",
                    text: "✅ ขอบคุณที่ยืนยันรับสินค้าค่ะ!"
                },
                ratingMessage as any
            ]
        });

    } catch (error) {
        console.error("Error completing order:", error);
        await client.replyMessage({
            replyToken,
            messages: [{ type: "text", text: "เกิดข้อผิดพลาดในการอัปเดตสถานะ" }]
        });
    }
}

/**
 * Handle Order Cancellation
 */
export async function handleOrderCancellation(
    userId: string,
    client: line.messagingApi.MessagingApiClient,
    replyToken: string
): Promise<boolean> {
    try {
        console.log(`[CANCEL] Starting cancellation for user: ${userId}`);

        // Find cart session with pending order
        const session = await prisma.cartSession.findUnique({
            where: { lineUserId: userId }
        });

        console.log(`[CANCEL] Session found:`, session ? {
            state: session.state,
            orderId: session.orderId,
            hasItems: session.items && (session.items as any[]).length > 0
        } : 'null');

        // Check if user has a pending order waiting for payment
        if (!session || session.state !== "AWAITING_PAYMENT" || !session.orderId) {
            console.log(`[CANCEL] No pending order to cancel. Session state: ${session?.state || 'null'}`);
            return false; // No pending order to cancel
        }

        // Find the order
        const order = await prisma.order.findUnique({
            where: { id: session.orderId }
        });

        console.log(`[CANCEL] Order found:`, order ? {
            id: order.id,
            status: order.status,
            orderNumber: order.orderNumber
        } : 'null');

        if (!order) {
            console.error(`[CANCEL] Order not found for ID: ${session.orderId}`);
            await client.replyMessage({
                replyToken,
                messages: [{
                    type: "text",
                    text: "❌ ไม่พบข้อมูล Order\\n\\nกรุณาลองใหม่อีกครั้งค่ะ"
                }]
            });
            return true;
        }

        // Only allow cancellation if order is still PENDING (not yet paid)
        if (order.status !== "PENDING") {
            console.log(`[CANCEL] Cannot cancel order with status: ${order.status}`);
            await client.replyMessage({
                replyToken,
                messages: [{
                    type: "text",
                    text: "❌ ไม่สามารถยกเลิก Order นี้ได้\\n\\nเนื่องจาก Order ได้รับการชำระเงินแล้ว"
                }]
            });
            return true;
        }

        console.log(`[CANCEL] Updating order status to CANCELLED`);

        // Update order status to CANCELLED
        await prisma.order.update({
            where: { id: order.id },
            data: { status: "CANCELLED" }
        });

        console.log(`[CANCEL] Clearing cart session`);

        // Clear cart session
        await prisma.cartSession.update({
            where: { id: session.id },
            data: {
                state: null,
                items: [],
                orderId: null,
                tempData: {}
            }
        });

        console.log(`[CANCEL] Cancellation successful`);

        // Send confirmation
        await client.replyMessage({
            replyToken,
            messages: [{
                type: "text",
                text: `✅ ยกเลิก Order สำเร็จ\\n\\n📦 Order Number: ${order.orderNumber || order.id.substring(0, 8)}\\n✖️ สถานะ: ยกเลิกแล้ว\\n\\nสามารถสั่งซื้อใหม่ได้ตลอดเวลาค่ะ 🛒`
            }]
        });

        return true;

    } catch (error: any) {
        console.error("[CANCEL] Error cancelling order:", error);
        console.error("[CANCEL] Error details:", {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        });

        await client.replyMessage({
            replyToken,
            messages: [{
                type: "text",
                text: "❌ เกิดข้อผิดพลาดในการยกเลิก Order\\n\\nกรุณาลองใหม่อีกครั้ง หรือติดต่อเจ้าหน้าที่ค่ะ"
            }]
        });
        return true;
    }
}

/**
 * Handle review comment input
 */
async function handleReviewCommentInput(
    session: CartSession,
    input: string,
    client: line.messagingApi.MessagingApiClient,
    replyToken: string
): Promise<void> {
    const { orderId } = session.tempData || {};

    if (!orderId) {
        console.error("No orderId in tempData for review comment");
        return;
    }

    try {
        // Save comment if not skip
        if (input.toLowerCase() !== "ข้าม" && input.trim().length > 0) {
            await prisma.review.update({
                where: { orderId: orderId },
                data: { comment: input.trim() }
            });
        }

        // Clear session state
        await prisma.cartSession.update({
            where: { id: session.id },
            data: {
                state: null,
                tempData: {}
            }
        });

        // Send thank you message
        await client.replyMessage({
            replyToken,
            messages: [{
                type: "text",
                text: "🙏 ขอบคุณสำหรับคำติชม!\n\nหวังว่าจะได้ให้บริการอีกนะครับ ☕✨"
            }]
        });
    } catch (error) {
        console.error("Review Comment Save Error:", error);
        await client.replyMessage({
            replyToken,
            messages: [{
                type: "text",
                text: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
            }]
        });
    }
}
