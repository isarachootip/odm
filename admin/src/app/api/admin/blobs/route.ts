import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import https from 'https';

export const dynamic = 'force-dynamic';

const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});

const s3Client = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT,
    region: process.env.MINIO_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || '',
        secretAccessKey: process.env.MINIO_SECRET_KEY || '',
    },
    forcePathStyle: true,
    requestHandler: new NodeHttpHandler({
        httpsAgent,
    }),
});

interface LocalBlob {
    url: string;
    pathname: string;
    uploadedAt: Date;
}

export async function GET() {
    try {
        const bucket = process.env.MINIO_BUCKET || 'odm-uploads';
        const publicUrlBase = process.env.MINIO_PUBLIC_URL || `${process.env.MINIO_ENDPOINT}/${bucket}`;
        const cleanBase = publicUrlBase.endsWith('/') ? publicUrlBase.slice(0, -1) : publicUrlBase;

        const data = await s3Client.send(new ListObjectsV2Command({
            Bucket: bucket,
        }));

        const blobs: LocalBlob[] = (data.Contents || []).map((item) => ({
            url: `${cleanBase}/${item.Key}`,
            pathname: item.Key || '',
            uploadedAt: item.LastModified || new Date(),
        }));

        // Sort by uploadedAt descending (newest first)
        blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

        return NextResponse.json({
            success: true,
            count: blobs.length,
            blobs
        });
    } catch (error: any) {
        console.error('List objects error:', error);
        return NextResponse.json({ error: 'Failed to list blobs', details: error.message }, { status: 500 });
    }
}
