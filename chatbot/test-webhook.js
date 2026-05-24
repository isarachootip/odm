const LINE_WEBHOOK_URL = "https://odm-vidwa-chatbot.vercel.app/api/line/odm";

const testEvent = {
    events: [{
        type: "message",
        replyToken: "test-token-12345",
        source: {
            userId: "U1234567890abcdef1234567890abcdef"
        },
        message: {
            type: "text",
            id: "1234567890", // Dummy message ID
            text: "สวัสดี"
        }
    }]
};

async function testWebhook() {
    try {
        console.log("Testing LINE webhook...");
        console.log("URL:", LINE_WEBHOOK_URL);

        const response = await fetch(LINE_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(testEvent)
        });

        console.log("\nResponse Status:", response.status);
        const text = await response.text();
        console.log("Response Body:", text);

    } catch (error) {
        console.error("\n❌ Error:", error);
    }
}

testWebhook();
