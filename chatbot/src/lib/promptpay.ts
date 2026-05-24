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
    const { url } = await put(`qr-codes/${orderId}.png`, buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
    });
    return url;
}
