const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const branches = await prisma.branch.findMany({
            select: { code: true, name: true, lineChannelAccessToken: true }
        });

        console.log("Branches configured:");
        branches.forEach(b => {
            console.log(`- ${b.code} (${b.name}): ${b.lineChannelAccessToken ? "Has Token" : "NO TOKEN"}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
