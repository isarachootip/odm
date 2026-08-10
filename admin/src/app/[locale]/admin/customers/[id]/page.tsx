import { prisma as db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CustomerDetailClient } from "@/components/admin/CustomerDetailClient";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const customer = await db.customerProfile.findUnique({
        where: { id: id },
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
