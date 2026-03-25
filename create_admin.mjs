import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  
  // Eski adminni qidiramiz
  const existing = await prisma.user.findUnique({ where: { email: 'admin@tuit.uz' } });
  
  if (existing) {
    console.log("Admin allaqachon mavjud!");
  } else {
    await prisma.user.create({
      data: {
        name: 'Bosh Administrator',
        email: 'admin@tuit.uz',
        password: hash,
        role: 'ADMIN'
      }
    });
    console.log("✅ Supabase bazasiga yangi admin kiritildi!");
    console.log("👉 Login: admin@tuit.uz");
    console.log("👉 Parol: admin123");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
