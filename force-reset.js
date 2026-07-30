const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.log("ব্যবহারবিধি: node force-reset.js <আপনার-ইমেইল> <নতুন-পাসওয়ার্ড>");
    console.log("উদাহরণ: node force-reset.js admin@example.com 12345678");
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log("❌ এই ইমেইলের কোনো ইউজার পাওয়া যায়নি!");
    return;
  }

  const hash = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.account.updateMany({
    where: { userId: user.id, providerId: 'credential' },
    data: { password: hash }
  });

  if (updated.count > 0) {
    console.log(`✅ ${email} এর পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!`);
    console.log(`এখন নতুন পাসওয়ার্ড "${newPassword}" দিয়ে লগইন করুন।`);
  } else {
    console.log("❌ একাউন্ট আপডেট করা যায়নি। (সম্ভবত এটি ক্রেডেনশিয়াল একাউন্ট নয়)");
  }
}

resetPassword().finally(() => prisma.$disconnect());
