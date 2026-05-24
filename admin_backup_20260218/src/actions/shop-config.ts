'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

export async function getShopConfig() {
    const config = await prisma.shopConfig.findFirst()
    if (!config) {
        // Auto-create defaults if not exists
        return await prisma.shopConfig.create({
            data: {}
        })
    }
    return config
}

export async function updateShopConfig(data: {
    isBusyMode: boolean;
    busyMessage: string;
    isScheduleEnabled?: boolean;
    openTime?: string;
    closeTime?: string;
}) {
    const session = await auth()

    // Basic security check (Admin only)
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    const config = await prisma.shopConfig.findFirst()

    const updateData = {
        isBusyMode: data.isBusyMode,
        busyMessage: data.busyMessage,
        isScheduleEnabled: data.isScheduleEnabled ?? false,
        openTime: data.openTime ?? null,
        closeTime: data.closeTime ?? null
    }

    if (config) {
        await prisma.shopConfig.update({
            where: { id: config.id },
            data: updateData
        })
    } else {
        await prisma.shopConfig.create({
            data: updateData
        })
    }
    revalidatePath("/admin/shop-config")
    return { success: true }
}
