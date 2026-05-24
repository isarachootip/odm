const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
    const backupDir = path.join(__dirname, "../backups");
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const currentBackupDir = path.join(backupDir, `backup-${timestamp}`);
    fs.mkdirSync(currentBackupDir);

    console.log(`Starting backup to ${currentBackupDir}...`);

    // 1. Products
    const products = await prisma.product.findMany({ include: { variants: true } });
    fs.writeFileSync(path.join(currentBackupDir, "products.json"), JSON.stringify(products, null, 2));
    console.log(`Exported ${products.length} products.`);

    // 2. Categories
    const categories = await prisma.category.findMany();
    fs.writeFileSync(path.join(currentBackupDir, "categories.json"), JSON.stringify(categories, null, 2));
    console.log(`Exported ${categories.length} categories.`);

    // 3. Orders
    const orders = await prisma.order.findMany({ include: { items: true } });
    fs.writeFileSync(path.join(currentBackupDir, "orders.json"), JSON.stringify(orders, null, 2));
    console.log(`Exported ${orders.length} orders.`);

    // 4. Payment Config
    const paymentConfigs = await prisma.paymentConfig.findMany();
    fs.writeFileSync(path.join(currentBackupDir, "payment_configs.json"), JSON.stringify(paymentConfigs, null, 2));
    console.log(`Exported ${paymentConfigs.length} payment configs.`);

    // 5. Users
    const users = await prisma.user.findMany();
    fs.writeFileSync(path.join(currentBackupDir, "users.json"), JSON.stringify(users, null, 2));
    console.log(`Exported ${users.length} users.`);

    // 6. Payment Logs
    try {
        const logs = await prisma.paymentLog.findMany();
        fs.writeFileSync(path.join(currentBackupDir, "payment_logs.json"), JSON.stringify(logs, null, 2));
        console.log(`Exported ${logs.length} payment logs.`);
    } catch (e) {
        console.log("Payment logs table might not exist in client yet strict check, skipping.");
    }

    console.log("Backup completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
