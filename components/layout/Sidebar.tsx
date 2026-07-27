"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  CalendarOff,
  BarChart3,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Leaves", href: "/leaves", icon: CalendarOff },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ isMobile = false, companyName = "Acme Corp" }: { isMobile?: boolean, companyName?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "flex flex-col border-r bg-card px-4 py-6",
      isMobile ? "h-full w-full border-r-0" : "h-screen w-64 hidden md:flex"
    )}>
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Building2 size={20} />
        </div>
        <span className="text-lg font-bold tracking-tight">{companyName}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button
          onClick={async () => {
            await signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = "/login";
                }
              }
            });
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
