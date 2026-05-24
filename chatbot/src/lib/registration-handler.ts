import { prisma } from "./db";
import * as line from "@line/bot-sdk";
import { createCarousel, createCategoryBubble } from "./flex-templates";

type CartSession = {
    id: string;
    lineUserId: string;
    items: any;
    state: string | null;
    tempData: any;
    orderId: string | null;
    branchCode: string | null;
};

// Helper to get categories carousel
export async function getCategoriesCarousel() {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { Product: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        const bubbles = categories.map((c) => {
            return createCategoryBubble({
                name: c.name,
                image: c.image,
                count: c._count.Product
            });
        });

        return createCarousel(bubbles);
    } catch (e) {
        console.error("Error fetching categories:", e);
        return null;
    }
}

export async function handleRegistrationFlow(
    userId: string,
    userMessage: string,
    client: line.messagingApi.MessagingApiClient,
    replyToken: string,
    session: CartSession
): Promise<boolean> {
    const state = session.state;

    try {
        if (state === "AWAITING_REGISTRATION_CONSENT") {
            if (userMessage === "อนุญาต") {
                await prisma.customerProfile.upsert({
                    where: { lineUserId: userId },
                    update: { isConsent: true },
                    create: { lineUserId: userId, isConsent: true }
                });

                await prisma.cartSession.update({
                    where: { id: session.id },
                    data: { state: "AWAITING_REGISTRATION_NAME" }
                });

                await client.replyMessage({
                    replyToken,
                    messages: [{ type: "text", text: "กรุณาพิมพ์ชื่อ - นามสกุลของคุณครับ 📝" }]
                });
            } else if (userMessage === "ไม่อนุญาต") {
                await prisma.customerProfile.upsert({
                    where: { lineUserId: userId },
                    update: { isConsent: false },
                    create: { lineUserId: userId, isConsent: false }
                });

                await prisma.cartSession.update({
                    where: { id: session.id },
                    data: { state: "AWAITING_REGISTRATION_DUMMY_NAME" }
                });

                await client.replyMessage({
                    replyToken,
                    messages: [{ type: "text", text: "กรุณาพิมพ์ชื่อเล่น หรือนามแฝง เพื่อใช้ในการเรียกคิวครับ 📝" }]
                });
            } else {
                await client.replyMessage({
                    replyToken,
                    messages: [{
                        type: "text",
                        text: "กรุณาเลือก อนุญาต หรือ ไม่อนุญาต ผ่านปุ่มด้านล่างครับ",
                        quickReply: {
                            items: [
                                { type: "action", action: { type: "message", label: "❌ ไม่อนุญาต", text: "ไม่อนุญาต" } },
                                { type: "action", action: { type: "message", label: "✅ อนุญาต", text: "อนุญาต" } }
                            ]
                        }
                    }]
                });
            }
            return true;
        }

        if (state === "AWAITING_REGISTRATION_NAME") {
            const name = userMessage.trim();
            if (!name) return true;

            const tempData = { ...(session.tempData || {}), regName: name };

            await prisma.cartSession.update({
                where: { id: session.id },
                data: {
                    state: "AWAITING_REGISTRATION_FACULTY",
                    tempData: tempData as any
                }
            });

            await client.replyMessage({
                replyToken,
                messages: [{
                    type: "text",
                    text: "กรุณาพิมพ์คณะของคุณครับ 🎓\n(หากไม่ระบุ สามารถกดปุ่ม วิศวะ ได้เลยครับ)",
                    quickReply: {
                        items: [
                            { type: "action", action: { type: "message", label: "⚙️ วิศวะ", text: "วิศวะ" } }
                        ]
                    }
                }]
            });
            return true;
        }

        if (state === "AWAITING_REGISTRATION_FACULTY") {
            const faculty = userMessage.trim();
            if (!faculty) return true;

            const tempData = { ...(session.tempData || {}), regFaculty: faculty };

            await prisma.cartSession.update({
                where: { id: session.id },
                data: {
                    state: "AWAITING_REGISTRATION_PHONE",
                    tempData: tempData as any
                }
            });

            await client.replyMessage({
                replyToken,
                messages: [{ type: "text", text: "กรุณาระบุเบอร์โทรศัพท์ของคุณครับ 📱" }]
            });
            return true;
        }

        if (state === "AWAITING_REGISTRATION_PHONE") {
            const phone = userMessage.trim();
            if (!phone) return true;

            const tempData = session.tempData as any;
            const regName = tempData?.regName || "ไม่ระบุชื่อ";
            const regFaculty = tempData?.regFaculty || "วิศวะ";

            await prisma.customerProfile.update({
                where: { lineUserId: userId },
                data: {
                    nickname: regName,
                    phone: phone,
                    department: regFaculty
                }
            });

            // Clear registration state and give points message
            await prisma.cartSession.update({
                where: { id: session.id },
                data: {
                    state: null,
                    tempData: {} // Clear tempData
                }
            });

            const carousel = await getCategoriesCarousel();
            const messages: any[] = [{ type: "text", text: "ลงทะเบียนสำเร็จ 🎉 ขอบคุณครับ\n(คุณได้รับคะแนนสะสม 100 คะแนนเรียบร้อยแล้ว)\n\nสนใจรับอะไรดีคะ? กดดูเมนูได้เลย 👇" }];
            if (carousel) messages.push(carousel);

            await client.replyMessage({
                replyToken,
                messages: messages
            });

            return true;
        }

        if (state === "AWAITING_REGISTRATION_DUMMY_NAME") {
            const nickname = userMessage.trim();
            if (!nickname) return true;

            await prisma.customerProfile.update({
                where: { lineUserId: userId },
                data: {
                    nickname: nickname,
                    phone: "0000000000" // Dummy phone
                }
            });

            // Clear registration state
            await prisma.cartSession.update({
                where: { id: session.id },
                data: {
                    state: null,
                    tempData: {} // Clear tempData
                }
            });

            const carousel = await getCategoriesCarousel();
            const messages: any[] = [{ type: "text", text: "บันทึกข้อมูลเรียบร้อยครับ 👍\n\nสนใจรับอะไรดีคะ? กดดูเมนูได้เลย 👇" }];
            if (carousel) messages.push(carousel);

            await client.replyMessage({
                replyToken,
                messages: messages
            });

            return true;
        }

    } catch (error) {
        console.error("Error in registration flow:", error);
        await client.replyMessage({
            replyToken,
            messages: [{ type: "text", text: "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง หรือพิมพ์ 'ยกเลิก'" }]
        });
        return true;
    }

    return false;
}
