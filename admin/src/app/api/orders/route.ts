import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const queryBranchId = searchParams.get("branchId");

        const session = await auth();
        const isAdmin = session?.user?.role === 'ADMIN';
        const userBranchId = session?.user?.branchId;

        // If not admin, lock to user branch. If admin, use queryBranchId if provided, else all.
        let selectedBranchId = isAdmin ? queryBranchId : userBranchId;
        if (selectedBranchId === "ALL") selectedBranchId = undefined;

        const branchFilter = selectedBranchId ? { branchId: selectedBranchId } : {};

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
            take: 100 // Limit to last 100 orders
        });

        return NextResponse.json(orders);

    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
