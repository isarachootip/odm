import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const startTime = Date.now();

        // 1. Check basic connection
        await prisma.$queryRaw`SELECT 1`;
        const connectionTime = Date.now() - startTime;

        // 2. Check CartSession table
        const cartSessionCount = await prisma.cartSession.count();

        // 3. Check PaymentConfig table
        const paymentConfigs = await prisma.paymentConfig.findMany();
        const bankConfigs = await prisma.bankConfig.findMany();

        return NextResponse.json({
            status: "success",
            database_check: {
                connection_time_ms: connectionTime,
                cart_session_count: cartSessionCount,
                payment_configs: paymentConfigs,
                bank_configs: bankConfigs,
            },
            env: {
                // Safe to expose in admin/debug context only
                NODE_ENV: process.env.NODE_ENV,
                has_database_url: !!process.env.DATABASE_URL,
                has_postgres_url: !!process.env.POSTGRES_URL,
                env_keys: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY')), // List keys excluding secrets
            }
        });
    } catch (error: any) {
        console.error("Test DB Error:", error);
        return NextResponse.json({
            status: "error",
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack,
            env_check: {
                has_database_url: !!process.env.DATABASE_URL,
                has_postgres_url: !!process.env.POSTGRES_URL,
                env_keys: Object.keys(process.env).filter(key => !key.includes('SECRET') && !key.includes('KEY')),
            }
        }, { status: 200 });
    }
}

