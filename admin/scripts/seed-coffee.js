
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("☕ Seeding Coffee & Bakery Menu (Bilingual)...");

    // 1. Categories
    const categories = [
        { name: "Coffee", slug: "coffee" },
        { name: "Beverage", slug: "beverage" },
        { name: "Food", slug: "food" },
        { name: "Bakery", slug: "bakery" }
    ];

    const categoryMap = {};

    for (const cat of categories) {
        const result = await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                name: cat.name,
                slug: cat.slug,
                image: "https://placehold.co/400"
            }
        });
        categoryMap[cat.slug] = result.id;
        console.log(`✅ Category: ${cat.name}`);
    }

    // 2. Bilingual Products
    const products = [
        // Coffee
        { name: "Espresso (เอสเพรสโซ่)", price: 40, cat: "coffee", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?auto=format&fit=crop&q=80&w=800" },
        { name: "Americano (อเมริกาโน่)", price: 45, cat: "coffee", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800" },
        { name: "Cappuccino (คาปูชิโน่)", price: 50, cat: "coffee", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=800" },
        { name: "Mocha (มอคค่า)", price: 55, cat: "coffee", image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=800" },

        // Beverage
        { name: "Red Soda (แดงโซดา)", price: 35, cat: "beverage", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800" },
        { name: "Fresh Milk (นมสด)", price: 35, cat: "beverage", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800" },
        { name: "Pink Milk (นมเย็น)", price: 40, cat: "beverage", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800" },

        // Bakery
        { name: "Croissant (ครัวซองต์)", price: 65, cat: "bakery", image: "https://images.unsplash.com/photo-1555507036-ab1f40388085?auto=format&fit=crop&q=80&w=800" },
        { name: "Chocolate Cake (เค้กช็อกโกแลต)", price: 85, cat: "bakery", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800" }
    ];

    console.log("🧹 Cleaning old products to update names...");
    // Delete existing products in these categories to avoid duplicates
    for (const cat of categories) {
        const catId = categoryMap[cat.slug];
        if (catId) {
            await prisma.product.deleteMany({ where: { categoryId: catId } });
        }
    }

    for (const p of products) {
        await prisma.product.create({
            data: {
                name: p.name,
                price: p.price,
                description: p.name,
                images: [p.image],
                categoryId: categoryMap[p.cat]
            }
        });
        console.log(`✅ Product: ${p.name}`);
    }

    console.log("🎉 Menu Seeding Complete!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
