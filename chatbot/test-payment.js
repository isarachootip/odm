const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const configs = await prisma.paymentConfig.findMany({ where: { isDefault: true } });
    console.log(configs);
}
main().finally(() => prisma.$disconnect());
