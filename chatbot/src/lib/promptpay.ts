import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

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
    const uploadDir = path.join(process.cwd(), "public", "uploads", "qr-codes");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${orderId}.png`;
    const filePath = path.join(uploadDir, fileName);
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/qr-codes/${fileName}`;
    return fileUrl;
}
