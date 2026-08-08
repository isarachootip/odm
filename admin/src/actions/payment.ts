"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import path from "path";
import { uploadToMinIO } from "@/lib/minio";

export async function uploadSlip(orderId: string, formData: FormData) {
    try {
        const file = formData.get("slip") as File;
        if (!file) {
            return { error: "No file uploaded" };
        }

        const ext = path.extname(file.name) || ".jpg";
        const fileName = `${orderId}-${Date.now()}${ext}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to MinIO under 'slips' folder
        const fileKey = `slips/${fileName}`;
        const fileUrl = await uploadToMinIO(buffer, fileKey, file.type || "image/jpeg");

        // Auto-approve for Demo: Set status to PAID and generate Queue Number
        // Queue Number: Simple increment or random for demo
        const queueNumber = Math.floor(100 + Math.random() * 900); // 100-999

        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentSlipUrl: fileUrl,
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
