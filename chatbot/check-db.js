const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = await prisma.category.findMany();
    console.log('Categories:', categories);
    const shopConfig = await prisma.shopConfig.findFirst();
    console.log('ShopConfig:', shopConfig);
}
main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
