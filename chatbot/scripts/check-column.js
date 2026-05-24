const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function checkColumn() {
    const prisma = new PrismaClient();

    try {
        console.log('Checking database schema...');

        // Query the information schema to check if column exists
        const result = await prisma.$queryRawUnsafe(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Order' 
            AND column_name = 'customerDepartment';
        `);

        console.log('Query result:', result);

        if (Array.isArray(result) && result.length > 0) {
            console.log('✅ customerDepartment column EXISTS');
        } else {
            console.log('❌ customerDepartment column DOES NOT EXIST');
            console.log('Adding column now...');

            await prisma.$executeRawUnsafe(`
                ALTER TABLE "Order" 
                ADD COLUMN "customerDepartment" TEXT;
            `);

            console.log('✅ Column added!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

checkColumn();
