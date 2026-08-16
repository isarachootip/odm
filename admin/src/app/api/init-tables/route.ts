import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const tableCount = await prisma.diningTable.count();
        if (tableCount > 0) {
            const tables = await prisma.diningTable.findMany({ orderBy: { name: "asc" } });
            return NextResponse.json({
                success: true,
                message: "Tables already initialized",
                count: tableCount,
                tables
            });
        }

        // Get default branch if exists
        const branch = await prisma.branch.findFirst();

        const defaultTables = [
            { name: "โต๊ะ 1", capacity: 2, isActive: true, branchId: branch?.id },
            { name: "โต๊ะ 2", capacity: 4, isActive: true, branchId: branch?.id },
            { name: "โต๊ะ 3", capacity: 4, isActive: true, branchId: branch?.id },
            { name: "โต๊ะ 4", capacity: 4, isActive: true, branchId: branch?.id },
            { name: "โต๊ะ 5 (VIP)", capacity: 8, isActive: true, branchId: branch?.id }
        ];

        for (const t of defaultTables) {
            await prisma.diningTable.create({ data: t });
        }

        const createdTables = await prisma.diningTable.findMany({ orderBy: { name: "asc" } });

        return NextResponse.json({
            success: true,
            message: "Default dining tables created successfully",
            count: createdTables.length,
            tables: createdTables
        });
    } catch (error: any) {
        console.error("Failed to init tables:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
