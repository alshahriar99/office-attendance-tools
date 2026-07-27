const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function reset() {
  const users = await prisma.user.findMany();
  console.log("Users:", users.map(u => u.email));
  const user = users.find(u => u.email === 'shahriar@gmail.com');
  
  if (!user) {
      console.log("User not found!");
      return;
  }
  
  // Create dummy user using API endpoint approach isn't available from plain node script since we need Next.js context.
  // Wait, I can just use fetch against the live server if there's an API route. But I deleted the API route.
  // Let me just recreate the API route temporarily.
}
reset().finally(() => prisma.$disconnect());
