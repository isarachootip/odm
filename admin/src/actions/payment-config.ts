"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Helper to log changes
async function logPaymentChange(action: string, details: string, targetId?: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        await prisma.paymentLog.create({
            data: {
                action,
                details,
                targetId,
                userId: userId || null // Null if system or unauthenticated (shouldn't happen in admin)
            }
        });
    } catch (error) {
        console.error("Failed to create audit log:", error);
    }
}

export async function getPaymentConfigs() {
    try {
        return await prisma.paymentConfig.findMany({
            orderBy: { createdAt: "desc" }
        });
    } catch (error) {
        console.error("Error fetching payment configs:", error);
        return [];
    }
}

export async function getPaymentLogs() {
    try {
        return await prisma.paymentLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 20,
            include: { User: { select: { name: true, email: true } } }
        });
    } catch (error) {
        console.error("Error fetching logs:", error);
        return [];
    }
}

export async function createPaymentConfig(data: {
    paymentType: string;
    bankName?: string;
    accountName: string;
    accountNumber?: string;
    promptpayNumber?: string;
    isDefault?: boolean;
}) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");

        // If default, unset others
        if (data.isDefault) {
            await prisma.paymentConfig.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }

        const config = await prisma.paymentConfig.create({
            data: {
                paymentType: data.paymentType,
                bankName: data.bankName,
                accountName: data.accountName,
                accountNumber: data.accountNumber,
                promptpayNumber: data.promptpayNumber,
                isDefault: data.isDefault || false
            }
        });

        await logPaymentChange(
            "CREATE",
            `Created ${data.paymentType} account: ${data.bankName || data.promptpayNumber}`,
            config.id
        );

        revalidatePath("/admin/bank");
        return { success: true, data: config };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updatePaymentConfig(id: string, data: {
    paymentType: string;
    bankName?: string;
    accountName: string;
    accountNumber?: string;
    promptpayNumber?: string;
    isDefault?: boolean;
}) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");

        const existing = await prisma.paymentConfig.findUnique({ where: { id } });
        if (!existing) throw new Error("Config not found");

        // If default, unset others
        if (data.isDefault && !existing.isDefault) {
            await prisma.paymentConfig.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }

        const updated = await prisma.paymentConfig.update({
            where: { id },
            data: {
                paymentType: data.paymentType,
                bankName: data.bankName,
                accountName: data.accountName,
                accountNumber: data.accountNumber,
                promptpayNumber: data.promptpayNumber,
                isDefault: data.isDefault
            }
        });

        // Detect major changes for log details
        const details = [];
        if (existing.isDefault !== data.isDefault) details.push(`Default: ${existing.isDefault} -> ${data.isDefault}`);
        if (existing.accountName !== data.accountName) details.push(`Name: ${existing.accountName} -> ${data.accountName}`);
        if (existing.accountNumber !== data.accountNumber) details.push(`AccNo: ${existing.accountNumber} -> ${data.accountNumber}`);

        await logPaymentChange(
            "UPDATE",
            `Updated ${updated.bankName || "Account"}: ${details.join(", ") || "Modified details"}`,
            updated.id
        );

        revalidatePath("/admin/bank");
        return { success: true, data: updated };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePaymentConfig(id: string) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");

        const existing = await prisma.paymentConfig.findUnique({ where: { id } });
        await prisma.paymentConfig.delete({ where: { id } });

        await logPaymentChange(
            "DELETE",
            `Deleted ${existing?.bankName || existing?.paymentType} account`,
            id
        );

        revalidatePath("/admin/bank");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleDefaultPayment(id: string) {
    try {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");

        const target = await prisma.paymentConfig.findUnique({ where: { id } });
        if (!target) throw new Error("Not found");

        if (target.isDefault) return { success: true }; // Already default

        // Unset all
        await prisma.paymentConfig.updateMany({
            where: { isDefault: true },
            data: { isDefault: false }
        });

        // Set target
        await prisma.paymentConfig.update({
            where: { id },
            data: { isDefault: true }
        });

        await logPaymentChange(
            "SET_DEFAULT",
            `Set ${target.bankName || target.paymentType} as Default`,
            id
        );

        revalidatePath("/admin/bank");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
