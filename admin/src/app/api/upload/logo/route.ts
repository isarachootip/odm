import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { uploadToMinIO } from '@/lib/minio';
import path from 'path';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const form = await request.formData();
        const file = form.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
        }

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
        const url = await uploadToMinIO(buffer, `logos/${fileName}`, file.type);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
