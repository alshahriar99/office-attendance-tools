const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.account.findFirst({where: {providerId: 'credential'}}).then(console.log).finally(() => p.$disconnect());
