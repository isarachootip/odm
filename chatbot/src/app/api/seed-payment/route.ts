import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        console.log("Seeding Payment Config...");

        // Check existing
        const existing = await prisma.paymentConfig.findFirst({
            where: { isDefault: true }
        });

        if (existing) {
            return NextResponse.json({ status: "skipped", message: "Config already exists", data: existing });
        }

        // Create new
        const newConfig = await prisma.paymentConfig.create({
            data: {
                paymentType: "PROMPTPAY",
                promptpayNumber: "0636395619", // Placeholder from user chat
                accountName: "Odm Vidwa Settings",
                isDefault: true
            }
        });

        return NextResponse.json({ status: "success", data: newConfig });
    } catch (error: any) {
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}
