"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBranch(data: { name: string; code: string; lineChannelId?: string; lineChannelSecret?: string; lineChannelAccessToken?: string }) {
    try {
        const branch = await prisma.branch.create({
            data: {
                name: data.name,
                code: data.code.toUpperCase(),
                lineChannelId: data.lineChannelId || null,
                lineChannelSecret: data.lineChannelSecret || null,
                lineChannelAccessToken: data.lineChannelAccessToken || null,
            }
        });
        revalidatePath("/admin/branches");
        return { success: true, data: branch };
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { error: "Branch code already exists" };
        }
        return { error: e.message || "Failed to create branch" };
    }
}

export async function updateBranch(id: string, data: { name: string; code: string; lineChannelId?: string; lineChannelSecret?: string; lineChannelAccessToken?: string }) {
    try {
        const branch = await prisma.branch.update({
            where: { id },
            data: {
                name: data.name,
                code: data.code.toUpperCase(),
                lineChannelId: data.lineChannelId || null,
                lineChannelSecret: data.lineChannelSecret || null,
                lineChannelAccessToken: data.lineChannelAccessToken || null,
            }
        });
        revalidatePath("/admin/branches");
        return { success: true, data: branch };
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { error: "Branch code already exists" };
        }
        return { error: e.message || "Failed to update branch" };
    }
}

export async function deleteBranch(id: string) {
    try {
        // Warning: This could fail if there are orders or users linked to this branch.
        await prisma.branch.delete({
            where: { id }
        });
        revalidatePath("/admin/branches");
        return { success: true };
    } catch (e: any) {
        if (e.code === 'P2003') {
            return { error: "Cannot delete branch because it has existing orders or users linked to it." };
        }
        return { error: e.message || "Failed to delete branch" };
    }
}
