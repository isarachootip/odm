import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import menuData from "@/data/menu.json";

// Configuration
const API_KEY = process.env.GEMINI_API_KEY || "";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Build menu string from JSON
function getMenuString(): string {
    let menu = "";
    for (const category of menuData.categories) {
        menu += `\n${category.name}:\n`;
        for (const item of category.items) {
            menu += `- ${item.name} (${item.nameTh}) - ${item.price} บาท\n`;
        }
    }
    return menu;
}

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        const menuContent = getMenuString();

        const systemPrompt = `
คุณคือ "น้อง Enjoy" (Nong Enjoy) ผู้ช่วยคนเก่งของร้านคาเฟ่ "Odm Vidwa"
บุคลิก: ร่าเริง สดใส เป็นกันเอง น่ารัก (ใช้ "นะคะ/คะ/ค่ะ") และชอบแนะนำเมนูอร่อยๆ

[เมนู Odm Vidwa]:
${menuContent}

[ข้อมูลร้าน]:
- ชื่อร้าน: ${menuData.shopInfo.name}
- เปิดทำการ: ${menuData.shopInfo.hours}

[กฎการตอบ]:
1. ตอบเป็นข้อความสั้นๆ กระชับ ไม่เกิน 2-3 ประโยค
2. ถ้าลูกค้าถามเมนู ให้แนะนำ 3-5 รายการพร้อมราคา
3. ใช้ emoji ให้ดูน่ารัก ☕🧁✨
4. ถ้าลูกค้าสั่งของ ให้ยืนยันรายการและราคา
5. ตอบเป็น JSON format: { "text": "...", "suggestions": ["...", "..."] }

ประวัติการสนทนา:
${history?.map((h: any) => `${h.role}: ${h.content}`).join("\n") || "(ยังไม่มี)"}

ลูกค้าพูดว่า: "${message}"
`;

        const result = await model.generateContent(systemPrompt);
        let responseText = result.response.text();

        // Try to parse as JSON, fallback to plain text
        try {
            const jsonResponse = JSON.parse(responseText);
            return NextResponse.json(jsonResponse);
        } catch {
            return NextResponse.json({ text: responseText, suggestions: [] });
        }
    } catch (error: any) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
