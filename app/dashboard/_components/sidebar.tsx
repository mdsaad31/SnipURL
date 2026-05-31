"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Scissors, LayoutDashboard, Link as LinkIcon } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Links", href: "/dashboard/links", icon: LinkIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[240px] flex-col bg-surface border-r border-border shrink-0">
        {/* Logo */}
        <div className="px-6 py-8">
          <Link href="/" className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" strokeWidth={2.5} />
            <span className="font-sans font-semibold text-text-primary text-xl tracking-tight">
              Snip
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-r-[8px] transition-colors ${
                  isActive
                    ? "bg-[#FDF3E7] text-primary border-l-2 border-primary"
                    : "text-text-secondary hover:bg-background hover:text-text-primary border-l-2 border-transparent"
                }`}
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User */}
        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 border-t border-border pt-4">
            <UserButton
              appearance={{
                elements: { userButtonAvatarBox: "w-8 h-8" },
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary truncate max-w-[130px]">
                My Account
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border px-2 py-1 flex items-center justify-around safe-bottom">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-btn transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-text-tertiary hover:text-text-primary"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <div className="flex flex-col items-center gap-0.5 px-3 py-2">
          <UserButton
            appearance={{
              elements: { userButtonAvatarBox: "w-5 h-5" },
            }}
          />
          <span className="text-[10px] font-medium text-text-tertiary">
            Account
          </span>
        </div>
      </div>
    </>
  );
}
