import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import * as line from "@line/bot-sdk";

// Configuration Fallbacks
const FALLBACK_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_ACCESS_TOKEN || "";
const FALLBACK_SECRET = process.env.LINE_CHANNEL_SECRET || "";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, name, department, phone } = body;

        if (!userId || !name || !phone) {
            return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน รบกวนกรอกชื่อและเบอร์โทร" }, { status: 400 });
        }

        // 1. Get Cart Session
        let session = await prisma.cartSession.findUnique({
            where: { lineUserId: userId }
        });

        if (!session) {
            // Cannot register if no cart session exists
            return NextResponse.json({ error: "ไม่พบตะกร้าสินค้า กรุณากลับไปเริ่มสร้างรายการใหม่" }, { status: 404 });
        }

        // 2. Fetch Branch Config to get the right API Keys
        // Joycafe had only 1 branch, but ODM is multi-branch.
        // The webhook normally sets the branchCode in the cartSession during "SHOPPING" phase.
        let channelAccessToken = FALLBACK_ACCESS_TOKEN;
        
        if (session.branchCode) {
            const branch = await prisma.branch.findUnique({
                where: { code: session.branchCode }
            });
            if (branch && branch.lineChannelAccessToken) {
                channelAccessToken = branch.lineChannelAccessToken;
            }
        }

        const client = new line.messagingApi.MessagingApiClient({
            channelAccessToken: channelAccessToken
        });

        // 3. Update temp data and advance state
        const tempData = { ...session.tempData as any, name, department, phone };

        await prisma.cartSession.update({
            where: { id: session.id },
            data: {
                state: "AWAITING_DELIVERY_TYPE",
                tempData: tempData as any
            }
        });

        // 4. Send Quick Reply to user
        try {
            const deptText = department ? ` ${department}` : "";
            const phoneText = phone ? ` ${phone}` : "";

            await client.pushMessage({
                to: userId,
                messages: [
                    {
                        type: "text",
                        text: `ลงทะเบียนเรียบร้อยค่ะ!\nสวัสดี คุณ ${name}${deptText}${phoneText} 👋`
                    },
                    {
                        type: "text",
                        text: "📦 เลือกวิธีการรับสินค้า:",
                        quickReply: {
                            items: [
                                {
                                    type: "action",
                                    action: {
                                        type: "message",
                                        label: "🏠 รับเอง (Pickup)",
                                        text: "รับเอง"
                                    }
                                },
                                {
                                    type: "action",
                                    action: {
                                        type: "message",
                                        label: "🥡 Takehome",
                                        text: "Takehome"
                                    }
                                },
                                {
                                    type: "action",
                                    action: {
                                        type: "message",
                                        label: "🚚 จัดส่ง (Delivery)",
                                        text: "จัดส่ง"
                                    }
                                }
                            ]
                        }
                    }
                ]
            });
        } catch (pushErr) {
            console.error("Failed to push message after registration:", pushErr);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Cart Register Error:", error);
        return NextResponse.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
    }
}
