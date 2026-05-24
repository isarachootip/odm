
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🍰 Adding Bakery and Food categories...");

    // 1. Create Bakery Category
    const bakery = await prisma.category.upsert({
        where: { slug: 'bakery' },
        update: {},
        create: {
            name: 'Bakery (เบเกอรี่)',
            slug: 'bakery'
        }
    });
    console.log(`✅ Category Created: ${bakery.name}`);

    // 2. Create Food Category
    const food = await prisma.category.upsert({
        where: { slug: 'food' },
        update: {},
        create: {
            name: 'Food (อาหาร)',
            slug: 'food'
        }
    });
    console.log(`✅ Category Created: ${food.name}`);

    // 3. Rename existing English categories to Thai (as discussed/implied by "จัดอย่างไร")
    // Updating existing categories to be bilingual/clearer
    await prisma.category.update({ where: { slug: 'coffee-hot' }, data: { name: 'Hot Menu (เมนูร้อน)' } });
    await prisma.category.update({ where: { slug: 'coffee-cold' }, data: { name: 'Iced Menu (เมนูเย็น)' } });
    await prisma.category.update({ where: { slug: 'tea' }, data: { name: 'Premium/Milk (พรีเมียม/นม)' } });
    await prisma.category.update({ where: { slug: 'soda' }, data: { name: 'Soda (โซดา)' } });

    console.log("✅ Updated original categories to Thai names.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
