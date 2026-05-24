const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log("Disabling SlipOK for all PaymentConfigs...");
    const result = await prisma.paymentConfig.updateMany({
        data: {
            isSlipokEnabled: false
        }
    });
    console.log(`Updated ${result.count} records.`);
    
    // Check current state
    const configs = await prisma.paymentConfig.findMany();
    console.log(configs.map(c => ({id: c.id, isDefault: c.isDefault, isSlipokEnabled: c.isSlipokEnabled, branchId: c.branchId})));
}
main().catch(console.error).finally(() => prisma.$disconnect());
