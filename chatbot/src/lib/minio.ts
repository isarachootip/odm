import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import https from 'https';

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

export async function uploadToMinIO(
    buffer: Buffer, 
    fileName: string, 
    contentType: string
): Promise<string | null> {
    const accessKey = process.env.MINIO_ACCESS_KEY;
    const secretKey = process.env.MINIO_SECRET_KEY;
    const endpoint = process.env.MINIO_ENDPOINT;

    if (!accessKey || accessKey === 'YOUR_MINIO_ACCESS_KEY' || !secretKey || secretKey === 'YOUR_MINIO_SECRET_KEY' || !endpoint) {
        console.warn("MinIO credentials not configured. Skipping slip upload to MinIO.");
        return null;
    }

    try {
        const bucket = process.env.MINIO_BUCKET || 'odm-uploads';
        
        await s3Client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: fileName,
            Body: buffer,
            ContentType: contentType,
        }));

        const publicUrlBase = process.env.MINIO_PUBLIC_URL || `${endpoint}/${bucket}`;
        const cleanBase = publicUrlBase.endsWith('/') ? publicUrlBase.slice(0, -1) : publicUrlBase;
        
        return `${cleanBase}/${fileName}`;
    } catch (err) {
        console.error("MinIO upload failed, continuing slip verification:", err);
        return null;
    }
}
