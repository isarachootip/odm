"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteProduct(id: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

    try {
        await prisma.product.delete({ where: { id } });
        revalidatePath("/admin/products");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete product" };
    }
}

export async function createProduct(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string; // Fixed: use categoryId
    const image = formData.get("image") as string;

    // Variants: JSON array
    const variantsJson = formData.get("variants") as string;

    if (!name || !price || !categoryId) {
        return { error: "Missing required fields" };
    }

    try {
        let variantsData: any[] = [];
        if (variantsJson) {
            try {
                variantsData = JSON.parse(variantsJson);
            } catch (e) {
                console.error("Failed to parse variants JSON", e);
            }
        }

        await prisma.product.create({
            data: {
                name,
                description,
                price,
                categoryId, // Fixed: use categoryId
                images: image ? [image] : [], // Fixed: use images array
                variants: {
                    create: variantsData.map((v: any) => ({
                        name: v.name,
                        price: Number(v.price) || null,
                        stock: 0
                    }))
                }
            }
        });
    } catch (error) {
        console.error(error);
        return { error: "Failed to create product" };
    }

    revalidatePath("/admin/products");
    redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string; // Fixed: use categoryId
    const image = formData.get("image") as string;
    const variantsJson = formData.get("variants") as string;

    try {
        let variantsData: any[] = [];
        if (variantsJson) {
            try {
                variantsData = JSON.parse(variantsJson);
            } catch (e) {
                console.error("Failed to parse variants JSON", e);
            }
        }

        // Transaction: Update Product & Reset Variants
        await prisma.$transaction(async (tx) => {
            await tx.product.update({
                where: { id },
                data: {
                    name,
                    description,
                    price,
                    categoryId,
                    ...(image ? { images: [image] } : {}), // Only update image if provided
                }
            });

            // Replace Variants (Simplest logic for Admin)
            if (variantsData.length > 0) {
                await tx.productVariant.deleteMany({ where: { productId: id } });
                await tx.productVariant.createMany({
                    data: variantsData.map((v: any) => ({
                        productId: id,
                        name: v.name,
                        price: Number(v.price) || null,
                        stock: 0
                    }))
                });
            }
        });

    } catch (error) {
        console.error(error);
        return { error: "Failed to update product" };
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    redirect("/admin/products");
}
