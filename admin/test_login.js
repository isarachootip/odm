const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@joycafe.com';
    const pwd = 'password123';
    
    const hashedPassword = await bcrypt.hash(pwd, 10);
    const user = await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });
    
    console.log("Updated password for", user.email, "role:", user.role);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
