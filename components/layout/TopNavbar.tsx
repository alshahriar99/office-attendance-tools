"use client";

import { Bell, Search, Menu, Check } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "@/lib/auth-client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { mockNotifications } from "@/lib/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function TopNavbar({ companyName }: { companyName?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentSection = pathSegments.length > 0 
    ? pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1)
    : "Dashboard";

  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger className="md:hidden block text-muted-foreground outline-none">
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar isMobile companyName={companyName} />
          </SheetContent>
        </Sheet>
        
        <div className="hidden md:flex flex-col">
          <span className="text-sm text-muted-foreground font-medium">Pages / {currentSection}</span>
          <h1 className="text-lg font-bold tracking-tight">{currentSection}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative hidden sm:block w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-full bg-muted/50 pl-9 border-none focus-visible:ring-1"
          />
        </div>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted outline-none transition-colors">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal flex items-center justify-between">
                <span className="font-semibold">Notifications</span>
                <span className="text-xs text-primary cursor-pointer hover:underline">Mark all as read</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[300px]">
              {mockNotifications.map((notif) => (
                <div key={notif.id} className={cn("p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer", !notif.read && "bg-primary/5")}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium">{notif.title}</span>
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </ScrollArea>
            <DropdownMenuSeparator />
            <div className="p-2 text-center">
              <Link href="/notifications" className="text-xs font-medium text-primary hover:underline">
                View all notifications
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none rounded-full ml-1">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name || "Guest User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email || "guest@example.com"}
                  </p>
                  <p className="text-[10px] font-semibold tracking-wider text-primary uppercase mt-1">
                    {(session?.user as any)?.role || "ADMIN"}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href="/profile" className="w-full">
                <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
              </Link>
              <Link href="/settings" className="w-full">
                <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={async () => {
                await signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      window.location.href = "/login";
                    }
                  }
                });
              }} 
              className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
            >
              Log out
            </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
