
const fetch = require('node-fetch');

async function testLineWebhook() {
    const url = 'https://web-app-flame-xi.vercel.app/api/line';
    const payload = {
        destination: "Rb216666687...",
        events: [
            {
                type: "message",
                message: {
                    type: "text",
                    text: "เมนูแนะนำ"
                },
                timestamp: 1625562725350,
                source: {
                    type: "user",
                    userId: "U4af4980629..."
                },
                replyToken: "nHuyWiB7yP5..."
            }
        ]
    };

    try {
        console.log("Sending 'Menu' request to:", url);
        const start = Date.now();
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const end = Date.now();
        console.log(`Response Time: ${(end - start) / 1000}s`);
        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Body:", text);
    } catch (error) {
        console.error("Error:", error);
    }
}

testLineWebhook();
