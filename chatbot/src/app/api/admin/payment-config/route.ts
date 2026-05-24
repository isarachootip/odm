import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch all payment configs
export async function GET() {
    try {
        const configs = await prisma.paymentConfig.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ configs });
    } catch (error) {
        console.error("Error fetching payment configs:", error);
        return NextResponse.json(
            { error: "Failed to fetch configs" },
            { status: 500 }
        );
    }
}

// POST: Create new payment config
export async function POST(req: Request) {
    try {
        const { paymentType, promptpayNumber, bankName, accountName, accountNumber } = await req.json();

        // Validate input
        if (!paymentType || !accountName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (paymentType === "PROMPTPAY" && !promptpayNumber) {
            return NextResponse.json(
                { error: "PromptPay number is required" },
                { status: 400 }
            );
        }

        if (paymentType === "BANK_TRANSFER" && (!bankName || !accountNumber)) {
            return NextResponse.json(
                { error: "Bank name and account number are required" },
                { status: 400 }
            );
        }

        // Create new config
        const config = await prisma.paymentConfig.create({
            data: {
                paymentType,
                promptpayNumber: paymentType === "PROMPTPAY" ? promptpayNumber : null,
                bankName: paymentType === "BANK_TRANSFER" ? bankName : null,
                accountName,
                accountNumber: paymentType === "BANK_TRANSFER" ? accountNumber : null,
                isDefault: false, // New accounts are not default by default
            },
        });

        return NextResponse.json({ config });
    } catch (error) {
        console.error("Error saving payment config:", error);
        return NextResponse.json(
            { error: "Failed to save config" },
            { status: 500 }
        );
    }
}
