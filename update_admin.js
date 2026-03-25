const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  if (admins.length > 0) {
    for (const admin of admins) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { email: 'admin@tuit.uz' }
      });
      console.log(`Updated admin ${admin.name} email to admin@tuit.uz`);
    }
  } else {
    console.log("No ADMIN found in DB.");
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
