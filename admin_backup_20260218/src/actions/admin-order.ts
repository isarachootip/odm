"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
        const session = await auth();

        // Strict Admin Check
        if (session?.user?.role !== "ADMIN") {
            return { error: "Unauthorized" };
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus },
        });

        // Notify Chatbot (Fire and Forget)
        try {
            // Using the chatbot's public URL (or internal header if on same Vercel network)
            // Replace with actual Chatbot URL
            const CHATBOT_URL = "https://joy-cafe.vercel.app";
            fetch(`${CHATBOT_URL}/api/internal/notify-status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status: newStatus })
            }).catch(e => console.error("Failed to notify chatbot:", e));
        } catch (e) {
            console.error("Notify Logic Error:", e);
        }

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath("/admin/orders");

        return { success: true };
    } catch (error) {
        console.error("Failed to update status:", error);
        return { error: "Failed to update status" };
    }
}
