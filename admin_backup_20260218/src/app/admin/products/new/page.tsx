import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/actions/admin-product";

export default async function AddProductPage() {
    const categories = await prisma.category.findMany();

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
            <ProductForm categories={categories} action={createProduct} />
        </div>
    );
}
