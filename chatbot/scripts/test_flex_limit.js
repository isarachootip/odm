const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.category.count();
        console.log('Total categories:', count);

        let categories = await prisma.category.findMany({
            include: { _count: { select: { Product: true } } },
            orderBy: { name: 'asc' }
        });

        console.log(`Categories length: ${categories.length}`);

        if (categories.length > 9) {
            console.log("WARNING: Carousel will exceed 10 bubbles if categories > 9. (1 order food + >9 categories > 10)");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
