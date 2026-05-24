import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json(
                { error: "Config ID is required" },
                { status: 400 }
            );
        }

        // Set all configs to non-default
        await prisma.paymentConfig.updateMany({
            where: { isDefault: true },
            data: { isDefault: false },
        });

        // Set the specified config as default
        const config = await prisma.paymentConfig.update({
            where: { id },
            data: { isDefault: true },
        });

        return NextResponse.json({ config });
    } catch (error) {
        console.error("Error setting default config:", error);
        return NextResponse.json(
            { error: "Failed to set default config" },
            { status: 500 }
        );
    }
}
