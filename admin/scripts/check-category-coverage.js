
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("📊 Checking Category Coverage...");

    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: { Product: true }
            }
        }
    });

    let totalProducts = 0;
    console.log("\n--- Category Breakdown ---");
    for (const cat of categories) {
        console.log(`- ${cat.name}: ${cat._count.Product} items`);
        totalProducts += cat._count.Product;
    }

    const uncategorizedCount = await prisma.product.count({
        where: { Category: { is: null } } // Should be impossible with schema, but checking logical orphanage
    });

    const realTotal = await prisma.product.count();

    console.log("\n--- Summary ---");
    console.log(`Total Products in DB: ${realTotal}`);
    console.log(`Total Categorized: ${totalProducts}`);

    if (realTotal === totalProducts) {
        console.log("✅ COVERAGE IS 100%. All products have a category.");
    } else {
        console.log("⚠️ Discrepancy found!");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
