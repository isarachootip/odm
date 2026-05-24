const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to database...');
    console.log('URL:', process.env.DATABASE_URL?.substring(0, 20) + '...');

    try {
        const categories = await prisma.category.findMany({
            take: 20,
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { Product: true }
                }
            }
        });

        console.log('\n--- Checking for Legacy Products ---');
        const legacyProduct = await prisma.product.findFirst({
            where: { name: { contains: 'Americano' } }
        });

        if (legacyProduct) {
            console.log("[RESULT] CHECK_LEGACY: FOUND");
        } else {
            console.log("[RESULT] CHECK_LEGACY: NOT_FOUND");
        }

        console.log('\n--- Category Names ---');
        categories.forEach(c => console.log(` - ${c.name} (Products: ${c._count.Product})`));

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
