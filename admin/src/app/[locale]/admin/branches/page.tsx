import { prisma } from "@/lib/prisma";
import BranchClientPage from "./BranchClientPage";

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
    const branches = await prisma.branch.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Branches (สาขา)</h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-2xl pb-4">
                Manage your shop branches and configure their independent LINE Official Account credentials.
                Orders and queues are separated by branch code.
            </p>

            <BranchClientPage branches={branches} />
        </div>
    );
}
