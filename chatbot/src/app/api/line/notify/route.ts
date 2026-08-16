import { NextRequest, NextResponse } from "next/server";
import { messagingApi } from "@line/bot-sdk";
import { prisma } from "@/lib/db";

const { MessagingApiClient } = messagingApi;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { lineUserId, message, type, orderId, orderNumber } = body;

        console.log("Notification Request:", body);

        if (!lineUserId) {
            return NextResponse.json({ error: "Missing lineUserId" }, { status: 400 });
        }

        // Dynamically resolve LINE access token from order's branch (multi-branch support)
        let channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";

        if (orderId) {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: { branch: true }
            });
            if (order?.branch?.lineChannelAccessToken) {
                channelAccessToken = order.branch.lineChannelAccessToken;
            }
        }

        const client = new MessagingApiClient({ channelAccessToken });

        if (type === "READY") {
            // "Food Ready" Notification
            await client.pushMessage({
                to: lineUserId,
                messages: [
                    {
                        type: "text",
                        text: `🔔 ออเดอร์ของท่านเสร็จแล้วครับ! (Order #${orderNumber || orderId})\n\n🥡 เชิญรับอาหารได้ที่เคาน์เตอร์ครับ\n\n(เมื่อรับแล้ว กรุณากดยืนยันในข้อความถัดไปเพื่อสะสมแต้มครับ)`
                    },
                    {
                        type: "template",
                        altText: "ยืนยันการรับสินค้า",
                        template: {
                            type: "buttons",
                            text: "ได้รับอาหารแล้วหรือยังครับ?",
                            actions: [
                                {
                                    type: "postback",
                                    label: "✅ ได้รับแล้ว (สะสมแต้ม)",
                                    data: `action=receive&orderId=${orderId}`
                                }
                            ]
                        }
                    }
                ]
            });
        } else {
            // General Notification
            await client.pushMessage({
                to: lineUserId,
                messages: [{ type: "text", text: message || "มีการแจ้งเตือนจากระบบ" }]
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error sending notification:", error);
        return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
    }
}
