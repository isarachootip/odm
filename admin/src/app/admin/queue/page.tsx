import { prisma } from "@/lib/prisma";
import { QueueMonitor } from "@/components/admin/QueueMonitor";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function QueuePage(props: { searchParams: Promise<{ branchId?: string }> }) {
    const session = await auth();
    const isAdmin = session?.user?.role === 'ADMIN';
    const userBranchId = session?.user?.branchId;

    const searchParams = await props.searchParams;
    let selectedBranchId = isAdmin ? searchParams.branchId : userBranchId;
    if (selectedBranchId === "ALL") selectedBranchId = undefined;

    const branchFilter = selectedBranchId ? { branchId: selectedBranchId } : {};

    // Get start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch active orders for today (Pending, Paid, Processing, Shipped)
    const orders = await prisma.order.findMany({
        where: {
            ...branchFilter,
            createdAt: {
                gte: today
            },
            status: {
                in: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED']
            }
        },
        orderBy: {
            queueNumber: 'asc'
        },
        include: {
            User: true,
            branch: true,
            items: {
                include: {
                    Product: true
                }
            }
        }
    });

    // Fetch specific addon products for frontend barcode mapping
    const addonProducts = await prisma.product.findMany({
        where: {
            OR: [
                { id: { in: ["2000604258645", "2000604305356", "2000604000001"] } },
                // Fallback for demo
                { name: { in: ["เพิ่มช็อตกาแฟ", "เพิ่มน้ำผึ้ง", "เพิ่มไซรัป", "เพิ่มช๊อต น้ำผึ้ง", "เพิ่มความหวาน (Syrup)"] } }
            ]
        }
    });

    // Fetch all branches if Admin for the branch selector
    const branches = isAdmin ? await prisma.branch.findMany({ orderBy: { name: 'asc' } }) : [];

    return (
        <QueueMonitor
            initialOrders={orders as any}
            addonProducts={addonProducts}
            branches={branches}
            currentBranchId={userBranchId || null}
            isAdmin={isAdmin}
        />
    );
}
