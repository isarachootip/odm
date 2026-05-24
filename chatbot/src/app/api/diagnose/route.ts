import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    const results = {
        db_connection: "PENDING",
        order_count: -1,
        payment_config: null as any,
        error: null as string | null
    };

    try {
        console.log("Diagnose: Connecting...");

        // 1. Check Order count
        const count = await prisma.order.count();
        results.order_count = count;

        // 2. Check PaymentConfig
        const config = await prisma.paymentConfig.findFirst({
            where: { isDefault: true }
        });
        results.payment_config = config;

        // 3. Env Check
        const envCheck = {
            has_blob_token: !!process.env.BLOB_READ_WRITE_TOKEN,
            has_line_token: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
            node_env: process.env.NODE_ENV
        };
        (results as any).env_check = envCheck;

        results.db_connection = "SUCCESS";

        return NextResponse.json(results);
    } catch (error: any) {
        console.error("Diagnose Error:", error);
        results.db_connection = "FAILED";
        results.error = error.message + (error.meta ? JSON.stringify(error.meta) : "");

        return NextResponse.json(results, { status: 500 });
    }
}
