"use client";

import { updateUserRole, updateUserBranch } from "@/actions/admin-users";
import { useState } from "react";

interface RoleSelectProps {
    userId: string;
    currentRole: "ADMIN" | "CUSTOMER" | "STAFF" | "SUPERVISOR";
    currentBranchId: string | null;
    branches: { id: string, name: string }[];
}

export function RoleSelect({ userId, currentRole, currentBranchId, branches }: RoleSelectProps) {
    const [role, setRole] = useState(currentRole);
    const [branchId, setBranchId] = useState(currentBranchId || "");
    const [loading, setLoading] = useState(false);

    const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as "ADMIN" | "CUSTOMER" | "STAFF" | "SUPERVISOR";

        // Confirm before changing
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
            e.target.value = role; // Reset
            return;
        }

        setLoading(true);
        const result = await updateUserRole(userId, newRole);

        if (result.success) {
            setRole(newRole);
            alert(`✅ Role updated to ${newRole}`);
        } else {
            alert("❌ Failed to update role");
            e.target.value = role; // Reset on failure
        }
        setLoading(false);
    };

    const handleBranchChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newBranchId = e.target.value;
        const bId = newBranchId === "" ? null : newBranchId;

        if (!confirm(`Are you sure you want to change this user's branch?`)) {
            e.target.value = branchId; // Reset
            return;
        }

        setLoading(true);
        const result = await updateUserBranch(userId, bId);
        if (result.success) {
            setBranchId(newBranchId);
            alert(`✅ Branch updated`);
        } else {
            alert(`❌ Failed to update branch`);
            e.target.value = branchId;
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-2 relative">
            <select
                value={role}
                onChange={handleRoleChange}
                disabled={loading}
                className="h-9 min-w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="CUSTOMER">Customer</option>
                <option value="STAFF">Staff</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Admin</option>
            </select>

            {/* Branch Selection (Only useful for Staff / Supervisor, but visible to adjust) */}
            {(role === "STAFF" || role === "SUPERVISOR") && (
                <select
                    value={branchId}
                    onChange={handleBranchChange}
                    disabled={loading}
                    className="h-9 min-w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">-- No Branch --</option>
                    {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
            )}

            {loading && <span className="absolute right-[-24px] top-2 text-xs">...</span>}
        </div>
    );
}
