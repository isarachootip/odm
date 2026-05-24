
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Finding product...');

    // Find "Krapow Moo Krob" or similar
    let product = await prisma.product.findFirst({
        where: {
            name: { contains: 'กระเพรา' }
        }
    });

    if (!product) {
        console.log('Product not found, creating one...');
        product = await prisma.product.create({
            data: {
                name: 'ข้าวกระเพราหมูกรอบ (Test Options)',
                price: 60,
                categoryId: 'test-cat', // Needs valid category ID, might fail if constraint
                description: 'Testing options',
                images: ['https://placehold.co/600x400'],
            }
        });
    } else {
        console.log(`Found product: ${product.name} (${product.id})`);
    }

    // Define Specifications
    const specs = {
        options: [
            {
                id: "spiciness",
                label: "ระดับความเผ็ด",
                type: "single",
                required: true,
                choices: [
                    { label: "เผ็ดน้อย", value: "mild" },
                    { label: "เผ็ดปกติ", value: "medium" },
                    { label: "เผ็ดมาก", value: "spicy" }
                ]
            },
            {
                id: "toppings",
                label: "ท็อปปิ้ง",
                type: "multiple",
                required: false,
                choices: [
                    { label: "ไข่ดาว", value: "fried_egg", price: 10 },
                    { label: "ไข่เจียว", value: "omelet", price: 15 },
                    { label: "พิเศษ", value: "extra", price: 10 }
                ]
            }
        ]
    };

    console.log('Updating product specifications...');
    await prisma.product.update({
        where: { id: product.id },
        data: {
            specifications: JSON.stringify(specs)
        }
    });

    console.log('Update successful!');
    console.log('Product ID:', product.id);
    console.log('Specifications:', JSON.stringify(specs, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
