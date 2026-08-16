"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            throw new Error("Unauthorized");
        }

        // Get order details INCLUDING delivery info and branch token
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                queueNumber: true,
                lineUserId: true,
                status: true,
                deliveryType: true,
                deliveryLocation: true,
                paymentSlipUrl: true,
                branch: {
                    select: {
                        lineChannelAccessToken: true
                    }
                }
            }
        });

        if (!order) {
            throw new Error("Order not found");
        }

        // Update status
        await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        });

        // Send LINE push notification if order is ready (SHIPPED or COMPLETED)
        if (["SHIPPED", "COMPLETED"].includes(newStatus) && order.lineUserId) {
            const LINE_ACCESS_TOKEN = order.branch?.lineChannelAccessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;

            if (LINE_ACCESS_TOKEN) {
                let messagePayload: any = null;

                if (newStatus === "SHIPPED") {
                    let textMsg = "";
                    if (order.deliveryType === 'PICKUP') {
                        textMsg = "🏬 สินค้าพร้อมแล้ว กรุณามารับที่เคาน์เตอร์ได้เลยค่ะ ☕";
                    } else if (order.deliveryType === 'DELIVERY') {
                        const location = order.deliveryLocation || 'จุดนัดหมาย';
                        textMsg = `🛵 ไรเดอร์กำลังนำส่งไปที่: ${location}\nรอรับโทรศัพท์จากไรเดอร์นะคะ 📞`;
                    } else {
                        textMsg = "จัดส่งสินค้าเรียบร้อยแล้วค่ะ";
                    }

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
                                        text: `🎉 คิวที่ #${order.queueNumber} ปรุงเสร็จแล้ว!`,
                                        weight: "bold",
                                        size: "lg",
                                        color: "#EAB308"
                                    },
                                    {
                                        type: "text",
                                        text: textMsg,
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
                } else if (newStatus === "COMPLETED") {
                    messagePayload = {
                        type: "text",
                        text: `🎉 คิวที่ #${order.queueNumber} เสร็จเรียบร้อย!\n\n✅ ออเดอร์ของคุณเสร็จสมบูรณ์ ขอบคุณที่ใช้บริการค่ะ 🙏`
                    };
                }

                if (messagePayload) {
                    try {
                        await fetch("https://api.line.me/v2/bot/message/push", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${LINE_ACCESS_TOKEN}`
                            },
                            body: JSON.stringify({
                                to: order.lineUserId,
                                messages: [messagePayload]
                            })
                        });
                        console.log(`Notification sent for order ${orderId} (${order.deliveryType})`);
                    } catch (error) {
                        console.error("Failed to send LINE notification:", error);
                    }
                }
            } else {
                console.warn("LINE_CHANNEL_ACCESS_TOKEN is missing in .env");
            }
        }

        revalidatePath("/admin/orders");
        revalidatePath(`/admin/orders/${orderId}`);

        return { success: true };
    } catch (error) {
        console.error("Update Order Status Error:", error);
        throw new Error("Failed to update order status");
    }
}
