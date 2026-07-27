import { PageHeader } from "@/components/shared/PageHeader";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { getSettings } from "@/lib/actions/settings";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (dbUser?.role !== "ADMIN") {
    redirect("/");
  }

  const { settings } = await getSettings();

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Settings" 
        description="Manage your workspace preferences and system configurations."
      />

      <SettingsForm initialData={settings} />
    </div>
  );
}
