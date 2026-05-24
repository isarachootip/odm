
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.production' });
const prisma = new PrismaClient();

async function main() {
    console.log("Checking database for products shown in screenshot...");

    const searchTerms = [
        "Yuzu Orange Soda Cold",
        "Yuzu Orange Matcha Cold",
        "Thai Milk Tea Hot"
    ];

    const products = await prisma.product.findMany({
        where: {
            OR: searchTerms.map(term => ({
                name: { contains: term }
            }))
        },
        select: {
            id: true,
            name: true,
            price: true,
            category: true
        }
    });

    console.log(`Found ${products.length} matching products:`);
    products.forEach(p => {
        console.log(`- ${p.name} (${p.price} THB) [${p.category}]`);
    });

    if (products.length === 0) {
        console.log("❌ No matching products found. The database might be empty or different.");

        // List some existing products to see what's there
        const allProducts = await prisma.product.findMany({ take: 5 });
        console.log("--- First 5 products in DB ---");
        console.log(allProducts);
    } else {
        console.log("✅ Database content MATCHES the screenshot!");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
