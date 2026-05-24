
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Clearing old menu...");
    await prisma.product.deleteMany({});
    console.log("✅ All products deleted.");

    // Image URL placeholders (using unsplash/placeholders for now as I can't upload the actual image files yet, 
    // but the system is ready for user to update them later using the new upload feature)
    const hotImage = "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&auto=format&fit=crop&q=60";
    const coldImage = "https://images.unsplash.com/photo-1517701604599-bb29b5c7dd90?w=800&auto=format&fit=crop&q=60";
    const sodaImage = "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=60";

    const categories = {
        hot: await prisma.category.upsert({ where: { slug: 'coffee-hot' }, update: {}, create: { name: 'Hot Coffee', slug: 'coffee-hot' } }),
        cold: await prisma.category.upsert({ where: { slug: 'coffee-cold' }, update: {}, create: { name: 'Iced Coffee', slug: 'coffee-cold' } }),
        tea: await prisma.category.upsert({ where: { slug: 'tea' }, update: {}, create: { name: 'Tea & Milk', slug: 'tea' } }),
        soda: await prisma.category.upsert({ where: { slug: 'soda' }, update: {}, create: { name: 'Soda', slug: 'soda' } }),
    };

    const joyMenu = [
        // HOT (ร้อน) 25.-
        { name: "Americano (อเมริกาโน่ ร้อน)", price: 25, cat: categories.hot.id, img: hotImage },
        { name: "Espresso (เอสเพรสโซ่ ร้อน)", price: 25, cat: categories.hot.id, img: hotImage },
        { name: "Latte (ลาเต้ ร้อน)", price: 25, cat: categories.hot.id, img: hotImage },
        { name: "Cappuccino (คาปูชิโน่ ร้อน)", price: 25, cat: categories.hot.id, img: hotImage },
        { name: "Mocha (มอคค่า ร้อน)", price: 25, cat: categories.hot.id, img: hotImage },
        { name: "Thai Milk Tea (ชาไทยนม ร้อน)", price: 25, cat: categories.hot.id, img: hotImage },
        { name: "Black Tea (ชาดำ ร้อน)", price: 25, cat: categories.hot.id, img: hotImage },
        { name: "Cocoa (โกโก้ ร้อน)", price: 25, cat: categories.hot.id, img: hotImage },

        // COLD (เย็น) 30.- (Basic)
        { name: "Americano (อเมริกาโน่ เย็น)", price: 30, cat: categories.cold.id, img: coldImage },
        { name: "Espresso (เอสเพรสโซ เย็น)", price: 30, cat: categories.cold.id, img: coldImage },
        { name: "Cappuccino (คาปูชิโน่ เย็น)", price: 30, cat: categories.cold.id, img: coldImage },
        { name: "Latte (ลาเต้ เย็น)", price: 30, cat: categories.cold.id, img: coldImage },
        { name: "Mocha (มอคค่า เย็น)", price: 30, cat: categories.cold.id, img: coldImage },

        // Premium Cold 45.-
        { name: "Honey Americano (อเมริกาโน่น้ำผึ้ง)", price: 45, cat: categories.cold.id, img: coldImage },
        { name: "Coconut Americano (อเมริกาโน่มะพร้าว)", price: 45, cat: categories.cold.id, img: coldImage },
        { name: "Americano Yuzu (อเมริกาโน่ส้มยูสุ)", price: 45, cat: categories.cold.id, img: coldImage },
        { name: "Pure Matcha (เพียวมัทฉะ)", price: 45, cat: categories.tea.id, img: coldImage },
        { name: "Matcha Latte (มัทฉะลาเต้)", price: 45, cat: categories.tea.id, img: coldImage },
        { name: "Coconut Matcha (มัทฉะมะพร้าว)", price: 45, cat: categories.tea.id, img: coldImage },
        { name: "Yuzu Matcha (มัทฉะส้มยูสุ)", price: 45, cat: categories.tea.id, img: coldImage },
        { name: "Honey Lemon Matcha (มัทฉะน้ำผึ้งมะนาว)", price: 45, cat: categories.tea.id, img: coldImage },

        // Refreshing 30.-
        { name: "Lemon Tea (ชามะนาว)", price: 30, cat: categories.tea.id, img: coldImage },
        { name: "Red Soda (แดงโซดา)", price: 30, cat: categories.soda.id, img: sodaImage },
        { name: "Red Lemon Soda (แดงโซดามะนาว)", price: 30, cat: categories.soda.id, img: sodaImage },
        { name: "Yuzu Soda (ส้มยูสุโซดา)", price: 30, cat: categories.soda.id, img: sodaImage },
        { name: "Pink Milk (ชาดำเย็น/นมชมพู)", price: 30, cat: categories.tea.id, img: coldImage }, // Grouping pink milk/black tea ice
        { name: "Thai Milk Tea Ice (ชาไทยนมเย็น)", price: 30, cat: categories.tea.id, img: coldImage },
        { name: "Cocoa Ice (โกโก้ เย็น)", price: 30, cat: categories.tea.id, img: coldImage },
        { name: "Pink Milk (นมชมพู)", price: 30, cat: categories.tea.id, img: coldImage },
    ];

    console.log(`☕ Seeding ${joyMenu.length} items from Joy Menu...`);

    for (const item of joyMenu) {
        console.log(`Creating: ${item.name}...`);
        await prisma.product.create({
            data: {
                name: item.name,
                price: item.price,
                description: "Joy Cafe Signature Menu",
                categoryId: item.cat,
                images: [item.img]
            }
        });
    }

    console.log("✅ JOY MENU IMPORTED SUCCESSFULLY!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
