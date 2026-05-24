// Test script to verify Prisma connection and product query
const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();

    try {
        console.log('Testing Prisma connection...');

        // 1. Test simple connection
        const count = await prisma.product.count();
        console.log(`✅ Products count: ${count}`);

        // 2. Test product query with Category relation
        const product = await prisma.product.findFirst({
            include: {
                variants: true,
                Category: true
            }
        });

        if (product) {
            console.log(`✅ Sample product: ${product.name}`);
            console.log(`   - ID: ${product.id}`);
            console.log(`   - Price: ${product.price}`);
            console.log(`   - CategoryId: ${product.categoryId}`);
            console.log(`   - Category: ${product.Category?.name || 'N/A'}`);
            console.log(`   - Images: ${JSON.stringify(product.images)}`);
            console.log(`   - Variants: ${product.variants.length}`);
        } else {
            console.log('⚠️ No products found in database');
        }

        // 3. Test categories
        const categories = await prisma.category.findMany();
        console.log(`✅ Categories: ${categories.length}`);
        categories.forEach(c => console.log(`   - ${c.name} (${c.id})`));

    } catch (error) {
        console.error('❌ Prisma Error:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
