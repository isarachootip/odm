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

        // Get order details INCLUDING delivery info
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                queueNumber: true,
                lineUserId: true,
                status: true,
                deliveryType: true,
                deliveryLocation: true,
                paymentSlipUrl: true // Added for debugging/reference if needed
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

        // Send LINE push notification if order is ready (SHIPPED)
        if (newStatus === "SHIPPED" && order.lineUserId) {
            const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

            if (LINE_ACCESS_TOKEN) {
                // Determine Message based on Delivery Type
                let message = `🎉 คิวที่ #${order.queueNumber} เสร็จเรียบร้อย!`;

                if (order.deliveryType === 'PICKUP') {
                    message += `\n\n🏬 สินค้าพร้อมแล้ว กรุณามารับที่เคาน์เตอร์ได้เลยค่ะ ☕`;
                } else if (order.deliveryType === 'DELIVERY') {
                    // Use deliveryLocation or fallback
                    const location = order.deliveryLocation || 'จุดนัดหมาย';
                    message += `\n\n🛵 ไรเดอร์กำลังนำส่งไปที่: ${location}\nรอรับโทรศัพท์จากไรเดอร์นะคะ 📞`;
                } else {
                    // Fallback for unknown type
                    message += `\n\nสินค้าพร้อมให้บริการแล้วค่ะ`;
                }

                try {
                    await fetch("https://api.line.me/v2/bot/message/push", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${LINE_ACCESS_TOKEN}`
                        },
                        body: JSON.stringify({
                            to: order.lineUserId,
                            messages: [{
                                type: "text",
                                text: message
                            }]
                        })
                    });
                    console.log(`Notification sent for order ${orderId} (${order.deliveryType})`);
                } catch (error) {
                    console.error("Failed to send LINE notification:", error);
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
