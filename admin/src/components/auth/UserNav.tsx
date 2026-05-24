"use client";

import Link from "next/link";
import { User, LogOut, LayoutDashboard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserNav() {
    const { data: session } = useSession();

    if (!session?.user) {
        return (
            <Link href="/login">
                <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Sign In</span>
                </Button>
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className="hidden text-sm font-medium sm:inline-block">
                {session.user.name?.split(" ")[0]}
            </span>

            {session.user.role === "ADMIN" && (
                <AdminLink />
            )}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Sign Out"
            >
                <LogOut className="h-5 w-5" />
            </Button>
        </div>
    );
}

function AdminLink() {
    return (
        <Link href="/admin">
            <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                title="จัดการระบบ (Admin)"
            >
                <LayoutDashboard className="h-5 w-5" />
            </Button>
        </Link>
    );
}
