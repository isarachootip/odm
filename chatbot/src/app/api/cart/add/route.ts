
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { Product } from "@prisma/client";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, productId, quantity, selections, orderType, note, branchCode } = body;

        if (!userId || !productId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Get or Create Cart Session
        let session = await prisma.cartSession.findUnique({
            where: { lineUserId: userId }
        });

        if (!session) {
            session = await prisma.cartSession.create({
                data: {
                    lineUserId: userId,
                    items: [],
                    state: "BROWSING", // Should be browsing if just adding to cart
                    branchCode: branchCode || "odm"
                }
            });
        } else {
            // Update branch code if missing or changed
            if (branchCode && session.branchCode !== branchCode) {
                await prisma.cartSession.update({
                    where: { id: session.id },
                    data: { branchCode: branchCode }
                });
            }
        }

        // 2. Fetch Product to get current price and info
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // 3. Construct Cart Item
        // We need to match the structure used in `checkout-handler.ts`/`route.ts`
        // Item Structure:
        // {
        //   productId: string,
        //   name: string,
        //   price: number, // Unit price (base + options)
        //   quantity: number,
        //   selectedOptions: Record<string, any>
        //   note: string
        // }

        // 3.1 Calculate Unit Price (Base + Options)
        let unitPrice = Number(product.price);
        const specs = product.specifications as any;

        if (specs && specs.options) {
            specs.options.forEach((opt: any) => {
                const selectedVal = selections[opt.id];
                if (selectedVal) {
                    if (Array.isArray(selectedVal)) {
                        selectedVal.forEach((val: string) => {
                            const choice = opt.choices.find((c: any) => c.value === val);
                            if (choice && choice.price) unitPrice += choice.price;
                        });
                    } else {
                        const choice = opt.choices.find((c: any) => c.value === selectedVal);
                        if (choice && choice.price) unitPrice += choice.price;
                    }
                }
            });
        }

        // 3.2 Prepare Options Object
        // Combine selections, orderType, and note into a single options object for storage
        // The `checkout-handler.ts` expects `selectedOptions` to be generic.
        // We will store:
        // - selections (User Choices)
        // - Order Type
        // - Note

        // We need to format `selections` to be human readable values for existing `checkout-handler`?
        // `checkout-handler` just dumps key-value. 
        // So we should probably convert "value codes" (e.g. 'mild') to "labels" (e.g. 'เผ็ดน้อย') before saving?
        // YES, otherwise the receipt will show 'mild'.

        const friendlyOptions: Record<string, string> = {
            "Type": orderType === "PLATE" ? "ใส่จาน" : orderType === "BOX" ? "ใส่กล่อง" : "เดลิเวอรี่"
        };

        if (note) friendlyOptions["Note"] = note;

        if (specs && specs.options) {
            specs.options.forEach((opt: any) => {
                const selectedVal = selections[opt.id];
                if (selectedVal) {
                    if (Array.isArray(selectedVal)) {
                        const labels = selectedVal.map((val: string) => {
                            const choice = opt.choices.find((c: any) => c.value === val);
                            return choice ? choice.label : val;
                        });
                        friendlyOptions[opt.label] = labels.join(", ");
                    } else {
                        const choice = opt.choices.find((c: any) => c.value === selectedVal);
                        friendlyOptions[opt.label] = choice ? choice.label : selectedVal;
                    }
                }
            });
        }

        const newItem = {
            productId: product.id,
            name: product.name,
            price: unitPrice,
            quantity: quantity,
            selectedOptions: friendlyOptions,
            image: product.images && product.images.length > 0 ? product.images[0] : null
        };

        // 4. Update Cart
        const currentItems = (session.items as any[]) || [];
        const updatedItems = [...currentItems, newItem];

        await prisma.cartSession.update({
            where: { id: session.id },
            data: { items: updatedItems }
        });

        // 5. Send a message to LINE to notify user
        try {
            const line = require("@line/bot-sdk");
            const { createCartBubble } = require("../../../../lib/flex-templates");

            // Try fetching branch config from db
            let channelToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_ACCESS_TOKEN || "";
            if (branchCode) {
                const branchObj = await prisma.branch.findUnique({ where: { code: branchCode.toUpperCase() } });
                if (branchObj && branchObj.lineChannelAccessToken) {
                    channelToken = branchObj.lineChannelAccessToken;
                }
            }

            const client = new line.messagingApi.MessagingApiClient({
                channelAccessToken: channelToken
            });

            const bubble = createCartBubble(updatedItems);

            await client.pushMessage({
                to: userId,
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
                                    { type: "text", text: `ในตะกร้ามี ${updatedItems.length} รายการ`, size: "xs", color: "#888888", margin: "sm" }
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
        } catch (lineErr) {
            console.error("Failed to push LINE message after adding to cart:", lineErr);
            // Non-fatal, return success anyway
        }

        return NextResponse.json({ success: true, cartItem: newItem });

    } catch (error) {
        console.error("Cart Add Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
