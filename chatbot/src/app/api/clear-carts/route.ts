import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const secret = url.searchParams.get('secret');
        if (secret !== 'clear-carts-123') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const deleted = await prisma.cartSession.deleteMany();
        
        return NextResponse.json({ 
            success: true, 
            message: `Successfully deleted ${deleted.count} old cart sessions.` 
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
