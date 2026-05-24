import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/actions/admin-product";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: true }
    });

    if (!product) notFound();

    const categories = await prisma.category.findMany();

    // Bind ID to the server action
    const updateAction = updateProduct.bind(null, product.id);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
            <ProductForm
                categories={categories}
                product={product}
                action={updateAction}
            />
        </div>
    );
}
