
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Verifying Product Options...');

    // 1. Create a dummy category if needed
    let category = await prisma.category.findFirst({ where: { slug: 'test-category' } });
    if (!category) {
        category = await prisma.category.create({
            data: {
                name: 'Test Category',
                slug: 'test-category'
            }
        });
        console.log('Created Test Category:', category.id);
    }

    // 2. Define Options
    const options = [
        {
            id: "opt-size",
            label: "Size",
            type: "select",
            required: true,
            choices: [
                { value: "size-normal", label: "Normal", price: 0 },
                { value: "size-special", label: "Special", price: 10 }
            ]
        },
        {
            id: "opt-topping",
            label: "Topping",
            type: "multiselect",
            required: false,
            choices: [
                { value: "top-egg", label: "Fried Egg", price: 10 }
            ]
        }
    ];

    // 3. Create Product with Options
    const product = await prisma.product.create({
        data: {
            name: 'Test Noodle',
            description: 'Test Noodle with Options',
            price: 50,
            categoryId: category.id,
            specifications: { options }
        }
    });

    console.log('Created Product:', product.id);

    // 4. Verify Options
    const savedProduct = await prisma.product.findUnique({
        where: { id: product.id }
    });

    if (!savedProduct) {
        console.error('Failed to fetch saved product');
        return;
    }

    const savedOptions = (savedProduct.specifications as any)?.options;
    console.log('Saved Options:', JSON.stringify(savedOptions, null, 2));

    if (savedOptions && savedOptions.length === 2 && savedOptions[0].label === "Size") {
        console.log('✅ Options verified successfully!');
    } else {
        console.error('❌ Options verification failed!');
    }

    // Cleanup
    await prisma.product.delete({ where: { id: product.id } });
    console.log('Cleanup: Deleted test product');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
