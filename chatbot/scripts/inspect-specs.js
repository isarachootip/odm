const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Searching for Cappuccino specs...");

    const products = await prisma.product.findMany({
        where: { name: { contains: "Cappuccino", mode: 'insensitive' } },
        take: 1
    });

    if (products.length > 0) {
        const p = products[0];
        console.log(`Product: ${p.name} (ID: ${p.id})`);

        // Handle specifications as string or object
        let specs = p.specifications;
        if (typeof specs === 'string') {
            try {
                specs = JSON.parse(specs);
            } catch (e) {
                console.error("Failed to parse string specs:", e);
            }
        }

        console.log("Specifications:", JSON.stringify(specs, null, 2));

        // Check options specifically
        if (specs && specs.options) {
            specs.options.forEach(opt => {
                console.log(`Option Group: ${opt.label} (ID: ${opt.id})`);
                opt.choices.forEach(c => {
                    console.log(`  - Choice: ${c.label} (Value: ${c.value})`);
                });
            });
        }
    } else {
        console.log("Cappuccino not found");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
