import { getUsers, getBranches } from "@/actions/admin-users";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { EditPasswordDialog } from "@/components/admin/EditPasswordDialog";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
    const session = await auth();
    const isAdminOrSuper = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERVISOR";

    const [{ users, error }, { branches }] = await Promise.all([
        getUsers(),
        getBranches()
    ]);

    if (error || !users || !branches) {
        return <div className="p-8 text-red-500">Error loading users or branches.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                {isAdminOrSuper && (
                    <a
                        href="/admin/users/new"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        + Add New User
                    </a>
                )}
            </div>

            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground border-b uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Role & Branch</th>
                            <th className="px-6 py-4">Joined</th>
                            {isAdminOrSuper && <th className="px-6 py-4 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-muted/50">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                        {user.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={user.image} alt="" className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            (user.name?.charAt(0) || "U").toUpperCase()
                                        )}
                                    </div>
                                    <span className="font-medium">{user.name}</span>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                <td className="px-6 py-4">
                                    {isAdminOrSuper ? (
                                        <RoleSelect
                                            userId={user.id}
                                            currentRole={user.role as any}
                                            currentBranchId={user.branchId}
                                            branches={branches}
                                        />
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-gray-900">{user.role}</span>
                                            {user.branchId && (
                                                <span className="text-xs text-gray-500">
                                                    {branches.find(b => b.id === user.branchId)?.name || 'Unknown Branch'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString("th-TH")}
                                </td>
                                {isAdminOrSuper && (
                                    <td className="px-6 py-4 text-right">
                                        <EditPasswordDialog userId={user.id} userName={user.name || "User"} />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
