const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Migrating users...");
  await prisma.user.updateMany({ where: { role: 'DEAN' }, data: { role: 'DEKAN' } });
  await prisma.user.updateMany({ where: { role: 'HOD' }, data: { role: 'MUDIR' } });
  await prisma.user.updateMany({ where: { role: 'TEACHER' }, data: { role: 'OQITUVCHI' } });

  console.log("Migrating custom roles...");
  await prisma.customRole.updateMany({ where: { name: 'DEAN' }, data: { name: 'DEKAN' } });
  await prisma.customRole.updateMany({ where: { name: 'HOD' }, data: { name: 'MUDIR' } });
  await prisma.customRole.updateMany({ where: { name: 'TEACHER' }, data: { name: 'OQITUVCHI' } });

  console.log("Migration complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
