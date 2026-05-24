
const { PrismaClient } = require('@prisma/client');

// Force production environment to ensure we use the production DB url from .env
// or we can just rely on the loaded env vars.
// The script will use the .env from the current directory if run with `node -r dotenv/config ...` 
// or if we strictly check the process.env

const prisma = new PrismaClient();

async function main() {
    console.log('--- Verification Script for Odm_vidwa ---');

    // 1. Check Database Connection String (Masked)
    const datasources = Reflect.get(prisma, '_engineConfig')?.datasources || [];
    // Prisma doesn't easily expose the URL in client, but we can check process.env
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

    if (!dbUrl) {
        console.error('❌ DATABASE_URL is not set!');
    } else {
        if (dbUrl.includes('odm_vidwa_db')) {
            console.log('✅ Connected to database: odm_vidwa_db');
        } else {
            console.error('❌ Connected to WRONG database!');
            console.log('URL: ' + dbUrl.replace(/:[^:]*@/, ':***@'));
        }
    }

    // 2. Check API Key
    if (process.env.API_KEY_VIDWA) {
        console.log('✅ API_KEY_VIDWA is set.');
    } else {
        console.error('❌ API_KEY_VIDWA is MISSING.');
    }

    // 3. Test Query
    try {
        const userCount = await prisma.user.count();
        const orderCount = await prisma.order.count();
        const productCount = await prisma.product.count();

        console.log(`\n--- Database Stats ---`);
        console.log(`Users: ${userCount}`);
        console.log(`Orders: ${orderCount}`);
        console.log(`Products: ${productCount}`);

        if (userCount >= 0) {
            console.log('\n✅ Database connection and query successful.');
        }

    } catch (e) {
        console.error('\n❌ Database query failed:', e.message);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
