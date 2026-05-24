
const url = 'https://web-app-isarachootip-8987s-projects.vercel.app/api/line';

async function testLineWebhook() {
    console.log("Testing Remote LINE Webhook:", url);

    // Mock LINE Webhook Event
    const mockEvent = {
        destination: "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        events: [
            {
                type: "message",
                message: {
                    type: "text",
                    id: "12345678901234",
                    text: "สวัสดีครับ"
                },
                timestamp: Date.now(),
                source: {
                    type: "user",
                    userId: "U1234567890abcdef1234567890abcdef"
                },
                replyToken: "00000000000000000000000000000000", // Invalid token, expected to fail at LINE API but server should process valid 200 or try to reply
                mode: "active"
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockEvent),
        });

        console.log(`STATUS: ${response.status}`);
        const text = await response.text();
        console.log("RESPONSE:", text.substring(0, 500));

        if (response.status === 200) {
            console.log("✅ Webhook URL is reachable and responded 200 OK.");
        } else {
            console.log("❌ Webhook Failed.");
        }

    } catch (error) {
        console.error("Connectivity Error:", error);
    }
}

testLineWebhook();
