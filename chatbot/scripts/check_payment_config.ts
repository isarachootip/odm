
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking PaymentConfig...');

    const config = await prisma.paymentConfig.findFirst({
        where: { isDefault: true }
    });

    if (config) {
        console.log('Found existing default config:', config);
        if (config.paymentType !== 'PROMPTPAY' || config.promptpayNumber !== '0932896292') {
            console.log('Updating config to match requirements...');
            await prisma.paymentConfig.update({
                where: { id: config.id },
                data: {
                    paymentType: 'PROMPTPAY',
                    promptpayNumber: '0932896292',
                    accountName: 'ODM Vidwa', // Default name
                    bankName: 'PromptPay',
                    accountNumber: '0932896292'
                }
            });
            console.log('Updated.');
        } else {
            console.log('Config matches requirements.');
        }
    } else {
        console.log('No default config found. Creating new one...');
        await prisma.paymentConfig.create({
            data: {
                paymentType: 'PROMPTPAY',
                promptpayNumber: '0932896292',
                accountName: 'ODM Vidwa',
                bankName: 'PromptPay',
                accountNumber: '0932896292',
                isDefault: true
            }
        });
        console.log('Created.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
