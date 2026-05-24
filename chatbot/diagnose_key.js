const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

const key = process.env.GEMINI_API_KEY;
console.log("Loaded Key:", key ? key.substring(0, 8) + "..." : "undefined");

async function run() {
    if (!key) {
        console.error("No API Key found!");
        return;
    }
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        console.log("Attempting generation...");
        const result = await model.generateContent("Hi");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("Full Error:", e);
    }
}
run();
