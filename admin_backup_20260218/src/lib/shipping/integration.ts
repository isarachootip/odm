import { prisma } from "@/lib/prisma";

// TYPE DEFINITIONS
export type RiderService = "LINEMAN" | "SHOPEE" | "GRAB" | "LALAMOVE";

interface RiderRequest {
    orderId: string;
    pickupLocation: {
        lat: number;
        lng: number;
        address: string;
        name: string;
        phone: string;
    };
    dropoffLocation: {
        address: string;
        name: string;
        phone: string;
    };
}

// 1. MOCK RIDER API INTEGRATION
// In production, this would call the actual API (e.g., https://api.lineman.wongnai.com)
export async function callRiderService(service: RiderService, request: RiderRequest) {
    console.log(`[${service}] Requesting rider for Order #${request.orderId}`);
    console.log(`Pickup: ${request.pickupLocation.address}`);
    console.log(`Dropoff: ${request.dropoffLocation.address}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate API Response
    const trackingNo = `RIDER-${Math.floor(Math.random() * 1000000)}`;
    const riderName = "สมชาย ใจดี";
    const riderPhone = "081-234-5678";

    return {
        success: true,
        trackingNumber: trackingNo,
        rider: {
            name: riderName,
            phone: riderPhone,
            vehicle: "Honda Wave 125i (1กข-1234)"
        },
        estimatedPrice: 45,
        status: "SEARCHING_DRIVER"
    };
}

// 2. FUTURE SHIPPING API (Webhook)
// This function sends the order payload to a configureable URL
export async function syncToShippingSystem(orderId: string, targetApiUrl: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });

        if (!order) throw new Error("Order not found");

        const payload = {
            orderId: order.id,
            customer: {
                name: order.customerName,
                phone: order.customerPhone,
                address: order.deliveryLocation
            },
            items: order.items.map(item => ({
                id: item.productId,
                qty: item.quantity,
                price: Number(item.price)
            })),
            totalCod: Number(order.total)
        };

        // For now, just log it. In future, fetch(targetApiUrl, { body: JSON.stringify(payload) ... })
        console.log("Syncing to external system:", targetApiUrl);
        console.log("Payload:", JSON.stringify(payload, null, 2));

        return { success: true, message: "Synced to Shipping System" };

    } catch (error) {
        console.error("Sync Error:", error);
        return { success: false, error: "Sync failed" };
    }
}
