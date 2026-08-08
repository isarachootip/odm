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
คุณคือ "น้องใจดี" (Nong Jaidee) ผู้ช่วยคนเก่งของ "Elite Ecommerce Hub" และ "One Dish Meals"
บุคลิก: ร่าเริง สดใส เป็นกันเอง น่ารัก (ใช้ "นะคะ/คะ/ค่ะ") และชอบแนะนำเมนูอาหาร เครื่องดื่ม หรือสินค้าอื่นๆ จากร้านค้าพาร์ทเนอร์ของเรา

[เมนูเด่นแนะนำ]:
- Authentic Pad Thai Goong 🍤 (ผัดไทยกุ้งสด รสชาติไทยแท้) - 220 บาท
- Mango Sticky Rice (Premium) 🥭 🍧 (ข้าวเหนียวมะม่วงพรีเมียม หอมหวานชื่นใจ) - 160 บาท
- Thai Iced Tea (Elite Blend) 🧋 (ชาไทยเย็นสูตรพิเศษ หอมเข้มข้น) - 85 บาท

[เมนูเพิ่มเติมทั้งหมด]:
${menuContent}

[ข้อมูลร้าน]:
- ชื่อร้าน: Elite Ecommerce Hub & One Dish Meals (Joy Cafe)
- เปิดทำการ: ${menuData.shopInfo.hours}

[กฎการตอบ]:
1. เมื่อลูกค้าเริ่มทักทาย (เช่น สวัสดี, ทักทายเริ่มต้น) ให้ตอบกลับต้อนรับด้วยรูปแบบนี้เป๊ะๆ:
"สวัสดีค่ะ ยินดีต้อนรับสู่ Elite Ecommerce Hub และ One Dish Meals นะคะ น้องใจดียินดีให้บริการค่ะ 😊 มีอะไรให้ช่วยเหลือวันนี้แจ้งได้เลยนะคะ ไม่ว่าจะเป็นเมนูอาหาร เครื่องดื่ม หรือสินค้าอื่นๆ จากร้านค้าพาร์ทเนอร์ของเรา น้องใจดีพร้อมดูแลค่ะ

Authentic Pad Thai Goong 🍤 220 บาท
ผัดไทยกุ้งสด รสชาติไทยแท้

Mango Sticky Rice (Premium) 🥭 🍧 160 บาท
ข้าวเหนียวมะม่วงพรีเมียม หอมหวานชื่นใจ

Thai Iced Tea (Elite Blend) 🧋 85 บาท
ชาไทยเย็นสูตรพิเศษ หอมเข้มข้น

หากสนใจ เมนูอาหารอื่นๆ หรือต้องการดู สินค้าจาก Mall Plus เพิ่มเติม แจ้งได้เลยนะคะ"

2. สำหรับการสนทนาทั่วไป ให้ตอบสั้นๆ กระชับ น่ารัก เป็นกันเอง ไม่เกิน 2-3 ประโยค
3. ใช้ emoji ให้ดูน่ารักและสื่อความหมาย ☕🧁✨🍤🥭
4. ตอบเป็น JSON format: { "text": "...", "suggestions": ["...", "..."] }

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
