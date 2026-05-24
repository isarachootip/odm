
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

// Force dynamic to ensure we always fetch fresh data
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // 1. Authentication Check
        const apiKey = req.headers.get("x-api-key");
        const systemSecret = process.env.API_SECRET_KEY;

        // If no secret configured, block all access for security
        if (!systemSecret) {
            console.error("API_SECRET_KEY is not set in environment variables.");
            return NextResponse.json(
                { error: "Server Configuration Error: API Key not set" },
                { status: 500 }
            );
        }

        if (apiKey !== systemSecret) {
            return NextResponse.json(
                { error: "Unauthorized: Invalid API Key" },
                { status: 401 }
            );
        }

        // 2. Parse Query Parameters
        const { searchParams } = new URL(req.url);
        const statusParam = searchParams.get("status");

        let whereClause: any = {};

        // Validate Status if provided
        if (statusParam) {
            // Check if valid enum
            if (Object.values(OrderStatus).includes(statusParam as OrderStatus)) {
                whereClause.status = statusParam as OrderStatus;
            } else {
                return NextResponse.json(
                    { error: `Invalid status. Allowed: ${Object.values(OrderStatus).join(", ")}` },
                    { status: 400 }
                );
            }
        }

        // 3. Fetch Orders
        const orders = await prisma.order.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    select: {
                        productId: true,
                        quantity: true,
                        price: true,
                        options: true
                        // Note: product name is not directly on item in schema usually, but let's check.
                        // Actually in this schema orderItem usually has snapshot data?
                        // Let's rely on what's available. If `product` relation exists, we include it.
                    }
                }
            },
            take: 100 // Limit to 100 recent orders for safety
        });

        // 4. Return Data
        return NextResponse.json({
            count: orders.length,
            orders: orders
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
