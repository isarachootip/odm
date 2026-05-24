"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Create Category
export async function createCategory(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const image = formData.get("image") as string;

    if (!name || !slug) {
        throw new Error("Name and Slug are required");
    }

    try {
        await prisma.category.create({
            data: {
                name,
                slug: slug.toLowerCase().replace(/\s+/g, '-'), // Basic slugify
                image: image || null,
            },
        });
    } catch (error) {
        console.error("Create Category Error:", error);
        throw new Error("Failed to create category. Slug might already exist.");
    }

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    redirect("/admin/categories");
}

// Update Category
export async function updateCategory(id: string, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const image = formData.get("image") as string;

    if (!name || !slug) {
        throw new Error("Name and Slug are required");
    }

    try {
        const updateData: any = {
            name,
            slug: slug.toLowerCase().replace(/\s+/g, '-'),
        };

        // Only update image if it's provided and not empty
        if (image && image.trim() !== "") {
            updateData.image = image;
        }

        await prisma.category.update({
            where: { id },
            data: updateData,
        });
    } catch (error) {
        console.error("Update Category Error:", error);
        throw new Error("Failed to update category. Slug might already exist.");
    }

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);
    revalidatePath("/categories");
    redirect("/admin/categories");
}

// Delete Category
export async function deleteCategory(id: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    try {
        await prisma.category.delete({
            where: { id },
        });
        revalidatePath("/admin/categories");
        revalidatePath("/categories");
    } catch (error) {
        console.error("Delete Category Error:", error);
        throw new Error("Failed to delete category");
    }
}
