import { prisma } from "@/lib/prisma";
import { OrderManagement } from "@/components/admin/OrderManagement";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            User: true,
            items: {
                include: {
                    Product: true
                }
            }
        },
    });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order Management</h1>
            </div>

            <OrderManagement initialOrders={orders as any} />
        </div>
    );
}
