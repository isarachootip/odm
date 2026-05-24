const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    const password = '123456';

    try {
        console.log(`Checking login for: ${email}`);

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log("❌ User not found in DB!");
            return;
        }

        console.log("✅ User found:", user.email, "Rule:", user.role);
        console.log("Stored Hash:", user.password);

        console.log("Comparing password...");
        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {
            console.log("✅ Password MATCHES! Login should work.");
        } else {
            console.log("❌ Password DOES NOT match.");
            // Let's try to generate a new hash and see
            const newHash = await bcrypt.hash(password, 10);
            console.log("New test hash would be:", newHash);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
