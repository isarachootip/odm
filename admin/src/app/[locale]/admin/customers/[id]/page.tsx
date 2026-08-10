import { prisma as db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CustomerDetailClient } from "@/components/admin/CustomerDetailClient";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
    const customer = await db.customerProfile.findUnique({
        where: { id: params.id },
        include: {
            Orders: { // Changed from Order to Orders due to schema difference
                include: {
                    items: {
                        include: {
                            Product: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            }
        }
    });

    if (!customer) {
        notFound();
    }

    return <CustomerDetailClient customer={customer} />;
}
