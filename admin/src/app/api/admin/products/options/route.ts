import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { auth } from "@/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || !["ADMIN", "SUPERVISOR", "STAFF"].includes(session.user?.role || "")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const products = await db.product.findMany({
            select: {
                id: true,
                name: true,
                specifications: true,
                Category: { select: { name: true } }
            },
            orderBy: { name: 'asc' }
        });

        // Parse specifications and filter out those without valid options array
        const validProducts = products.map((p: any) => {
            let options = [];
            try {
                if (p.specifications) {
                    const specs = typeof p.specifications === 'string' 
                        ? JSON.parse(p.specifications) 
                        : p.specifications;
                    options = (specs as any)?.options || [];
                }
            } catch (e) {
                // Ignore parsing errors
            }
            return {
                id: p.id,
                name: p.name,
                categoryName: p.Category?.name || 'Uncategorized',
                options: options
            };
        }).filter(p => p.options.length > 0);

        return NextResponse.json(validProducts);
    } catch (error) {
        console.error("[GET_PRODUCTS_FOR_OPTIONS]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
