
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config({ path: '.env' }); // Load from .env

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
    try {
        console.log("1. Fetching Products from DB...");
        const dbProducts = await prisma.product.findMany({
            include: { Category: true }
        });
        console.log(`✅ Got ${dbProducts.length} products.`);

        const menuContent = dbProducts.map((p) =>
            `- ${p.name} (${Number(p.price)} THB) [${p.Category?.name || 'General'}]`
        ).join("\n");

        console.log("2. Preparing AI Prompt...");
        const userMessage = "สวัสดี";
        const systemPrompt = `
คุณคือ "น้อง Enjoy" (Nong Enjoy) ผู้ช่วยคนเก่งของร้านคาเฟ่ "Joy Cafe"
[JOY_CAFE_MENU (Real Database)]:
${menuContent}

คำถามจากลูกค้า: ${userMessage}
ตอบกลับเป็น JSON: { "text": "...", "flex": ... }
`;

        console.log("3. Calling Gemini API...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });
        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();
        console.log("✅ AI Response:", responseText);

    } catch (error) {
        console.error("❌ ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
