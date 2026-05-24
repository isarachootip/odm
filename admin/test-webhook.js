// Test script to verify LINE webhook is working
const LINE_WEBHOOK_URL = "https://odm-vidwa-chatbot.vercel.app/api/line";

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
        console.log("Payload:", JSON.stringify(testEvent, null, 2));

        const response = await fetch(LINE_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(testEvent)
        });

        console.log("\nResponse Status:", response.status);
        console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

        const text = await response.text();
        console.log("Response Body:", text);

        if (response.ok) {
            console.log("\n✅ Webhook is responding!");
        } else {
            console.log("\n❌ Webhook returned error:", response.status);
        }
    } catch (error) {
        console.error("\n❌ Error testing webhook:", error);
    }
}

testWebhook();
