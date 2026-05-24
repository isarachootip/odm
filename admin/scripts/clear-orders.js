const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting Database Cleanup (Orders Only)...');

    try {
        // 1. Unlink CartSessions from Orders (to avoid FK constraints)
        console.log('1. Unlinking CartSessions...');
        const updatedSessions = await prisma.cartSession.updateMany({
            where: { orderId: { not: null } },
            data: { orderId: null, state: null, items: [], tempData: {} }
        });
        console.log(`   - Unlinked/Reset ${updatedSessions.count} sessions.`);

        // 2. Delete OrderItems
        console.log('2. Deleting OrderItems...');
        const deletedItems = await prisma.orderItem.deleteMany({});
        console.log(`   - Deleted ${deletedItems.count} items.`);

        // 3. Delete Orders
        console.log('3. Deleting Orders...');
        const deletedOrders = await prisma.order.deleteMany({});
        console.log(`   - Deleted ${deletedOrders.count} orders.`);

        console.log('✅ Database Cleanup Completed Successfully!');
    } catch (error) {
        console.error('❌ Error clearing database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
