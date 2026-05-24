"use client";

import { updateUserRole } from "@/actions/admin-users";
import { useState } from "react";

interface RoleSelectProps {
    userId: string;
    currentRole: "ADMIN" | "CUSTOMER";
}

export function RoleSelect({ userId, currentRole }: RoleSelectProps) {
    const [role, setRole] = useState(currentRole);
    const [loading, setLoading] = useState(false);

    const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value as "ADMIN" | "CUSTOMER";

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

    return (
        <div className="relative">
            <select
                value={role}
                onChange={handleRoleChange}
                disabled={loading}
                className="h-9 min-w-[130px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="CUSTOMER">Customer</option>
                <option value="ADMIN">Admin</option>
            </select>
            {loading && <span className="absolute right-[-24px] top-2 text-xs">...</span>}
        </div>
    );
}
