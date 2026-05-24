
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking OKPRODUCT database...");

    const searchTerms = ["Yuzu", "Thai Milk Tea"];

    const products = await prisma.product.findMany({
        where: {
            OR: searchTerms.map(term => ({
                name: { contains: term } // Case insensitive by default in some modes, but let's see
            }))
        },
        take: 10
    });

    console.log(`Found ${products.length} products matching '${searchTerms.join("' or '")}':`);
    products.forEach(p => {
        console.log(`- ${p.name} (${p.price})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
