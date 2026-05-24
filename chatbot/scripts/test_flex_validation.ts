import { PrismaClient } from '@prisma/client';
import { createCategoryBubble, createOrderFoodBubble, createCarousel } from '../src/lib/flex-templates';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Fetching categories...");
        const categories = await prisma.category.findMany({
            include: { _count: { select: { Product: true } } },
            orderBy: { name: 'asc' }
        });

        const bubbles = categories.map((c) => {
            return createCategoryBubble({
                name: c.name,
                image: c.image,
                count: c._count.Product
            });
        });

        bubbles.unshift(createOrderFoodBubble('odm'));

        const carousel = createCarousel(bubbles);

        const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "test";

        console.log("Validating payload with LINE API...");
        const res = await fetch('https://api.line.me/v2/bot/message/validate/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                messages: [carousel]
            })
        });

        const text = await res.text();
        console.log(`LINE API Validation Response: ${res.status} ${text}`);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
