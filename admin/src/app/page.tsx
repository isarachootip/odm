import { Hero } from "@/components/layout/Hero";
import { ProductCard } from "@/components/product/ProductCard";
import { prisma } from "@/lib/prisma";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  const products = await prisma.product.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: { Category: true }
  });

  return products.map(p => ({
    ...p,
    price: Number(p.price),
    salePrice: p.promotionPrice ? Number(p.promotionPrice) : undefined,
    isNew: true, // For demo
    category: p.Category?.name || "Featured",
    inStock: true,
    images: p.images.length > 0 ? p.images : ['/placeholder.jpg'],
  })) as Product[];
}


export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <Hero />

      {/* Featured / Promotion Strip (Placeholder) */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-gray-100 p-6 flex flex-col justify-center items-start">
            <h3 className="font-bold text-lg">สินค้ามาใหม่</h3>
            <p className="text-sm text-muted-foreground mb-4">อัปเดตเทรนด์ล่าสุดก่อนใคร</p>
            <div className="h-1 w-12 bg-primary"></div>
          </div>
          <div className="rounded-lg bg-gray-100 p-6 flex flex-col justify-center items-start">
            <h3 className="font-bold text-lg">สินค้าขายดี</h3>
            <p className="text-sm text-muted-foreground mb-4">ยอดนิยมในรอบเดือน</p>
            <div className="h-1 w-12 bg-primary"></div>
          </div>
          <div className="rounded-lg bg-gray-100 p-6 flex flex-col justify-center items-start">
            <h3 className="font-bold text-lg">Flash Sale</h3>
            <p className="text-sm text-muted-foreground mb-4">ลดสูงสุด 70%</p>
            <div className="h-1 w-12 bg-primary"></div>
          </div>
        </div>
      </section>

      {/* Product List Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">สินค้าแนะนำ</h2>
          <Link href="/products">
            <Button variant="link">ดูสินค้าทั้งหมด &rarr;</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {featuredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <p>No products found. (Run /api/seed to populate)</p>
            </div>
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
