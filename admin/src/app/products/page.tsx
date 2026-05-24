import { SearchInput } from "@/components/ui/SearchInput";
import { CategoryDropdown } from "@/components/product/CategoryDropdown";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getProducts(searchParams: { category?: string; min?: string; max?: string; q?: string }) {
    // Basic filtering logic
    const where: any = {};
    if (searchParams.category) {
        where.Category = { slug: searchParams.category };
    }
    if (searchParams.min) where.price = { gte: Number(searchParams.min) };
    if (searchParams.max) where.price = { lte: Number(searchParams.max) };
    if (searchParams.q) {
        where.OR = [
            { name: { contains: searchParams.q, mode: 'insensitive' } },
            { description: { contains: searchParams.q, mode: 'insensitive' } }
        ];
    }

    const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { Category: true }
    });

    // Map Prisma result to Frontend Product Interface
    return products.map(p => ({
        id: p.id,
        name: p.name,
        nameTh: p.name, // Schema removed nameTh, use name as fallback
        description: p.description || "",
        price: Number(p.price) || 0,
        salePrice: undefined,
        images: p.images.length > 0 ? p.images : ['/placeholder.jpg'],
        category: p.Category?.name || "Uncategorized",
        inStock: p.inventory > 0,
        isNew: (new Date().getTime() - new Date(p.createdAt).getTime()) < (7 * 24 * 60 * 60 * 1000)
    })) as Product[];
}

export default async function ProductsPage(props: { searchParams: Promise<{ category?: string; min?: string; max?: string; q?: string }> }) {
    const searchParams = await props.searchParams;
    const products = await getProducts(searchParams);
    // Map categories to have a slug (using name)
    const industries = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    const categories = industries.map(c => ({ ...c }));

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">สินค้าทั้งหมด</h1>
                    <p className="text-muted-foreground mt-1">แสดง {products.length} รายการ</p>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <CategoryDropdown categories={categories} />
                    <SearchInput />
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {/* Product Grid - Full Width */}
                <div className="flex-1">
                    {/* Changed grid-cols-1 to grid-cols-2 for mobile responsiveness */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    {products.length === 0 && (
                        <div className="py-24 text-center">
                            <h3 className="text-lg font-medium">ไม่พบสินค้า</h3>
                            <p className="text-muted-foreground">ลองปรับตัวกรองดูนะครับ</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
