const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany({where: {role: 'ADMIN'}}).then(users => console.log(users.map(u => u.email))).finally(() => p.$disconnect());
