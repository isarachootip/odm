const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function test(modelName) {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        await model.generateContent("Hello");
        console.log(`[PASS] ${modelName}`);
    } catch (e) {
        console.log(`[FAIL] ${modelName}: ${e.message.split(']')[0]}]`);
    }
}

async function run() {
    console.log("Checking models with key: " + API_KEY.substring(0, 5) + "...");
    await test("gemini-1.5-flash");
    await test("gemini-1.5-pro");
    await test("gemini-2.0-flash-exp");
    await test("gemini-2.0-flash");
    await test("gemini-pro");
}

run();
