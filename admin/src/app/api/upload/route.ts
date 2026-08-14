import { NextResponse } from 'next/server';
import { uploadToMinIO } from '@/lib/minio';
import path from 'path';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const form = await request.formData();
        const file = form.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size exceeds 2MB limit' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Generate unique filename
        const ext = path.extname(file.name) || '.jpg';
        const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, '_');
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileName = `${baseName}_${randomSuffix}${ext}`;

        // Convert file arrayBuffer to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to MinIO
        const url = await uploadToMinIO(buffer, `products/${fileName}`, file.type);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
