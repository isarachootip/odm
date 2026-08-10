import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";

async function getProduct(id: string) {
    const p = await prisma.product.findUnique({
        where: { id },
    });

    if (!p) return null;

    return {
        ...p,
        price: Number(p.price),
        salePrice: p.promotionPrice ? Number(p.promotionPrice) : undefined,
        category: "General", // Should fetch category name relation
        inStock: true,
    } as Product;
}

async function getRelatedProducts() {
    const products = await prisma.product.findMany({
        take: 4,
        orderBy: { createdAt: 'asc' }, // Just random for now
    });

    return products.map(p => ({
        ...p,
        price: Number(p.price),
        salePrice: p.promotionPrice ? Number(p.promotionPrice) : undefined,
        category: "General",
        inStock: true
    })) as Product[];
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);
    const relatedProducts = await getRelatedProducts();

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12">
            {/* Top Section: Gallery + Info */}
            <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-2">
                <ProductGallery images={product.images} />
                <ProductInfo product={product} />
            </div>

            {/* Details Tabs Section (Placeholder) */}
            <div className="mt-16">
                <div className="border-b">
                    <nav className="flex gap-8">
                        <button className="border-b-2 border-primary pb-4 text-sm font-semibold text-primary">
                            Product Details
                        </button>
                        <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-gray-300">
                            Specifications
                        </button>
                        <button className="border-b-2 border-transparent pb-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-gray-300">
                            Reviews (0)
                        </button>
                    </nav>
                </div>
                <div className="py-8 text-muted-foreground leading-relaxed">
                    <p>
                        {product.description || "No description available."}
                    </p>
                </div>
            </div>

            {/* Related Products Section */}
            <div className="mt-8 border-t pt-12">
                <h2 className="mb-6 text-2xl font-bold tracking-tight">You might also like</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>
        </div>
    );
}
