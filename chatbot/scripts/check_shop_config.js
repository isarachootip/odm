const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    console.log("\n=== ShopConfig ===");
    const cfg = await p.shopConfig.findFirst();
    console.log(JSON.stringify(cfg, null, 2));

    console.log("\n=== Branches ===");
    const branches = await p.branch.findMany({
        select: { code: true, lineChannelAccessToken: true, lineChannelSecret: true }
    });
    branches.forEach(b => {
        console.log(`Branch: ${b.code}`);
        console.log(`  Token: ${b.lineChannelAccessToken ? b.lineChannelAccessToken.substring(0, 20) + '...' : 'NULL'}`);
        console.log(`  Secret: ${b.lineChannelSecret ? '***set***' : 'NULL'}`);
    });
}

main().catch(e => console.error(e.message)).finally(() => p.$disconnect());
