const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.order.count();
    console.log(`Current Order Count: ${count}`);

    if (count > 0) {
        const latest = await prisma.order.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        console.log('Latest Order:', latest);
    } else {
        console.log('✅ System is clean and ready for new orders.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
