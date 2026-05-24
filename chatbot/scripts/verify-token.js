
const https = require('https');
// Hardcoded from .env for verification
const token = "zr47Ln6cKDOSKw3+fAzk0yz6c+xOzJUuopdPthpWbHq6fKr/1IatHky7hvgW3Ym4KuggcR/ZBd3b9/cs/HXpfrdEEL3AVHvV4vItyxM/kxhK8xElk0DffuIss1j6wDtzKgCfGg95YDZk8cUFmUwTlAdB04t89/1O/w1cDnyilFU=";

if (!token) {
    console.error("❌ No token found in environment variables.");
    process.exit(1);
}

console.log(`Checking Token: ${token.substring(0, 20)}...`);

const options = {
    hostname: 'api.line.me',
    path: '/v2/bot/info',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
};

const req = https.request(options, (res) => {
    console.log(`Response Status: ${res.statusCode}`);

    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (res.statusCode === 200) {
                console.log("✅ Token is VALID!");
                console.log("Bot Name:", json.displayName);
                console.log("Bot ID:", json.userId);
            } else {
                console.error("❌ Token is INVALID.");
                console.error("Error:", JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error("Error parsing response:", e);
            console.log("Raw Body:", data);
        }
    });
});

req.on('error', (e) => {
    console.error("Request Error:", e);
});

req.end();
