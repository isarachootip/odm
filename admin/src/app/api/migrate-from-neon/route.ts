import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    let neonPrisma: PrismaClient | null = null;
    try {
        console.log("Starting migration from Neon to local DB...");

        // 1. Initialize source Neon Prisma client
        neonPrisma = new PrismaClient({
            datasources: {
                db: {
                    url: "postgresql://neondb_owner:npg_yZnoLR05TqQW@ep-weathered-cake-a142l6vv.ap-southeast-1.aws.neon.tech/odm_vidwa_db?sslmode=require"
                }
            }
        });

        // 2. Fetch all data from Neon (Source)
        console.log("Fetching data from Neon...");
        const branches = await neonPrisma.branch.findMany();
        const categories = await neonPrisma.category.findMany();
        const products = await neonPrisma.product.findMany({
            include: { variants: true }
        });
        const shopConfigs = await neonPrisma.$queryRawUnsafe<any[]>(`SELECT * FROM "ShopConfig"`);
        const users = await neonPrisma.user.findMany();

        console.log(`Fetched from Neon: 
            - ${branches.length} branches
            - ${categories.length} categories
            - ${products.length} products
            - ${shopConfigs.length} shop configs
            - ${users.length} users
        `);

        // 3. Clear target tables in correct dependency order
        console.log("Clearing target tables in local DB...");
        
        // Delete dependent order/cart tables first
        await prisma.orderItem.deleteMany();
        await prisma.cartItem.deleteMany();
        await prisma.cart.deleteMany();
        await prisma.wishlistItem.deleteMany();
        await prisma.wishlist.deleteMany();
        await prisma.review.deleteMany();
        await prisma.order.deleteMany();
        await prisma.paymentLog.deleteMany();
        
        // Delete core entity tables
        await prisma.productVariant.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.shopConfig.deleteMany();
        await prisma.user.deleteMany();
        await prisma.branch.deleteMany();

        // 4. Insert data into target local DB
        console.log("Inserting data into local DB...");

        // Insert Branches
        for (const b of branches) {
            await prisma.branch.create({
                data: {
                    id: b.id,
                    name: b.name,
                    code: b.code,
                    lineChannelId: b.lineChannelId,
                    lineChannelSecret: b.lineChannelSecret,
                    lineChannelAccessToken: b.lineChannelAccessToken,
                    createdAt: b.createdAt,
                    updatedAt: b.updatedAt
                }
            });
        }
        console.log("Branches inserted successfully.");

        // Insert Users
        for (const u of users) {
            await prisma.user.create({
                data: {
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    emailVerified: u.emailVerified,
                    image: u.image,
                    password: u.password,
                    role: u.role,
                    branchId: u.branchId,
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt
                }
            });
        }
        console.log("Users inserted successfully.");

        // Insert ShopConfigs
        for (const sc of shopConfigs) {
            await prisma.shopConfig.create({
                data: {
                    id: sc.id,
                    branchId: sc.branchId || null,
                    isBusyMode: sc.isBusyMode ?? false,
                    busyMessage: sc.busyMessage || null,
                    isScheduleEnabled: sc.isScheduleEnabled ?? false,
                    openTime: sc.openTime || null,
                    closeTime: sc.closeTime || null,
                    logoUrl: sc.logoUrl || null,
                    createdAt: sc.createdAt ? new Date(sc.createdAt) : new Date(),
                    updatedAt: sc.updatedAt ? new Date(sc.updatedAt) : new Date()
                }
            });
        }
        console.log("ShopConfigs inserted successfully.");

        // Insert Categories
        // Categories can have hierarchical relations, but we insert them flat first without parentId, then update parentId
        for (const c of categories) {
            await prisma.category.create({
                data: {
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    image: c.image
                }
            });
        }
        // Update parentId for hierarchy
        for (const c of categories) {
            if (c.parentId) {
                await prisma.category.update({
                    where: { id: c.id },
                    data: { parentId: c.parentId }
                });
            }
        }
        console.log("Categories inserted successfully.");

        // Insert Products and Variants
        for (const p of products) {
            await prisma.product.create({
                data: {
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    costPrice: p.costPrice,
                    price: p.price,
                    promotionPrice: p.promotionPrice,
                    promotionStart: p.promotionStart,
                    promotionEnd: p.promotionEnd,
                    inventory: p.inventory,
                    images: p.images,
                    specifications: p.specifications || undefined,
                    categoryId: p.categoryId,
                    isActive: p.isActive,
                    availableDays: p.availableDays,
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                    variants: {
                        create: p.variants.map(v => ({
                            id: v.id,
                            name: v.name,
                            price: v.price,
                            stock: v.stock
                        }))
                    }
                }
            });
        }
        console.log("Products and Variants inserted successfully.");

        console.log("Migration complete!");
        return NextResponse.json({
            success: true,
            message: "Migration completed successfully!",
            summary: {
                branches: branches.length,
                categories: categories.length,
                products: products.length,
                shopConfigs: shopConfigs.length,
                users: users.length
            }
        });

    } catch (error: any) {
        console.error("Migration failed:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Unknown error during migration",
            stack: error.stack
        }, { status: 500 });
    } finally {
        if (neonPrisma) {
            await neonPrisma.$disconnect();
        }
    }
}
