"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBankConfigs() {
    try {
        return await prisma.bankConfig.findMany({
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("Error fetching bank configs:", error);
        return [];
    }
}

export async function createBankConfig(data: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    isDefault?: boolean;
}) {
    try {
        // If this is set to default, unset others first
        if (data.isDefault) {
            await prisma.bankConfig.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }

        const bank = await prisma.bankConfig.create({
            data: {
                bankName: data.bankName,
                accountName: data.accountName,
                accountNumber: data.accountNumber,
                isDefault: data.isDefault || false
            }
        });

        revalidatePath("/admin/bank");
        return { success: true, data: bank };
    } catch (error: any) {
        console.error("Error creating bank config:", error);
        return { success: false, error: error.message || "Failed to create bank configuration" };
    }
}

export async function deleteBankConfig(id: string) {
    try {
        await prisma.bankConfig.delete({
            where: { id }
        });
        revalidatePath("/admin/bank");
        return { success: true };
    } catch (error) {
        console.error("Error deleting bank config:", error);
        return { success: false, error: "Failed to delete" };
    }
}

export async function toggleDefaultBank(id: string) {
    try {
        // Unset all first
        await prisma.bankConfig.updateMany({
            where: { isDefault: true },
            data: { isDefault: false }
        });

        // Set new default
        await prisma.bankConfig.update({
            where: { id },
            data: { isDefault: true }
        });

        revalidatePath("/admin/bank");
        return { success: true };
    } catch (error) {
        console.error("Error setting default bank:", error);
        return { success: false, error: "Failed to set default" };
    }
}
