// Seed Demo Orders with Phase 3 Data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const customerNames = [
    'สมชาย ใจดี', 'นิดา สวยงาม', 'John Smith', 'ภูมิ รักเรียน',
    'แอน มั่นใจ', 'ปิยะ ขยัน', 'สุดา เก่งกาจ', 'ทอม วิลเลียมส์',
    'นก น้อย', 'ปอนด์ โต', 'แบงค์ รวย', 'มิ้นต์ หอม',
    'เจมส์ ใหญ่', 'ปาล์ม สูง', 'บอล กลม', 'ออม เงิน'
];

const phoneNumbers = [
    '081-234-5678', '092-345-6789', '063-456-7890', '084-567-8901',
    '095-678-9012', '062-789-0123', '083-890-1234', '094-901-2345',
    '061-012-3456', '082-123-4567', '093-234-5678', '064-345-6789',
    '085-456-7890', '096-567-8901', '065-678-9012', '086-789-0123'
];

const deliveryLocations = [
    'ห้องประชุม3 ตึกA', 'แผนกบัญชี ชั้น 2', 'ห้อง IT ชั้น 5',
    'โต๊ะ 204 ตึกหน้า', 'ห้องประชุมใหญ่ ชั้น 1', 'แผนก HR ชั้น 3',
    'ห้องผู้จัดการ ตึก B', 'Pantry ชั้น 4', 'ห้องรับแขก ชั้น 1',
    'โต๊ะพักพนักงาน ชั้น 2', 'ห้องประชุมเล็ก ชั้น 3', 'แผนกขาย ชั้น 2'
];

const statuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

function randomDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    date.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM - 8 PM
    date.setMinutes(Math.floor(Math.random() * 60));
    return date;
}

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

async function seedDemoOrders() {
    console.log('🌱 Seeding demo orders...');

    // Get products
    const products = await prisma.product.findMany();

    if (products.length === 0) {
        console.log('❌ No products found. Please seed products first.');
        return;
    }

    // Delete existing demo orders (optional, comment out to keep existing)
    // await prisma.order.deleteMany({});
    // console.log('🗑️  Cleared existing orders');

    const orders = [];

    for (let i = 0; i < 50; i++) {
        const isPickup = Math.random() > 0.4; // 60% delivery, 40% pickup
        const status = randomItem(statuses);
        const daysAgo = 7;
        const createdAt = randomDate(daysAgo);

        // Generate 1-3 items per order
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const orderItems = [];
        let total = 0;

        for (let j = 0; j < itemCount; j++) {
            const product = randomItem(products);
            const quantity = Math.floor(Math.random() * 2) + 1;
            const price = Number(product.price);

            orderItems.push({
                productId: product.id,
                quantity,
                price
            });

            total += price * quantity;
        }

        // Queue number: only for PAID and above
        let queueNumber = null;
        if (['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'].includes(status)) {
            // Simulate daily queue (1-50)
            queueNumber = Math.floor(Math.random() * 50) + 1;
        }

        const order = {
            customerName: randomItem(customerNames),
            customerPhone: randomItem(phoneNumbers),
            lineUserId: `U${Math.random().toString(36).substring(7)}`,
            deliveryType: isPickup ? 'PICKUP' : 'DELIVERY',
            deliveryLocation: isPickup ? null : randomItem(deliveryLocations),
            status,
            queueNumber,
            total,
            createdAt,
            items: {
                create: orderItems
            }
        };

        orders.push(order);
    }

    // Create all orders
    for (const order of orders) {
        await prisma.order.create({ data: order });
    }

    console.log(`✅ Created ${orders.length} demo orders`);

    // Show summary
    const summary = await prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
    });

    console.log('\n📊 Orders by status:');
    summary.forEach(s => {
        console.log(`   ${s.status}: ${s._count.status}`);
    });
}

seedDemoOrders()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
