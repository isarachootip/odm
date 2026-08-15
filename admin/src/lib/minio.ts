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
): Promise<string> {
    const bucket = process.env.MINIO_BUCKET || 'odm-uploads';
    
    await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
    }));

    const publicUrlBase = process.env.MINIO_PUBLIC_URL || `${process.env.MINIO_ENDPOINT}/${bucket}`;
    const cleanBase = publicUrlBase.endsWith('/') ? publicUrlBase.slice(0, -1) : publicUrlBase;
    
    return `${cleanBase}/${fileName}`;
}
