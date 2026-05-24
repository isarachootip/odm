import { prisma } from "@/lib/prisma";
import { ProductManagementClient } from "@/components/admin/ProductManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            Category: true
        }
    });

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" }
    });

    return <ProductManagementClient initialProducts={products as any} categories={categories} />;
}
