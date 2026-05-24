const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const vidwaToken = 'OjsWYmeoNT9lQTB9GdbcyUDpQC5fhcrTxKCpEJxbRWFa60+K210rzvoJJz+GJL09sRnDXo2M+1kp/NktxpQsxCvtXJMZBDy1b/GGwT1pybfbz/WIt0N8MnTzxSat61jKUqQJkbXTNYdfgUgh8xo2lwdB04t89/1O/w1cDnyilFU=';
    const bkmToken = 'oFrsk/jXP5Cxzll6mvaAFjhORWShDYj1R1W4FYK6n34P+sDYRSvWqZhIViszxxu6QUAeAgLK1BgX8eo2xCuQMI1krRJD9mnuMZE5enV8TR5bpYlqprwJmpN8zYiCFJsk7gN7/esTJdzMTLuEZEQ4BQdB04t89/1O/w1cDnyilFU=';

    // User provided only one secret, assuming it's the main one, we might apply it to both or just vidwa if they are the same
    const sharedSecret = '3162832047074d1e13e7b2f555e9aee6';

    console.log('Updating Branches...');

    // Update or Create VIDWA
    let vidwa = await prisma.branch.findFirst({ where: { code: 'VIDWA' } });
    if (!vidwa) {
        console.log('VIDWA not found, creating...');
        await prisma.branch.create({
            data: {
                name: 'ODM Vidwa',
                code: 'VIDWA',
                lineChannelAccessToken: vidwaToken,
                lineChannelSecret: sharedSecret,
            }
        });
    } else {
        await prisma.branch.update({
            where: { id: vidwa.id },
            data: {
                lineChannelAccessToken: vidwaToken,
                lineChannelSecret: sharedSecret,
            }
        });
        console.log('Updated VIDWA');
    }

    // Update or Create BKM
    let bkm = await prisma.branch.findFirst({ where: { code: 'BKM' } });
    if (!bkm) {
        console.log('BKM not found, creating...');
        await prisma.branch.create({
            data: {
                name: 'ODM BKM',
                code: 'BKM',
                lineChannelAccessToken: bkmToken,
                lineChannelSecret: sharedSecret, // Using same for now as user only provided one
            }
        });
    } else {
        await prisma.branch.update({
            where: { id: bkm.id },
            data: {
                lineChannelAccessToken: bkmToken,
                lineChannelSecret: sharedSecret,
            }
        });
        console.log('Updated BKM');
    }

    console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
