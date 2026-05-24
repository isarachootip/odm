
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Database Content...");

    // Check Categories
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { Product: true }
                }
            }
        });
        console.log(`\nFound ${categories.length} Categories:`);
        categories.forEach(c => {
            console.log(`- ${c.name}`);
            console.log(`  URL: '${c.image}'`);
        });

        if (categories.length === 0) {
            console.log("⚠️ WARNING: No categories found! This is why 'Menu' shows nothing.");
        }

    } catch (e) {
        console.error("Error fetching categories:", e);
    }

    // Check Products
    try {
        const productCount = await prisma.product.count();
        console.log(`\nTotal Products: ${productCount}`);
    } catch (e) {
        console.error("Error fetching products:", e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
