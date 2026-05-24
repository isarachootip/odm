
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.production' }); // Ensure we use the prod DB
const prisma = new PrismaClient();

async function main() {
    console.log("🍊 Seeding Yuzu & Thai Tea Series...");

    const products = [
        // Yuzu Series
        {
            name: "Yuzu Orange Soda Cold",
            price: 30,
            description: "Refreshing Yuzu Orange Soda (Cold)",
            category: "Beverage",
            group: "Yuzu",
            zone: "food",
            image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800"
        },
        {
            name: "Yuzu Orange Matcha Cold",
            price: 45,
            description: "Perfect blend of Yuzu and Matcha (Cold)",
            category: "Beverage",
            group: "Yuzu",
            zone: "food",
            image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&q=80&w=800"
        },
        {
            name: "Yuzu Orange Americano Cold",
            price: 45,
            description: "Yuzu infused Americano (Cold)",
            category: "Coffee",
            group: "Yuzu",
            zone: "food",
            image: "https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?auto=format&fit=crop&q=80&w=800"
        },
        // Thai Tea Series
        {
            name: "Thai Milk Tea Hot",
            price: 25,
            description: "Traditional Thai Milk Tea (Hot)",
            category: "Beverage",
            group: "Tea",
            zone: "food",
            image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&q=80&w=800"
        },
        {
            name: "Thai Milk Tea Frappe",
            price: 35,
            description: "Thai Milk Tea Frappe (Blended)",
            category: "Beverage",
            group: "Tea",
            zone: "food",
            image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=800"
        },
        {
            name: "Thai Milk Tea Cold",
            price: 30,
            description: "Classic Thai Milk Tea (Cold)",
            category: "Beverage",
            group: "Tea",
            zone: "food",
            image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800"
        }
    ];

    for (const p of products) {
        // Check duplication by name
        const existing = await prisma.product.findFirst({
            where: { name: p.name }
        });

        if (!existing) {
            await prisma.product.create({
                data: p
            });
            console.log(`✅ Created: ${p.name}`);
        } else {
            console.log(`ℹ️ Already exists: ${p.name}`);
        }
    }

    console.log("🎉 Seeding Finished!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
