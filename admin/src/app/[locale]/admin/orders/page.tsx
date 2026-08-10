import { prisma } from "@/lib/prisma";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { BranchSwitcher } from "@/components/admin/BranchSwitcher";

import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage(props: { searchParams: Promise<{ branchId?: string }> }) {
    const session = await auth();
    const isAdmin = session?.user?.role === 'ADMIN';
    const userBranchId = session?.user?.branchId;

    const searchParams = await props.searchParams;
    let selectedBranchId = isAdmin ? searchParams.branchId : userBranchId;
    if (selectedBranchId === "ALL") selectedBranchId = undefined;

    const branchFilter = selectedBranchId ? { branchId: selectedBranchId } : {};

    // Get branches for the switcher
    const branches = await prisma.branch.findMany({ orderBy: { name: 'asc' } });

    const orders = await prisma.order.findMany({
        where: branchFilter,
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
            <div className="mb-6 flex justify-between items-start">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order Management</h1>
                <BranchSwitcher branches={branches} isAdmin={isAdmin} />
            </div>

            <OrderManagement initialOrders={orders as any} />
        </div>
    );
}
