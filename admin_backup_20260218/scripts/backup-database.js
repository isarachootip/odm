// Backup all Products, Categories, and Orders to JSON files
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
    console.log('📦 Starting database backup...\n');

    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupPath = path.join(backupDir, `backup-${timestamp}`);
    fs.mkdirSync(backupPath);

    try {
        // Backup Products with variants
        console.log('📸 Backing up Products...');
        const products = await prisma.product.findMany({
            include: { variants: true }
        });
        fs.writeFileSync(
            path.join(backupPath, 'products.json'),
            JSON.stringify(products, null, 2)
        );
        console.log(`✅ Backed up ${products.length} products`);

        // Backup Categories
        console.log('📸 Backing up Categories...');
        const categories = await prisma.category.findMany();
        fs.writeFileSync(
            path.join(backupPath, 'categories.json'),
            JSON.stringify(categories, null, 2)
        );
        console.log(`✅ Backed up ${categories.length} categories`);

        // Backup Orders
        console.log('📸 Backing up Orders...');
        const orders = await prisma.order.findMany({
            include: { items: true }
        });
        fs.writeFileSync(
            path.join(backupPath, 'orders.json'),
            JSON.stringify(orders, null, 2)
        );
        console.log(`✅ Backed up ${orders.length} orders`);

        // Backup Users
        console.log('📸 Backing up Users...');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        fs.writeFileSync(
            path.join(backupPath, 'users.json'),
            JSON.stringify(users, null, 2)
        );
        console.log(`✅ Backed up ${users.length} users`);

        console.log(`\n🎉 Backup completed successfully!`);
        console.log(`📁 Backup location: ${backupPath}`);
        console.log(`\n📊 Summary:`);
        console.log(`   Products: ${products.length}`);
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Orders: ${orders.length}`);
        console.log(`   Users: ${users.length}`);

        return backupPath;
    } catch (error) {
        console.error('❌ Backup failed:', error);
        throw error;
    }
}

backupDatabase()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
