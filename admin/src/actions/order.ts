"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CartItemInput {
    id: string; // Product ID
    quantity: number;
    selectedOptions?: Record<string, string | string[]>;
    finalPrice?: number;
}

interface ShippingInput {
    // Matching LINE Flow
    customerName: string;
    customerPhone: string;
    deliveryType: "PICKUP" | "TAKEAWAY" | "DELIVERY" | "DINE_IN";
    deliveryLocation?: string;
    isPreorder?: boolean;
    preorderDateTime?: string;
    reservation?: {
        date: string;
        timeSlot: string;
        tableId: string;
    }
}

// Helper to generate format: [Branch] + ddmmyy + 0000 (running no)
async function generateOrderNumber(branchCode: string = 'odm') {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    const datePrefix = `${branchCode.toUpperCase()}${day}${month}${year}`; // e.g. ODM010226

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

        for (const item of items) {
            const product = productsMap.get(item.id);
            if (!product) {
                return { error: `Product not found: ${item.id}` };
            }

            // Base Price
            let price = product.promotionPrice ? Number(product.promotionPrice) : Number(product.price);

            // Calculate Options Price
            let optionsPrice = 0;
            if (item.selectedOptions && product.specifications) {
                try {
                    const specs = typeof product.specifications === 'string'
                        ? JSON.parse(product.specifications)
                        : product.specifications;
                    const optionGroups = (specs as any).options || [];

                    // Iterating over selections to find price
                    for (const [groupLabel, value] of Object.entries(item.selectedOptions)) {
                        // Find group by label
                        const group = optionGroups.find((g: any) => g.label === groupLabel);
                        if (group) {
                            if (Array.isArray(value)) {
                                // Multi-select
                                value.forEach(val => {
                                    // Match by label (since we store labels in selectedOptions for readabilty)
                                    // Wait, the client sends labels? Let's check ProductInfo.
                                    // ProductInfo sends: selectedOptionsSummary[group.label] = choice.label;
                                    // So we key by Label and Value is Label.
                                    // We need to match choice.label === val
                                    const choice = group.choices.find((c: any) => c.label === val);
                                    if (choice) optionsPrice += (choice.price || 0);
                                });
                            } else {
                                // Single select
                                const choice = group.choices.find((c: any) => c.label === value);
                                if (choice) optionsPrice += (choice.price || 0);
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error calculating options price", e);
                }
            }

            price += optionsPrice;
            total += price * item.quantity;

            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                price: price, // Snapshot price per unit
                options: item.selectedOptions ? JSON.stringify(item.selectedOptions) : undefined
            });
        }

        // No Shipping Cost for simple Cafe logic
        // But if needed, can add logic here. For now, keep it simple (= Total)

        // In the admin dashboard, we will default custom orders to ODM for now
        // Can be expanded to pass branch via UI later
        const branchCode = 'odm';

        // Generate Custom Order Number
        const customOrderNumber = await generateOrderNumber(branchCode);

        // Fetch branch to get branchId
        const branch = await prisma.branch.findUnique({ where: { code: branchCode.toUpperCase() } });

        // Prepare order data
        const orderData: any = {
            userId: userId || null,
            orderNumber: customOrderNumber,
            status: "PENDING",
            total: total,
            branchId: branch?.id || undefined,
            customerName: shipping.customerName,
            customerPhone: shipping.customerPhone,
            deliveryType: shipping.deliveryType,
            deliveryLocation: shipping.deliveryType === "DELIVERY" ? shipping.deliveryLocation : null,
            isPreorder: shipping.isPreorder || false,
            preorderDateTime: shipping.preorderDateTime ? new Date(shipping.preorderDateTime) : null,
            items: {
                create: orderItemsData,
            },
        };

        if (shipping.deliveryType === "DINE_IN" && shipping.reservation) {
            orderData.tableReservation = {
                create: {
                    date: shipping.reservation.date,
                    timeSlot: shipping.reservation.timeSlot,
                    tableId: shipping.reservation.tableId,
                    status: "RESERVED"
                }
            };
        }

        // 3. Create Order
        const order = await prisma.order.create({
            data: orderData,
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
