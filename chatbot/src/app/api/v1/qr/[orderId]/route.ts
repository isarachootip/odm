import { NextResponse } from "next/server";
import { generatePromptPayQR } from "@/lib/promptpay";
import { prisma } from "@/lib/db";

// In-memory cache for generated QR buffers (orderId -> { buffer: Uint8Array, expiresAt: number })
const qrCache = new Map<string, { buffer: Uint8Array; expiresAt: number }>();
const MAX_CACHE_SIZE = 500;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Cached default promptpay number (with 5-minute TTL)
let cachedPromptpayNumber: string | null = null;
let promptpayCacheExpiresAt = 0;

async function getDefaultPromptPayNumber(): Promise<string | null> {
    const now = Date.now();
    if (cachedPromptpayNumber && now < promptpayCacheExpiresAt) {
        return cachedPromptpayNumber;
    }

    const paymentConfig = await prisma.paymentConfig.findFirst({
        where: { isDefault: true },
        select: { paymentType: true, promptpayNumber: true },
        orderBy: { createdAt: 'desc' }
    });

    if (paymentConfig && paymentConfig.paymentType === "PROMPTPAY" && paymentConfig.promptpayNumber) {
        cachedPromptpayNumber = paymentConfig.promptpayNumber;
        promptpayCacheExpiresAt = now + (5 * 60 * 1000); // Cache for 5 minutes
        return cachedPromptpayNumber;
    }

    return null;
}

export async function GET(request: Request, props: { params: Promise<{ orderId: string }> }) {
    try {
        const params = await props.params;
        const rawOrderId = params.orderId;
        
        if (!rawOrderId) {
            return new NextResponse("Missing orderId", { status: 400 });
        }

        // Remove .png extension if present (required by LINE API)
        const orderId = rawOrderId.replace(/\.png$/, '');

        // 1. Check in-memory cache first (Lightning fast response < 1ms)
        const now = Date.now();
        const cached = qrCache.get(orderId);
        if (cached && now < cached.expiresAt) {
            return new Response(cached.buffer as any, {
                status: 200,
                headers: {
                    "Content-Type": "image/png",
                    "Content-Length": cached.buffer.length.toString(),
                    "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
                    "X-Cache": "HIT"
                }
            });
        }

        // 2. Fetch only needed fields from Order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { total: true }
        });

        if (!order) {
            return new NextResponse("Order not found", { status: 404 });
        }

        // 3. Get cached PromptPay number
        const promptpayNumber = await getDefaultPromptPayNumber();

        if (!promptpayNumber) {
            return new NextResponse("PromptPay not configured", { status: 404 });
        }

        // 4. Generate QR code buffer
        const buffer = await generatePromptPayQR(promptpayNumber, Number(order.total));
        const uint8Array = new Uint8Array(buffer);

        // 5. Store in memory cache
        if (qrCache.size >= MAX_CACHE_SIZE) {
            // Evict oldest entry
            const oldestKey = qrCache.keys().next().value;
            if (oldestKey) qrCache.delete(oldestKey);
        }
        qrCache.set(orderId, { buffer: uint8Array, expiresAt: now + CACHE_TTL_MS });

        return new Response(uint8Array as any, {
            status: 200,
            headers: {
                "Content-Type": "image/png",
                "Content-Length": uint8Array.length.toString(),
                "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
                "X-Cache": "MISS"
            }
        });
    } catch (error) {
        console.error("Failed to generate QR code:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

