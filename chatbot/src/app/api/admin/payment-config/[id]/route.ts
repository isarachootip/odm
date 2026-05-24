import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if this is the default config
        const config = await prisma.paymentConfig.findUnique({
            where: { id },
        });

        if (config?.isDefault) {
            return NextResponse.json(
                { error: "Cannot delete the default payment config" },
                { status: 400 }
            );
        }

        // Delete the config
        await prisma.paymentConfig.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting payment config:", error);
        return NextResponse.json(
            { error: "Failed to delete config" },
            { status: 500 }
        );
    }
}
