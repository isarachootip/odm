"use server";

import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCustomer(data: {
    nickname: string;
    phone: string;
    department?: string;
    lineUserId?: string;
}) {
    try {
        // Check if phone or lineUserId already exists
        if (data.phone) {
            const existingPhone = await db.customerProfile.findFirst({
                where: { phone: data.phone }
            });

            if (existingPhone) {
                return { success: false, error: "เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว" };
            }
        }

        if (data.lineUserId) {
            const existingLine = await db.customerProfile.findUnique({
                where: { lineUserId: data.lineUserId }
            });
            if (existingLine) {
                 return { success: false, error: "LINE ID นี้มีอยู่ในระบบแล้ว" };
            }
        }


        const customer = await db.customerProfile.create({
            data: {
                nickname: data.nickname.trim(),
                phone: data.phone.trim(),
                department: data.department?.trim() || null,
                lineUserId: data.lineUserId?.trim() || `dummy_${Date.now()}`,
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/customers');
        return { success: true, customer };
    } catch (error: any) {
        console.error("Create Customer Error:", error);
        return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
    }
}

export async function updateCustomer(id: string, data: {
    nickname: string;
    phone: string;
    department?: string;
    lineUserId?: string;
}) {
    try {
        // Check if phone exists (excluding current customer)
        if (data.phone) {
            const existingPhone = await db.customerProfile.findFirst({
                where: {
                    phone: data.phone,
                    NOT: { id }
                }
            });

            if (existingPhone) {
                return { success: false, error: "เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว" };
            }
        }
        
        if (data.lineUserId) {
            const existingLine = await db.customerProfile.findFirst({
                where: {
                    lineUserId: data.lineUserId,
                    NOT: { id }
                }
            });
            if (existingLine) {
                 return { success: false, error: "LINE ID นี้มีอยู่ในระบบแล้ว" };
            }
        }

        const customer = await db.customerProfile.update({
            where: { id },
            data: {
                nickname: data.nickname.trim(),
                phone: data.phone.trim(),
                department: data.department?.trim() || null,
                lineUserId: data.lineUserId?.trim() || undefined,
                updatedAt: new Date()
            }
        });

        revalidatePath('/admin/customers');
        revalidatePath(`/admin/customers/${id}`);
        return { success: true, customer };
    } catch (error: any) {
        console.error("Update Customer Error:", error);
        return { success: false, error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
    }
}

export async function deleteCustomer(id: string) {
    try {
        // Unlink orders from this customer to preserve order history
        await db.order.updateMany({
            where: { customerProfileId: id },
            data: { customerProfileId: null }
        });

        // Delete the customer
        await db.customerProfile.delete({
            where: { id }
        });

        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error: any) {
        console.error("Delete Customer Error:", error);
        return { success: false, error: "เกิดข้อผิดพลาดในการลบข้อมูล" };
    }
}
