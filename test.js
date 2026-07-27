const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.account.findFirst({ where: { userId: { not: null } } })
  .then(acc => {
    console.log("HASH:", acc.password.substring(0, 20));
  })
  .finally(() => prisma.$disconnect());
