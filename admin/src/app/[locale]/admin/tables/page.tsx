import { auth } from "@/auth";
import { getTables } from "@/actions/tables";
import { TablesClient } from "@/components/admin/TablesClient";

export default async function AdminTablesPage() {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
        return <div>Unauthorized</div>;
    }

    const result = await getTables();
    const tables = result.success && result.tables ? result.tables : [];

    return (
        <div>
            <TablesClient initialTables={tables} />
        </div>
    );
}
