
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    console.log("Connecting to DB...");
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { Product: true }
                }
            }
        });

        console.log(`Found ${categories.length} categories:`);
        categories.forEach(c => {
            console.log(`- [${c.id}] ${c.name}`);
            console.log(`  Image: '${c.image}'`);
            console.log(`  Product Count: ${c._count.Product}`);

            // Validation check
            if (c.image && !c.image.startsWith('http')) {
                console.log("  ⚠️ WARNING: Image URL does not start with http");
            }
        });

    } catch (e) {
        console.error("Error fetching data:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
