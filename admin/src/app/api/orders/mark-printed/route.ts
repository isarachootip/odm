import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID required" }, { status: 400 });
        }

        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                labelPrintedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            labelPrintedAt: order.labelPrintedAt
        });

    } catch (error) {
        console.error("Error marking order as printed:", error);
        return NextResponse.json({ error: "Failed to update print status" }, { status: 500 });
    }
}
