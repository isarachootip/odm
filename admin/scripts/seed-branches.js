require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding branches...');

    const branches = [
        { name: 'BKM', code: 'BKM' },
        { name: 'VIDWA', code: 'VIDWA' }
    ];

    for (const b of branches) {
        const branch = await prisma.branch.upsert({
            where: { code: b.code },
            update: {},
            create: {
                name: b.name,
                code: b.code,
            }
        });
        console.log(`Upserted branch: ${branch.name} (${branch.code})`);
    }

    console.log('Done.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
