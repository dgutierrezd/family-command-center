"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  ChefHat,
  ShoppingCart,
  ClipboardList,
  CheckSquare,
  Gift,
  Settings,
} from "lucide-react";
import { UserMenu } from "./user-menu";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/meals", label: "Meals", icon: ChefHat },
  { href: "/grocery-list", label: "Grocery List", icon: ShoppingCart },
  { href: "/lists", label: "Lists", icon: ClipboardList },
  { href: "/chores", label: "Chores", icon: CheckSquare },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-card">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <h1 className="text-lg font-extrabold text-primary truncate">
            Family Command Center
          </h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <UserMenu />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex md:hidden h-14 items-center justify-between border-b border-border bg-card px-4">
          <h1 className="text-base font-extrabold text-primary truncate">
            Family Command Center
          </h1>
          <UserMenu />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile bottom tabs */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card border-t border-border z-50 pb-[env(safe-area-inset-bottom)]">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-colors min-w-0",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground/60 hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
