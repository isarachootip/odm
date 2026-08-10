import { CustomersClient } from "@/components/admin/CustomersClient";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma as db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
    const customers = await db.customerProfile.findMany({
        include: {
            _count: {
                select: { Orders: true } // Only count orders
            },
            Orders: {
                select: { total: true } // Only need totals for calculation
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Transform data for client component and parse to JSON to serialize Date objects
    const formattedCustomers = JSON.parse(JSON.stringify(customers.map(customer => ({
        ...customer,
        _count: {
            Order: customer._count.Orders
        },
        totalSpent: customer.Orders.reduce((sum: number, order: any) => sum + Number(order.total), 0)
    }))));

    return <CustomersClient initialCustomers={formattedCustomers} />;
}
