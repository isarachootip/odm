const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function cleanOrphandata() {
    console.log("Checking for orphan OrderItems...");

    // Find OrderItems with invalid productId
    const orderItems = await prisma.orderItem.findMany({
        select: { id: true, productId: true }
    });

    // Get all valid Product IDs
    const products = await prisma.product.findMany({
        select: { id: true }
    });
    const productIds = new Set(products.map(p => p.id));

    const badItems = orderItems.filter(item => !productIds.has(item.productId));
    console.log(`Found ${badItems.length} orphan OrderItems.`);

    if (badItems.length > 0) {
        console.log("Deleting orphan OrderItems...");
        const badIds = badItems.map(i => i.id);
        await prisma.orderItem.deleteMany({
            where: {
                id: { in: badIds }
            }
        });
        console.log("Deleted orphans.");
    }

    // Also check for OrderItems pending invalid Orders if necessary, but the error was specifically "OrderItem_productId_fkey"
}

cleanOrphandata()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
