import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface LocalBlob {
    url: string;
    pathname: string;
    uploadedAt: Date;
}

export async function GET() {
    try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const blobs: LocalBlob[] = [];

        // Helper function to scan directory recursively
        const scanDir = (dirPath: string, relativePathPrefix = '') => {
            if (!fs.existsSync(dirPath)) return;
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                const relPath = relativePathPrefix ? `${relativePathPrefix}/${entry.name}` : entry.name;

                if (entry.isDirectory()) {
                    scanDir(fullPath, relPath);
                } else if (entry.isFile()) {
                    const stats = fs.statSync(fullPath);
                    blobs.push({
                        url: `/uploads/${relPath}`,
                        pathname: relPath,
                        uploadedAt: stats.mtime
                    });
                }
            }
        };

        scanDir(uploadDir);

        // Sort by uploadedAt descending (newest first)
        blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

        return NextResponse.json({
            success: true,
            count: blobs.length,
            blobs
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to list blobs', details: error.message }, { status: 500 });
    }
}
