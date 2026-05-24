const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking for Add-on Products...");

    const skus = ['2000604258645', '2000604305356'];

    for (const sku of skus) {
        const product = await prisma.product.findFirst({
            where: { sku: sku }
        });
        if (product) {
            console.log(`FOUND SKU ${sku}: ${product.name} (ID: ${product.id}, Price: ${product.price})`);
        } else {
            console.log(`MISSING SKU ${sku}`);
        }
    }

    console.log("\nSearching for 'Syrup'...");
    const syrups = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: 'Syrup', mode: 'insensitive' } },
                { name: { contains: 'ไซรัป', mode: 'insensitive' } }
            ]
        }
    });

    if (syrups.length > 0) {
        syrups.forEach(p => console.log(`FOUND Syrup variant: ${p.name} (ID: ${p.id}, SKU: ${p.sku}, Price: ${p.price})`));
    } else {
        console.log("No 'Syrup' product found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
