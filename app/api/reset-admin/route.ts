import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    // 1. Find the admin user
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) return NextResponse.json({ error: "Admin not found" });

    // 2. Change their email to admin@gmail.com
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { email: 'admin@gmail.com' }
    });

    // 3. Generate a hash for 'admin123' by creating a temp user
    const tempEmail = 'temp' + Date.now() + '@example.com';
    const result = await auth.api.signUpEmail({
      body: {
        name: 'Temp',
        email: tempEmail,
        password: 'admin123',
      },
      asResponse: false
    });
    
    // 4. Get the hash
    const tempAccount = await prisma.account.findFirst({
      where: { userId: result.user.id }
    });
    
    if (tempAccount && tempAccount.password) {
      // 5. Update the admin's account with the new hash
      await prisma.account.updateMany({
        where: { userId: adminUser.id, providerId: 'credential' },
        data: { password: tempAccount.password }
      });
      
      // 6. Cleanup temp user
      await prisma.user.delete({ where: { id: result.user.id } });
      
      return NextResponse.json({ success: true, message: "Admin credentials reset" });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
  
  return NextResponse.json({ error: "Failed" });
}
