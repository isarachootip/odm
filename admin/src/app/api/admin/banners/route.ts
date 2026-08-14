import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { sortOrder: "asc" },
        });
        return NextResponse.json(banners);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        
        const banner = await prisma.banner.create({
            data: {
                imageUrl: data.imageUrl,
                subtitle: data.subtitle,
                title: data.title,
                description: data.description,
                buttonText: data.buttonText,
                buttonLink: data.buttonLink,
                isActive: data.isActive ?? true,
                sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
            }
        });

        return NextResponse.json(banner, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
