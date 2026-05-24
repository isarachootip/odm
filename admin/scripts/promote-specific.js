const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'isarachootip@gmail.com';
    console.log(`Checking role for: ${email}`);

    try {
        // Debugging
        console.log("Prisma keys:", Object.keys(prisma));
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log("❌ User not found!");
            return;
        }

        if (user.role === 'ADMIN') {
            console.log("✅ User is ALREADY an ADMIN.");
        } else {
            console.log("Found user, upgrading to ADMIN...");
            await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' },
            });
            console.log("✅ SUCCESS! Upgraded to ADMIN.");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
