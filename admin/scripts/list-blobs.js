const { list } = require('@vercel/blob');
require('dotenv').config();

async function main() {
    try {
        console.log("🔍 Listing blobs from Vercel Blob storage...");
        const { blobs } = await list();

        console.log(`Found ${blobs.length} blobs:`);
        blobs.forEach(blob => {
            console.log(`- ${blob.pathname} (${blob.url})`);
        });

    } catch (error) {
        console.error("Error listing blobs:", error);
    }
}

main();
