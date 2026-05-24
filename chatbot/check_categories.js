
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking Categories...");
    const categories = await prisma.category.findMany({
        select: {
            name: true,
            image: true,
            id: true
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
