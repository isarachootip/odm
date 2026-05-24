
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.product.count();
    console.log(`📊 Current Product Count: ${count}`);

    if (count > 0) {
        const first = await prisma.product.findFirst();
        console.log("Sample:", first);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
