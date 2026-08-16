import { NextResponse } from "next/server";
import * as line from "@line/bot-sdk";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId, status } = body;

        if (!orderId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { branch: true }
        });

        if (!order || !order.lineUserId) {
            return NextResponse.json({ message: "Order not found or not linked to LINE user" });
        }

        // Dynamically resolve LINE access token from branch config (multi-branch support)
        const channelAccessToken = order.branch?.lineChannelAccessToken
            || process.env.LINE_CHANNEL_ACCESS_TOKEN
            || "";

        if (!channelAccessToken) {
            console.error(`No LINE access token found for order ${orderId}, branch ${order.branchId}`);
            return NextResponse.json({ error: "LINE access token not configured" }, { status: 500 });
        }

        const client = new line.messagingApi.MessagingApiClient({
            channelAccessToken,
        });

        let messagePayload: any = null;
        switch (status) {
            case "COMPLETED":
                messagePayload = { type: "text", text: `✅ ออเดอร์ของคุณ (${order.queueNumber ? `คิวที่ ${order.queueNumber}` : `#${order.id.slice(-6)}`}) เสร็จสิ้นสมบูรณ์แล้วครับ ขอบคุณที่ใช้บริการ 🙏` };
                break;
            case "CANCELLED":
                messagePayload = { type: "text", text: `❌ ออเดอร์ #${order.id.slice(-6)} ของคุณถูกยกเลิก\nหากได้รับเงินคืนแล้ว หรือต้องการสอบถามเพิ่มเติม โปรดติดต่อร้านค้าครับ` };
                break;
            case "PROCESSING":
                messagePayload = { type: "text", text: `👨‍🍳 กำลังปรุงออเดอร์ #${order.id.slice(-6)} อยู่นะครับ รอสักครู่...` };
                break;
            case "SHIPPED":
                messagePayload = {
                    type: "flex",
                    altText: "อัปเดตสถานะออเดอร์: พร้อมรับสินค้า",
                    contents: {
                        type: "bubble",
                        body: {
                            type: "box",
                            layout: "vertical",
                            spacing: "md",
                            contents: [
                                {
                                    type: "text",
                                    text: `🎉 คิวที่ #${order.queueNumber || order.id.slice(-6)} ปรุงเสร็จแล้ว!`,
                                    weight: "bold",
                                    size: "lg",
                                    color: "#EAB308"
                                },
                                {
                                    type: "text",
                                    text: "🏬 สินค้าพร้อมแล้ว กรุณามารับที่เคาน์เตอร์ หรือรอรับการจัดส่งตามที่ระบุไว้ได้เลยค่ะ 🛵",
                                    wrap: true,
                                    size: "sm",
                                    color: "#666666"
                                }
                            ]
                        },
                        footer: {
                            type: "box",
                            layout: "vertical",
                            contents: [
                                {
                                    type: "text",
                                    text: "เมื่อได้รับสินค้าแล้ว กดปุ่มด้านล่าง",
                                    size: "xxs",
                                    color: "#888888",
                                    align: "center",
                                    margin: "none"
                                },
                                {
                                    type: "button",
                                    style: "primary",
                                    color: "#1DB446",
                                    margin: "md",
                                    height: "sm",
                                    action: {
                                        type: "postback",
                                        label: "ได้รับสินค้าแล้ว",
                                        data: `action=receive&orderId=${orderId}`,
                                        displayText: "ได้รับสินค้าแล้ว"
                                    }
                                }
                            ]
                        }
                    }
                };
                break;
            default:
                messagePayload = { type: "text", text: `ℹ️ อัปเดตสถานะออเดอร์ #${order.id.slice(-6)}: ${status}` };
                break;
        }

        // Push Message
        await client.pushMessage({
            to: order.lineUserId,
            messages: [messagePayload]
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Notify Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
