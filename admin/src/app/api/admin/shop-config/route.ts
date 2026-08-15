import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        const updateData = {
            isBusyMode: data.isBusyMode ?? false,
            busyMessage: data.busyMessage ?? null,
            isScheduleEnabled: data.isScheduleEnabled ?? false,
            openTime: data.openTime ?? null,
            closeTime: data.closeTime ?? null,
            logoUrl: data.logoUrl ?? null,
        };

        const config = await prisma.shopConfig.findFirst();

        if (config) {
            await prisma.shopConfig.update({
                where: { id: config.id },
                data: updateData,
            });
        } else {
            await prisma.shopConfig.create({
                data: updateData,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('ShopConfig save error:', error);
        return NextResponse.json({ error: error.message || 'Failed to save' }, { status: 500 });
    }
}

export async function GET(): Promise<NextResponse> {
    try {
        const config = await prisma.shopConfig.findFirst();
        return NextResponse.json(config || {});
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
