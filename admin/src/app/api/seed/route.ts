import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // 1. Clean up existing data (optional, be careful in prod)
        await prisma.orderItem.deleteMany();
        await prisma.cartItem.deleteMany();
        // await prisma.product.deleteMany(); // Comment out if you want to keep existing
        // await prisma.category.deleteMany();

        // Check if data exists
        const count = await prisma.product.count();
        if (count > 0) {
            return NextResponse.json({ message: "Database already seeded!" });
        }

        // 2. Create Categories
        const catFashion = await prisma.category.create({
            data: { name: "Fashion", slug: "fashion" }
        });

        const catElectronics = await prisma.category.create({
            data: { name: "Electronics", slug: "electronics" }
        });

        const catHome = await prisma.category.create({
            data: { name: "Home & Living", slug: "home-living" }
        });

        // 3. Create Products
        const productsData = [
            {
                name: "Minimalist Cotton T-Shirt",
                description: "Premium organic cotton t-shirt with a relaxed fit. Perfect for everyday wear.",
                price: 490,
                categoryId: catFashion.id,
                images: [
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1887&auto=format&fit=crop"
                ],
                variants: {
                    create: [
                        { name: "Black / S", stock: 10, sku: "SHIRT-BLK-S" },
                        { name: "Black / M", stock: 10, sku: "SHIRT-BLK-M" },
                        { name: "White / S", stock: 10, sku: "SHIRT-WHT-S" },
                    ]
                }
            },
            {
                name: "Classic Denim Jacket",
                description: "Vintage-inspired denim jacket. Durable and stylish for any season.",
                price: 1590,
                categoryId: catFashion.id,
                images: ["https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=1887&auto=format&fit=crop"],
                isNew: true,
            },
            {
                name: "Wireless Noise Cancelling Headphones",
                description: "Immerse yourself in music with active noise cancellation and 30-hour battery life.",
                price: 8900,
                salePrice: 5990,
                categoryId: catElectronics.id,
                images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop"],
                variants: { create: [{ name: "Silver", stock: 5 }, { name: "Black", stock: 0 }] }
            },
            {
                name: "Smart Watch Series 5",
                description: "Track your fitness, heart rate, and notifications on your wrist.",
                price: 12900,
                categoryId: catElectronics.id,
                images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1964&auto=format&fit=crop"]
            },
            {
                name: "Ceramic Coffee Mug Set",
                description: "Handcrafted ceramic mugs, set of 4. Microwave and dishwasher safe.",
                price: 890,
                categoryId: catHome.id,
                images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=2070&auto=format&fit=crop"]
            },
            {
                name: "Modern Table Lamp",
                description: "Sleek minimalist lamp for your workspace or bedside table.",
                price: 2500,
                categoryId: catHome.id,
                images: ["https://images.unsplash.com/photo-1507473888900-52e1ad1459ee?q=80&w=1887&auto=format&fit=crop"]
            },
            {
                name: "Leather Crossbody Bag",
                description: "Genuine leather bag with adjustable strap. Elegant and functional.",
                price: 2500,
                salePrice: 1990,
                categoryId: catFashion.id,
                images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1769&auto=format&fit=crop"]
            },
            {
                name: "Canvas Sneakers",
                description: "Comfortable everyday sneakers with durable rubber sole.",
                price: 1200,
                categoryId: catFashion.id,
                images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1964&auto=format&fit=crop"]
            },
            {
                name: "4K Monitor 27-inch",
                description: "Crystal clear display for professionals and gamers.",
                price: 15900,
                categoryId: catElectronics.id,
                images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=2070&auto=format&fit=crop"]
            },
            {
                name: "Succulent Plant Set",
                description: "Artificial succulents in geometric pots. No maintenance needed.",
                price: 450,
                categoryId: catHome.id,
                images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=2072&auto=format&fit=crop"]
            }
        ];

        for (const p of productsData) {
            await prisma.product.create({
                data: {
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    promotionPrice: p.salePrice || null,
                    categoryId: p.categoryId,
                    images: p.images,
                    variants: p.variants,
                    // Add lat/lng or other defaults if schema requires, but currently optional
                }
            })
        }

        // 4. Create Admin User
        const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash("123456", 10);
            await prisma.user.create({
                data: {
                    name: "Admin User",
                    email: "admin@example.com",
                    password: hashedPassword,
                    role: "ADMIN"
                }
            });
        }

        return NextResponse.json({ message: "Seeding complete! Admin created (admin@example.com / 123456)", count: productsData.length });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
    }
}
