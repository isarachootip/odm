
// @ts-nocheck
import { POST } from '../src/app/api/cart/add/route.ts';
import { prisma } from '../src/lib/db.ts';

async function main() {
    console.log("Testing /api/cart/add logic...");

    // 1. Find a test user and product
    const product = await prisma.product.findFirst({
        where: { name: { contains: 'กระเพรา' } }
    });

    if (!product) {
        console.error("Test product not found");
        return;
    }

    const testUserId = "test-user-verification";

    // 2. Mock Request
    const req = new Request("http://localhost:3000/api/cart/add", {
        method: "POST",
        body: JSON.stringify({
            userId: testUserId,
            productId: product.id,
            quantity: 2,
            orderType: "BOX",
            note: "ไม่ใส่พริก",
            selections: {
                "spiciness": "mild",
                "toppings": ["fried_egg", "extra"]
            }
        })
    });

    // 3. Call Handler
    const res = await POST(req);
    const data = await res.json();

    console.log("Response Status:", res.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (res.status === 200 && data.success) {
        console.log("✅ API Success");

        // 4. Verify DB
        const session = await prisma.cartSession.findUnique({
            where: { lineUserId: testUserId }
        });

        const lastItem = (session?.items as any[]).pop();
        console.log("Last Item in Cart:", JSON.stringify(lastItem, null, 2));

        if (lastItem.selectedOptions["Type"] === "ใส่กล่อง" && lastItem.quantity === 2) {
            console.log("✅ Data verification passed");
        } else {
            console.log("❌ Data verification failed");
        }

    } else {
        console.log("❌ API Failed");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
