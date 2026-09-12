"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/weight", label: "체중", icon: "⚖️" },
  { href: "/running", label: "러닝", icon: "🏃" },
  { href: "/running-settings", label: "러닝 종류", icon: "🏷️" },
  { href: "/diet", label: "식단", icon: "🍽️" },
  { href: "/food-settings", label: "음식 설정", icon: "🥗" },
  { href: "/settings", label: "설정", icon: "⚙️" },
];

const mobileNavItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/weight", label: "체중", icon: "⚖️" },
  { href: "/running", label: "러닝", icon: "🏃" },
  { href: "/diet", label: "식단", icon: "🍽️" },
  { href: "/settings", label: "설정", icon: "⚙️" },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/settings") {
    return (
      pathname === "/settings" ||
      pathname.startsWith("/running-settings") ||
      pathname.startsWith("/food-settings")
    );
  }
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-56 flex-col bg-slate-900 text-slate-300 lg:flex">
      <div className="border-b border-slate-700 px-5 py-6">
        <h1 className="text-lg font-bold text-white">Self Care</h1>
        <p className="text-xs text-slate-400">개인 건강 관리</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {sidebarNavItems.map((item) => {
          const isActive = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex min-h-14 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {mobileNavItems.map((item) => {
        const isActive = isNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-1 text-[10px] font-medium leading-tight",
              isActive ? "text-blue-600" : "text-slate-500",
            )}
          >
            <span className="shrink-0 text-lg leading-none">{item.icon}</span>
            <span className="w-full truncate text-center">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
