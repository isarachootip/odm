const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Searching for products by name...");

    // Search queries
    const queries = ["Extra Shot", "เพิ่มช็อต", "Honey", "น้ำผึ้ง", "Syrup", "ไซรัป"];

    for (const query of queries) {
        const products = await prisma.product.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive'
                }
            }
        });

        if (products.length > 0) {
            products.forEach(p => {
                console.log(`FOUND '${query}': ${p.name} (ID: ${p.id}, Price: ${p.price})`);
            });
        } else {
            console.log(`NOT FOUND: '${query}'`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
