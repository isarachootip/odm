"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTables() {
    try {
        const tables = await prisma.diningTable.findMany({
            orderBy: { createdAt: "asc" }
        });
        return { success: true, tables };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createTable(data: { name: string; capacity: number; isActive: boolean }) {
    try {
        const table = await prisma.diningTable.create({
            data: {
                name: data.name,
                capacity: data.capacity,
                isActive: data.isActive
            }
        });
        revalidatePath("/admin/tables");
        revalidatePath("/admin/settings/tables");
        return { success: true, table };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTable(id: string, data: { name: string; capacity: number; isActive: boolean }) {
    try {
        const table = await prisma.diningTable.update({
            where: { id },
            data: {
                name: data.name,
                capacity: data.capacity,
                isActive: data.isActive
            }
        });
        revalidatePath("/admin/tables");
        revalidatePath("/admin/settings/tables");
        return { success: true, table };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTable(id: string) {
    try {
        await prisma.diningTable.delete({
            where: { id }
        });
        revalidatePath("/admin/tables");
        revalidatePath("/admin/settings/tables");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
