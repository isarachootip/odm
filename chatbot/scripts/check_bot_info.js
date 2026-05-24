
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

if (!token) {
    console.error("❌ Error: LINE_CHANNEL_ACCESS_TOKEN not found in .env.local");
    process.exit(1);
}

console.log("Checking LINE Bot Credentials...");
console.log("Token Prefix:", token.substring(0, 10) + "...");

const url = 'https://api.line.me/v2/bot/info';

async function checkBot() {
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const info = await response.json();

        if (response.status === 200) {
            console.log("\n✅ Credentials Valid!");
            console.log("------------------------");
            console.log(`🤖 Bot Name:   ${info.displayName}`);
            console.log(`🆔 Basic ID:   ${info.basicId}`);
            console.log(`👤 User ID:    ${info.userId}`);
            console.log("------------------------");
            console.log("Please compare this 'Bot Name' with the name of the LINE Account you are testing.");
        } else {
            console.log(`\n❌ Validation Failed (Status: ${response.status})`);
            console.log("Response:", JSON.stringify(info, null, 2));
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

checkBot();
