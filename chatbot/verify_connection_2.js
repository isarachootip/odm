const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function testModel(modelName) {
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        fs.appendFileSync('result.txt', `SUCCESS: ${modelName}\n`);
    } catch (error) {
        fs.appendFileSync('result.txt', `FAILED: ${modelName} - ${error.message.split(' ')[0]}\n`);
    }
}

async function run() {
    fs.writeFileSync('result.txt', 'Start\n');
    await testModel("gemini-2.0-flash-exp");
    await testModel("gemini-1.5-flash");
    await testModel("gemini-pro");
}

run();
