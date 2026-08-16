import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import * as line from "@line/bot-sdk";

// Configuration Fallbacks
const FALLBACK_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_ACCESS_TOKEN || "";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, name, phone, address, landmark } = body;

        if (!userId || !name || !phone) {
            return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน รบกวนกรอกชื่อและเบอร์โทร" }, { status: 400 });
        }

        // 1. Get Cart Session
        let session = await prisma.cartSession.findUnique({
            where: { lineUserId: userId }
        });

        if (!session) {
            return NextResponse.json({ error: "ไม่พบตะกร้าสินค้า กรุณากลับไปเริ่มสร้างรายการใหม่" }, { status: 404 });
        }

        // 2. Save / Update CustomerProfile in DB
        await prisma.customerProfile.upsert({
            where: { lineUserId: userId },
            update: {
                isConsent: true,
                nickname: name,
                phone: phone,
                address: address || null,
                landmark: landmark || null
            },
            create: {
                lineUserId: userId,
                isConsent: true,
                nickname: name,
                phone: phone,
                address: address || null,
                landmark: landmark || null
            }
        });

        // 3. Fetch Branch Config to get the right API Keys
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

        // 4. Update temp data and advance state
        const locationText = [
            address ? `ซอย/ถนน: ${address}` : '',
            landmark ? `จุดสังเกต: ${landmark}` : ''
        ].filter(Boolean).join(", ");

        const tempData = {
            ...session.tempData as any,
            name,
            phone,
            address,
            landmark,
            location: locationText || undefined
        };

        await prisma.cartSession.update({
            where: { id: session.id },
            data: {
                state: "AWAITING_DELIVERY_TYPE",
                tempData: tempData as any
            }
        });

        // 5. Send Quick Reply to user
        try {
            await client.pushMessage({
                to: userId,
                messages: [
                    {
                        type: "text",
                        text: `🎉 ลงทะเบียนเรียบร้อยแล้วค่ะ!\nสวัสดี คุณ ${name} 👋 (${phone})`
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
                                        label: "🍽️ ทานที่ร้าน (Dine-in)",
                                        text: "ทานที่ร้าน"
                                    }
                                },
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
