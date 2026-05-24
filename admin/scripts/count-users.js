const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.user.count();
    console.log(`User Rows: ${count}`);

    // Also list roles
    const users = await prisma.user.findMany({ select: { role: true } });
    const admins = users.filter(u => u.role === 'ADMIN').length;
    console.log(`Admins: ${admins}`);
    console.log(`Customers: ${users.length - admins}`);
}

main().finally(() => prisma.$disconnect());
