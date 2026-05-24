
const LINE_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || process.env.LINE_ACCESS_TOKEN || "";

export async function downloadLineContent(messageId: string): Promise<Buffer> {
    const url = `https://api-data.line.me/v2/bot/message/${messageId}/content`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${LINE_ACCESS_TOKEN}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to download content: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}
