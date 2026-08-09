import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
    try {
        // Construct the absolute path to the file
        const filePath = path.join(process.cwd(), 'public', 'uploads', ...params.path);
        
        // Read the file buffer
        const buffer = await fs.readFile(filePath);
        
        // Determine the content type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.svg') contentType = 'image/svg+xml';
        
        // Return the file with cache headers
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        return new NextResponse('File not found', { status: 404 });
    }
}
