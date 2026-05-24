// using native fetch


async function testLineWebhook() {
    const url = 'http://localhost:3000/api/line';

    // Mock LINE Webhook Event
    const mockEvent = {
        destination: "Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        events: [
            {
                type: "message",
                message: {
                    type: "text",
                    id: "12345678901234",
                    text: "แนะนำเมนูหน่อย" // "Recommend a menu" in Thai
                },
                timestamp: 1625481234567,
                source: {
                    type: "user",
                    userId: "U1234567890abcdef1234567890abcdef"
                },
                replyToken: "00000000000000000000000000000000", // Invalid token, expected to fail at LINE API
                mode: "active"
            }
        ]
    };

    console.log("Sending mock request to:", url);
    console.log("Payload:", JSON.stringify(mockEvent, null, 2));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mockEvent),
        });

        const status = response.status;
        const data = await response.json().catch(() => ({}));

        console.log(`\nResponse Status: ${status}`);
        console.log("Response Body:", data);

        if (status === 200) {
            console.log("\n✅ Success! (Note: Real LINE API might not have been called if logic mocked it, or it returns 200 even on error?)");
        } else if (status === 500) {
            if (data.error && (data.error.includes("Invalid reply token") || data.error.includes("400"))) {
                console.log("\n✅ Logic verified! The server attempted to reply to LINE (failed as expected due to invalid token). Gemini integration is working.");
            } else {
                console.log("\n❌ Server Error. Please check server logs.");
            }
        } else {
            console.log("\n⚠️ Unexpected Status.");
        }

    } catch (error) {
        console.error("Connectivity Error:", error.message);
        console.log("Make sure the Next.js server is running on port 3000.");
    }
}

testLineWebhook();
