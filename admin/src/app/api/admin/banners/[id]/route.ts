import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const banner = await prisma.banner.findUnique({
            where: { id: params.id },
        });
        if (!banner) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(banner);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.json();
        
        const banner = await prisma.banner.update({
            where: { id: params.id },
            data: {
                imageUrl: data.imageUrl,
                subtitle: data.subtitle,
                title: data.title,
                description: data.description,
                buttonText: data.buttonText,
                buttonLink: data.buttonLink,
                isActive: data.isActive,
                sortOrder: data.sortOrder ? parseInt(data.sortOrder) : 0,
            }
        });

        return NextResponse.json(banner);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.banner.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
