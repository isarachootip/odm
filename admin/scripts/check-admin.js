const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to database...");
        const userCount = await prisma.user.count();
        console.log(`Total users found: ${userCount}`);

        const admin = await prisma.user.findUnique({
            where: { email: 'admin@example.com' }
        });

        if (admin) {
            console.log("✅ Admin user FOUND:");
            console.log(`- ID: ${admin.id}`);
            console.log(`- Email: ${admin.email}`);
            console.log(`- Role: ${admin.role}`);
            console.log(`- Password Hash exists: ${!!admin.password}`);
        } else {
            console.log("❌ Admin user NOT FOUND");
        }
    } catch (e) {
        console.error("Error connecting to DB:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
