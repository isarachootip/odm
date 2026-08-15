import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import { put } from "@vercel/blob";

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
    
    // Upload to Vercel Blob
    const blob = await put(fileKey, buffer, {
        access: 'public',
        contentType: 'image/png',
    });
    
    return blob.url;
}
