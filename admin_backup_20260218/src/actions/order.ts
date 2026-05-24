"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CartItemInput {
    id: string; // Product ID
    quantity: number;
    selectedVariant?: {
        color?: string;
        size?: string;
    };
    selectedOptions?: {
        sweetness?: string;
        addons?: string[];
    };
    finalPrice?: number;
}

interface ShippingInput {
    // Matching LINE Flow
    customerName: string;
    customerPhone: string;
    deliveryType: "PICKUP" | "DELIVERY";
    deliveryLocation?: string;
}


// Helper to generate format: B + ddmmyy + 0000 (running no)
async function generateOrderNumber() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    const datePrefix = `BN${day}${month}${year}`; // e.g. BN010226

    // Find last order with this prefix
    const lastOrder = await prisma.order.findFirst({
        where: {
            orderNumber: {
                startsWith: datePrefix
            }
        },
        orderBy: {
            orderNumber: 'desc'
        },
        select: {
            orderNumber: true
        }
    });

    let runningNo = 1;
    if (lastOrder && lastOrder.orderNumber) {
        const lastRunningNoStr = lastOrder.orderNumber.slice(-4); // Get last 4 digits
        const lastRunningNo = parseInt(lastRunningNoStr, 10);
        if (!isNaN(lastRunningNo)) {
            runningNo = lastRunningNo + 1;
        }
    }

    return `${datePrefix}${String(runningNo).padStart(4, '0')}`;
}

export async function createOrder(items: CartItemInput[], shipping: ShippingInput) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        if (items.length === 0) {
            return { error: "Cart is empty" };
        }

        // 1. Fetch products
        const productIds = items.map((item) => item.id);
        const dbProducts = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        const productsMap = new Map(dbProducts.map((p) => [p.id, p]));

        // 2. Calculate Total & Prepare OrderItems
        let total = 0;
        const orderItemsData = [];

        const ADDONS_OPTIONS = [
            { id: "shot", name: "Extra Shot", price: 15 },
            { id: "honey", name: "Honey", price: 15 },
        ];

        for (const item of items) {
            const product = productsMap.get(item.id);
            if (!product) {
                return { error: `Product not found: ${item.id}` };
            }

            // Base Price
            let price = product.promotionPrice ? Number(product.promotionPrice) : Number(product.price);

            // Add-ons Price
            let addonsPrice = 0;
            if (item.selectedOptions?.addons) {
                addonsPrice = item.selectedOptions.addons.reduce((sum: number, addonName: string) => {
                    const option = ADDONS_OPTIONS.find(o => o.name === addonName);
                    return sum + (option?.price || 0);
                }, 0);
            }

            price += addonsPrice;
            total += price * item.quantity;

            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: price,
                options: item.selectedOptions ? JSON.stringify(item.selectedOptions) : undefined
            });
        }

        // No Shipping Cost for simple Cafe logic
        // But if needed, can add logic here. For now, keep it simple (= Total)

        // Generate Custom Order Number
        const customOrderNumber = await generateOrderNumber();

        // 3. Create Order
        const order = await prisma.order.create({
            data: {
                userId: userId || null,
                orderNumber: customOrderNumber, // Save custom ID
                status: "PENDING", // Start as Pending
                total: total,

                // Save Customer Info explicitly
                customerName: shipping.customerName,
                customerPhone: shipping.customerPhone,
                deliveryType: shipping.deliveryType,
                deliveryLocation: shipping.deliveryType === "DELIVERY" ? shipping.deliveryLocation : null,

                items: {
                    create: orderItemsData,
                },
            },
        });

        revalidatePath("/admin/orders");

        return { success: true, orderId: order.id }; // Return internal ID for navigation, but user sees orderNumber later

    } catch (error) {
        console.error("Failed to create order:", error);
        return { error: "Failed to create order. Please try again." };
    }
}

export async function getPublicOrders(query: string) {
    if (!query || query.length < 4) {
        return { error: "Please enter at least 4 characters" };
    }

    try {
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { customerPhone: { contains: query } },
                    { orderNumber: { contains: query } } // Allow searching by Order Number too
                ]
            },
            include: {
                items: {
                    include: {
                        Product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        return { success: true, orders };
    } catch (error) {
        console.error("Tracking search error:", error);
        return { error: "Failed to search for orders" };
    }
}

export async function shipOrder(orderId: string, carrier: string, trackingNumber: string) {
    try {
        const session = await auth();
        // Check if Admin (Optional: Add role check here if strictly needed)

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "SHIPPED",
                shippingCarrier: carrier,
                trackingNumber: trackingNumber
            }
        });

        revalidatePath("/admin/orders");
        return { success: true };
    } catch (error) {
        console.error("Shipping update error:", error);
        return { error: "Failed to update shipping status" };
    }
}
