
const url = 'https://web-app-isarachootip-8987s-projects.vercel.app/api/chat';

console.log("Testing Remote API:", url);

async function test() {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "สวัสดีครับ",
                history: []
            })
        });

        console.log(`STATUS: ${response.status}`);
        const text = await response.text();
        console.log("BODY:", text.substring(0, 500));

        if (response.status === 200) {
            console.log("✅ API is working!");
        } else {
            console.log("❌ API Failed.");
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

test();
