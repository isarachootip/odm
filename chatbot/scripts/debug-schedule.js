const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    const config = await prisma.shopConfig.findFirst();
    console.log("Current Shop Config:", JSON.stringify(config, null, 2));

    // Test Time Calculation
    const now = new Date();
    const bangkokString = now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
    const bangkokTime = new Date(bangkokString);
    const currentMinutes = bangkokTime.getHours() * 60 + bangkokTime.getMinutes();

    console.log("Server Time (UTC):", now.toISOString());
    console.log("Bangkok String:", bangkokString);
    console.log("Calculated Bangkok Hours:", bangkokTime.getHours());
    console.log("Calculated Current Minutes:", currentMinutes);

    if (config) {
        if (config.isScheduleEnabled && config.openTime && config.closeTime) {
            const [openH, openM] = config.openTime.split(":").map(Number);
            const openMinutes = openH * 60 + openM;

            const [closeH, closeM] = config.closeTime.split(":").map(Number);
            const closeMinutes = closeH * 60 + closeM;

            console.log(`Open: ${config.openTime} (${openMinutes})`);
            console.log(`Close: ${config.closeTime} (${closeMinutes})`);

            if (currentMinutes < openMinutes) console.log("Result: NOT OPEN YET");
            else if (currentMinutes >= closeMinutes) console.log("Result: CLOSED");
            else console.log("Result: OPEN");
        } else {
            console.log("Schedule Disabled or Missing Times");
        }
    } else {
        console.log("No Shop Config found");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
