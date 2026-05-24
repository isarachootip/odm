const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Starting local seed...");

        // Check if admin verification is needed
        const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
        if (existingAdmin) {
            console.log("Admin already exists!");
            return;
        }

        // 1. Create Categories
        console.log("Creating categories...");
        const catFashion = await prisma.category.create({ data: { name: "Fashion", slug: "fashion-local" } });
        const catElectronics = await prisma.category.create({ data: { name: "Electronics", slug: "electronics-local" } });

        // 2. Create sample products
        console.log("Creating products...");
        await prisma.product.create({
            data: {
                name: "Test Admin Product",
                description: "Created via local seed script",
                price: 999,
                categoryId: catElectronics.id,
                images: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=2070&auto=format&fit=crop"]
            }
        });

        // 3. Create Admin User
        console.log("Creating Admin User...");
        const hashedPassword = await bcrypt.hash("123456", 10);
        await prisma.user.create({
            data: {
                name: "Admin User",
                email: "admin@example.com",
                password: hashedPassword,
                role: "ADMIN"
            }
        });

        console.log("✅ SEEDING COMPLETE!");
        console.log("Admin: admin@example.com");
        console.log("Pass:  123456");

    } catch (e) {
        console.error("Error seeding:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
