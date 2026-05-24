const { PrismaClient } = require('@prisma/client');

async function addMissingColumn() {
    const prisma = new PrismaClient();

    try {
        console.log('Adding customerDepartment column using raw SQL...');

        // Add column if it doesn't exist
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "Order" 
            ADD COLUMN IF NOT EXISTS "customerDepartment" TEXT;
        `);

        console.log('✅ Column added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

addMissingColumn();
