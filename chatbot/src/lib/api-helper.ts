import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

export async function fetchOrders(request: NextRequest, requiredKeyEnvVar: string) {
    // 1. Authentication
    const apiKey = request.headers.get('x-api-key');
    const validKey = process.env[requiredKeyEnvVar];

    if (!validKey) {
        console.error(`Config Error: ${requiredKeyEnvVar} is not set in environment variables (Expected API_KEY_VIDWA).`);
        return NextResponse.json({ error: 'Server Configuration Error' }, { status: 500 });
    }

    if (apiKey !== validKey) {
        return NextResponse.json(
            { error: 'Unauthorized: Invalid API Key' },
            { status: 401 }
        );
    }

    // 2. Query Parameters
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');

    // Validate status if provided
    let statusFilter: OrderStatus | undefined;
    if (statusParam) {
        if (Object.values(OrderStatus).includes(searchParams.get('status') as OrderStatus)) {
            statusFilter = searchParams.get('status') as OrderStatus;
        } else {
            return NextResponse.json(
                { error: 'Invalid status parameter' },
                { status: 400 }
            );
        }
    }

    try {
        // 3. Data Fetching
        const orders = await prisma.order.findMany({
            where: {
                ...(statusFilter && { status: statusFilter }),
            },
            include: {
                items: {
                    include: {
                        Product: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // 4. Transform Data
        const formattedOrders = orders.map((order) => ({
            id: order.id,
            status: order.status,
            total: order.total.toString(),
            createdAt: order.createdAt,
            queueNumber: order.queueNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            deliveryType: order.deliveryType,
            orderNumber: order.orderNumber,
            items: order.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price.toString(),
                options: item.options,
                productName: item.Product ? item.Product.name : 'Unknown Product',
            })),
        }));

        return NextResponse.json({
            count: formattedOrders.length,
            orders: formattedOrders,
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
