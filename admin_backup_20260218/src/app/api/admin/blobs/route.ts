import { list } from '@vercel/blob';
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // List all blobs
        const { blobs } = await list();

        // Return as JSON
        return Response.json({
            success: true,
            count: blobs.length,
            blobs
        });
    } catch (error) {
        return Response.json({ error: 'Failed to list blobs', details: error.message }, { status: 500 });
    }
}
