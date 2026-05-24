const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Find the most recently created user
        const latestUser = await prisma.user.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        if (!latestUser) {
            console.log("❌ No users found!");
            return;
        }

        console.log(`Found latest user: ${latestUser.email} (${latestUser.name})`);

        // Update to ADMIN
        await prisma.user.update({
            where: { id: latestUser.id },
            data: { role: 'ADMIN' },
        });

        console.log("✅ SUCCESS! User has been promoted to ADMIN.");
        console.log("You can now access /admin");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
