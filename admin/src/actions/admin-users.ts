"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                image: true,
                branchId: true
            }
        });
        return { success: true, users };
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return { success: false, error: "Failed to fetch users" };
    }
}

export async function updateUserRole(userId: string, newRole: "ADMIN" | "CUSTOMER" | "STAFF" | "SUPERVISOR") {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole as any }, // cast because Prisma Schema might not have STAFF/SUPERVISOR yet
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to update user role:", error);
        return { success: false, error: "Failed to update role" };
    }
}

export async function updateUserBranch(userId: string, branchId: string | null) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { branchId },
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to update user branch:", error);
        return { success: false, error: "Failed to update branch" };
    }
}

export async function getBranches() {
    try {
        const branches = await prisma.branch.findMany({
            orderBy: { name: 'asc' }
        });
        return { success: true, branches };
    } catch (error) {
        console.error("Failed to fetch branches:", error);
        return { success: false, error: "Failed to fetch branches" };
    }
}

export async function createUser(firstName: string, email: string, password: string, role: "ADMIN" | "CUSTOMER" | "STAFF" | "SUPERVISOR", branchId?: string) {
    try {
        // 1. Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { success: false, error: "Email already exists" };
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create user
        await prisma.user.create({
            data: {
                name: firstName,
                email,
                password: hashedPassword,
                role: role as any,
                branchId: branchId || null
            }
        });

        revalidatePath("/admin/users");
        return { success: true };

    } catch (error: any) {
        console.error("Failed to create user:", error);
        return { success: false, error: error.message || "Failed to create user" };
    }
}

export async function updateUserPassword(userId: string, newPassword: string) {
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to update password:", error);
        return { success: false, error: "Failed to update password" };
    }
}
