import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

export async function generatePromptPayQR(phoneNumber: string, amount: number): Promise<Buffer> {
    const payload = generatePayload(phoneNumber, { amount });
    const buffer = await QRCode.toBuffer(payload, {
        type: "png",
        margin: 1,
        width: 400
    });
    return buffer;
}
