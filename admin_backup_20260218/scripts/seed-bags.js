const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const categories = [
        { name: 'กระเป๋าเดินทาง (Travel Bags)', slug: 'travel-bags', image: 'https://images.unsplash.com/photo-1565538004-9273cba5b6f4?auto=format&fit=crop&q=80&w=800' },
        { name: 'กระเป๋าโน้ตบุ๊ค (Laptop Bags)', slug: 'laptop-bags', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800' },
        { name: 'กระเป๋าสตางค์ (Wallets)', slug: 'wallets', image: 'https://images.unsplash.com/photo-1627123424574-181ce5171af3?auto=format&fit=crop&q=80&w=800' },
        { name: 'กระเป๋าแฟชั่น (General Bags)', slug: 'fashion-bags', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800' },
    ];

    console.log("Creating Bag categories...");

    for (const cat of categories) {
        const existing = await prisma.category.findUnique({
            where: { slug: cat.slug }
        });

        if (!existing) {
            await prisma.category.create({
                data: cat
            });
            console.log(`✅ Created: ${cat.name}`);
        } else {
            console.log(`ℹ️ Already exists: ${cat.name}`);
        }
    }

    console.log("Done! You can verify at /categories");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
