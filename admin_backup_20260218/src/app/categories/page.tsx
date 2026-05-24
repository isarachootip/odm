
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: {
            name: "asc",
        },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">หมวดหมู่ทั้งหมด</h1>

            {categories.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p>ไม่พบหมวดหมู่สินค้า</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/products?category=${category.slug}`}
                            className="group block"
                        >
                            <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card">
                                <div className="aspect-[4/3] relative bg-muted flex items-center justify-center overflow-hidden">
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="text-4xl text-muted-foreground/30 font-bold">
                                            {category.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {category._count.products} สินค้า
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
