import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export type SlipAnalysisResult = {
    amount: number;
    date: string;
    time: string;
    bank?: string;
    sender?: string;
    receiver?: string;
    refNumber?: string;
    confidence: "high" | "medium" | "low";
    isSlip: boolean;
};

export async function analyzePaymentSlip(imageBuffer: Buffer): Promise<SlipAnalysisResult> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
    Analyze this image. Is it a bank payment slip / transfer receipt?
    If yes, extract the following information:
    1. Amount (Thai Baht, numbers only)
    2. Date (YYYY-MM-DD format)
    3. Time (HH:MM format)
    4. Bank Name (e.g. KBank, SCB, BBL)
    5. Sender Name (if available)
    6. Receiver Name (if available)
    7. Reference Number / Transaction ID
    
    Return ONLY a raw JSON object (no markdown code block) with this structure:
    {
      "isSlip": boolean,
      "amount": number,
      "date": "YYYY-MM-DD",
      "time": "HH:MM",
      "bank": "string",
      "sender": "string",
      "receiver": "string",
      "refNumber": "string",
      "confidence": "high" | "medium" | "low"
    }
    
    If it's NOT a payment slip, set "isSlip" to false.
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean markdown if present
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return {
            isSlip: false,
            amount: 0,
            date: "",
            time: "",
            confidence: "low"
        };
    }
}
