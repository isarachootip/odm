"use server";

import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function uploadSlip(orderId: string, formData: FormData) {
    try {
        const file = formData.get("slip") as File;
        if (!file) {
            return { error: "No file uploaded" };
        }

        // Upload to Vercel Blob
        const blob = await put(`slips/${orderId}-${file.name}`, file, {
            access: "public",
        });

        // Auto-approve for Demo: Set status to PAID and generate Queue Number
        // Queue Number: Simple increment or random for demo
        const queueNumber = Math.floor(100 + Math.random() * 900); // 100-999

        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentSlipUrl: blob.url,
                status: "PAID",
                paymentVerifiedAt: new Date(),
                queueNumber: queueNumber
            },
        });

        revalidatePath(`/checkout/success/${orderId}`);
        return { success: true };

    } catch (error) {
        console.error("Upload failed:", error);
        return { error: "Upload failed" };
    }
}
