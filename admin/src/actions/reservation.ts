"use server";

import { prisma } from "@/lib/prisma";

export async function getAvailableTables(date: string, timeSlot: string) {
    try {
        // Find all active tables
        const allTables = await prisma.diningTable.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });

        // Find reservations for the given date and timeSlot
        const reservedTables = await prisma.tableReservation.findMany({
            where: {
                date,
                timeSlot,
                status: { not: "CANCELLED" }
            },
            select: { tableId: true }
        });

        const reservedTableIds = reservedTables.map(r => r.tableId);

        // Filter out reserved tables
        const availableTables = allTables.filter(t => !reservedTableIds.includes(t.id));

        return { success: true, availableTables };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
