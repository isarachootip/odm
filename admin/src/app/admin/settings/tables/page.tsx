import { TablesClient } from "@/components/admin/TablesClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TablesPage() {
    const initialTables = await prisma.diningTable.findMany({
        orderBy: { createdAt: "asc" }
    });

    return <TablesClient initialTables={initialTables} />;
}
