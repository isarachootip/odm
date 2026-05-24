const line = require('@line/bot-sdk');

// User's confirmed token
const config = {
    channelAccessToken: "OjsWYmeoNT9lQTB9GdbcyUDpQC5fhcrTxKCpEJxbRWFa60+K210rzvoJJz+GJL09sRnDXo2M+1kp/NktxpQsxCvtXJMZBDy1b/GGwT1pybfbz/WIt0N8MnTzxSat61jKUqQJkbXTNYdfgUgh8xo2lwdB04t89/1O/w1cDnyilFU=",
    channelSecret: "3162832047074d1e13e7b2f555e9aee6"
};

const client = new line.messagingApi.MessagingApiClient(config);
const blobClient = new line.messagingApi.MessagingApiBlobClient(config);

async function run() {
    console.log("=== LINE Rich Menu FIXER ===");
    try {
        console.log("1. Checking for HIDDEN Global Default Menu...");
        let defaultMenuId = null;
        try {
            defaultMenuId = await client.getDefaultRichMenuId();
        } catch (e) {
            if (e.statusCode !== 404) console.log("Error checking default:", e.message);
        }

        if (defaultMenuId) {
            console.log(`⚠️ FOUND Hidden Default Menu: ${defaultMenuId} `);
            console.log("   This is why your menu is wrong!");
            console.log("   Removing it now...");

            await client.cancelDefaultRichMenu();
            console.log("✅ SUCCESS: Hidden Default Menu removed!");
            console.log("👉 Now your 'odm_new' menu from LINE Manager should appear.");
        } else {
            console.log("✅ No Hidden Default Menu found. (This is good)");
        }

    } catch (e) {
        console.error("\n❌ Fatal Error:", e.message);
    }
}

run();
