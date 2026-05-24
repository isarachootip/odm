const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: {
            images: { isEmpty: false }
        },
        take: 5
    });

    console.log(`Checking ${products.length} products with images...`);

    for (const p of products) {
        if (!p.images || p.images.length === 0) continue;
        const url = p.images[0];
        try {
            const res = await fetch(url, { method: 'HEAD' });
            console.log(`[${res.status}] ${p.name.substring(0, 20)}... -> ${url.substring(0, 50)}...`);
        } catch (e) {
            console.error(`[ERR] ${p.name} -> ${e.message}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
