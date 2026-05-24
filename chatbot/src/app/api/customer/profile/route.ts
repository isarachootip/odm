import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch profile by lineUserId
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const lineUserId = searchParams.get("lineUserId");

        if (!lineUserId) {
            return NextResponse.json({ error: "Missing lineUserId" }, { status: 400 });
        }

        const profile = await prisma.customerProfile.findUnique({
            where: { lineUserId },
        });

        if (!profile) {
            return NextResponse.json({ found: false });
        }

        return NextResponse.json({ found: true, profile });
    } catch (error) {
        console.error("Error fetching customer profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create or update profile
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { lineUserId, isConsent, nickname, phone, department } = body;

        if (!lineUserId) {
            return NextResponse.json({ error: "Missing lineUserId" }, { status: 400 });
        }

        const profile = await prisma.customerProfile.upsert({
            where: { lineUserId },
            update: {
                isConsent,
                nickname: isConsent ? nickname : null,
                phone: isConsent ? phone : null,
                department: isConsent ? department : null,
            },
            create: {
                lineUserId,
                isConsent,
                nickname: isConsent ? nickname : null,
                phone: isConsent ? phone : null,
                department: isConsent ? department : null,
            },
        });

        return NextResponse.json({ success: true, profile });
    } catch (error) {
        console.error("Error upserting customer profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
