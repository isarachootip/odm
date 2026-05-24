const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function verifyFix() {
    console.log("Verifying DB fix...");
    const orderNumber = `TEST-${Date.now()}`;

    try {
        // Attempt to create an order WITH customerDepartment
        console.log("Attempting to create order with customerDepartment...");
        const order = await prisma.order.create({
            data: {
                customerName: "Test Verification",
                customerPhone: "0000000000",
                customerDepartment: "IT-TEST", // <--- THE CRITICAL FIELD
                deliveryType: "PICKUP",
                total: 10,
                status: "PENDING",
                orderNumber: orderNumber
            }
        });

        console.log(`✅ Success! Order created with ID: ${order.id}`);
        console.log(`Verified Department: ${order.customerDepartment}`);

        // Cleanup
        console.log("Cleaning up test order...");
        await prisma.order.delete({ where: { id: order.id } });
        console.log("Cleanup complete.");
        process.exit(0);

    } catch (e) {
        console.error("❌ Verification Failed!");
        console.error(e);
        process.exit(1);
    }
}

verifyFix();
