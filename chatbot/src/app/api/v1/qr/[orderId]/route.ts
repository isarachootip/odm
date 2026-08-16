import { NextResponse } from "next/server";
import { generatePromptPayQR } from "@/lib/promptpay";
import { prisma } from "@/lib/db";

export async function GET(request: Request, props: { params: Promise<{ orderId: string }> }) {
    try {
        const params = await props.params;
        const rawOrderId = params.orderId;
        
        if (!rawOrderId) {
            return new NextResponse("Missing orderId", { status: 400 });
        }

        // Remove .png extension if present (required by LINE API)
        const orderId = rawOrderId.replace(/\.png$/, '');

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        const paymentConfig = await prisma.paymentConfig.findFirst({
            where: { isDefault: true },
            orderBy: { createdAt: 'desc' }
        });

        if (!paymentConfig || paymentConfig.paymentType !== "PROMPTPAY" || !paymentConfig.promptpayNumber) {
            return new NextResponse("PromptPay not configured", { status: 404 });
        }

        const buffer = await generatePromptPayQR(paymentConfig.promptpayNumber, Number(order.total));

        // Convert Node Buffer to Web-standard Uint8Array (fixes standalone serialization bug)
        const uint8Array = new Uint8Array(buffer);

        return new NextResponse(uint8Array, {
            status: 200,
            headers: {
                "Content-Type": "image/png",
                "Content-Length": buffer.length.toString(),
                "Cache-Control": "public, max-age=31536000, immutable"
            }
        });
    } catch (error) {
        console.error("Failed to generate QR code:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
