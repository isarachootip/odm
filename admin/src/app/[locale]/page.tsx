import { HeroCarousel } from "@/components/layout/HeroCarousel";
import { ProductCard } from "@/components/product/ProductCard";
import { prisma } from "@/lib/prisma";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

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

const CATEGORIES = [
  { name: "Signature Drinks", image: "/images/food_theme/cat_signature.jpg" },
  { name: "Rice Dishes", image: "/images/food_theme/cat_ricedishes.jpg" },
  { name: "Appetizers", image: "/images/food_theme/cat_appetizers.jpg" },
  { name: "Desserts", image: "/images/food_theme/cat_desserts.jpg" },
];

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  const t = await getTranslations('Home');
  let banners: any[] = [];
  try {
    banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
  } catch (error) {
    console.error("Failed to fetch banners:", error);
  }

  return (
    <div className="flex flex-col gap-16 pb-20 bg-white">
      <HeroCarousel banners={banners} />


      {/* Discover the Menu Section */}
      <section className="container mx-auto px-4 mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
             <span className="font-extrabold text-orange-600">{t('exploreMenu')}</span>
          </h2>
          <Link href="/products" className="mt-4 sm:mt-0">
            <Button variant="outline" className="bg-orange-50 text-orange-600 border-none hover:bg-orange-100 font-semibold rounded-full px-6">
              {t('viewAll')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, idx) => (
            <Link key={idx} href="/products" className="group flex flex-col items-center">
              <div className="w-full aspect-[3/4] relative rounded-2xl overflow-hidden mb-4 bg-gray-100 shadow-sm transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-lg">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold text-gray-800 text-base group-hover:text-orange-600 transition-colors">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Product List Section */}
      <section className="container mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t('featuredProducts')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {featuredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <p>{t('noProducts')}</p>
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
