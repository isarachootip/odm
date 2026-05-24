"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Branch } from "@prisma/client";

interface Props {
    branches: Branch[];
    isAdmin: boolean;
}

export function BranchSwitcher({ branches, isAdmin }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Default to "ALL" if admin, otherwise let the server lock it.
    const currentBranch = searchParams.get("branchId") || "ALL";

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);
            return params.toString();
        },
        [searchParams]
    );

    const onBranchChange = (value: string) => {
        router.push(pathname + "?" + createQueryString("branchId", value));
    };

    if (!isAdmin) {
        return null; // Don't show switcher if not admin (they are locked to their branch)
    }

    return (
        <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-medium text-gray-700">เลือกสาขา:</span>
            <Select value={currentBranch} onValueChange={onBranchChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="ทุกสาขา" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">ทุกสาขา</SelectItem>
                    {branches.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name} ({b.code})</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
