import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const user = await prisma.user.findUnique({ where: { email: 'shahriar@gmail.com' } });
  if (!user) return NextResponse.json({ error: "No user" });
  
  try {
    const tempEmail = 'temp' + Date.now() + '@gmail.com';
    const result = await auth.api.signUpEmail({
      body: {
        name: 'Temp',
        email: tempEmail,
        password: 'password123',
      },
      asResponse: false
    });
    
    // get hash from temp user
    const tempAccount = await prisma.account.findFirst({
      where: { userId: result.user.id }
    });
    
    if (tempAccount && tempAccount.password) {
      await prisma.account.updateMany({
        where: { userId: user.id, providerId: 'credential' },
        data: { password: tempAccount.password }
      });
      
      // cleanup temp user
      await prisma.user.delete({ where: { id: result.user.id } });
      
      return NextResponse.json({ success: true, message: "Password updated successfully" });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
  
  return NextResponse.json({ error: "Failed" });
}
