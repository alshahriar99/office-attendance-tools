import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileImageUpload } from "@/components/profile/ProfileImageUpload";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { department: true }
  });

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Profile" 
        description="Manage your personal information and security preferences."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-border shadow-sm h-fit">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user?.name}</CardTitle>
            <CardDescription>{user?.role}</CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <div className="inline-flex items-center justify-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
              {user?.status || "ACTIVE"} Account
            </div>
            {user?.department && (
              <p className="text-sm text-muted-foreground mt-2">{user.department.name}</p>
            )}
            {user?.designation && (
              <p className="text-sm text-muted-foreground">{user.designation}</p>
            )}
          </CardContent>
          <div className="border-t border-border p-4">
            <ProfileImageUpload />
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <ProfileForm initialData={user} />
        </div>
      </div>
    </div>
  );
}
