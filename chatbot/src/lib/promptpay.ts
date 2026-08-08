import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import { uploadToMinIO } from "./minio";

export async function generatePromptPayQR(phoneNumber: string, amount: number): Promise<Buffer> {
    const payload = generatePayload(phoneNumber, { amount });
    const buffer = await QRCode.toBuffer(payload, {
        type: "png",
        margin: 1,
        width: 400
    });
    return buffer;
}

export async function uploadQRToBlob(buffer: Buffer, orderId: string): Promise<string> {
    const fileName = `${orderId}.png`;
    const fileKey = `qr-codes/${fileName}`;
    
    // Upload to MinIO bucket
    const fileUrl = await uploadToMinIO(buffer, fileKey, "image/png");
    return fileUrl;
}
