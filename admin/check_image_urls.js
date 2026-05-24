
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Product Images...");
    const products = await prisma.product.findMany({
        take: 5,
        select: {
            name: true,
            images: true,
        }
    });

    products.forEach(p => {
        console.log(`Product: ${p.name}, Images: ${JSON.stringify(p.images)}`);
    });

    console.log("\nChecking Category Images...");
    const categories = await prisma.category.findMany({
        take: 5,
        select: {
            name: true,
            image: true,
        }
    });

    categories.forEach(c => {
        console.log(`Category: ${c.name}, Image: ${c.image}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
