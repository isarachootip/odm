import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  // 1. Authentication
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.API_SECRET_KEY) {
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
    if (Object.values(OrderStatus).includes(statusParam as OrderStatus)) {
      statusFilter = statusParam as OrderStatus;
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

    // 4. Transform Data to match Documentation
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
        productName: item.Product.name, // Added mostly for context, though not strictly in example
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
