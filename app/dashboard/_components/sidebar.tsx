"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Scissors,
  LayoutDashboard,
  Link as LinkIcon,
  QrCode,
  Key,
  Settings,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Links", href: "/dashboard/links", icon: LinkIcon },
  { label: "QR Codes", href: "/dashboard/qr-codes", icon: QrCode },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const COLLAPSED_KEY = "sidebar_collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  // Persist collapsed state in localStorage
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(COLLAPSED_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  };

  // Display name: prefer full name, fall back to first name, then email prefix
  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "My Account";

  // Prevent flash before localStorage is read
  if (!mounted) {
    return (
      <aside className="hidden md:flex w-[240px] flex-col bg-surface border-r border-border shrink-0" />
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-surface border-r border-border shrink-0 transition-all duration-300 ease-in-out relative ${
          collapsed ? "w-[64px]" : "w-[240px]"
        }`}
      >
        {/* Logo */}
        <div className={`py-8 flex items-center ${collapsed ? "justify-center px-0" : "px-6"}`}>
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Scissors className="w-5 h-5 text-primary shrink-0" strokeWidth={2.5} />
            {!collapsed && (
              <span className="font-sans font-semibold text-text-primary text-xl tracking-tight truncate">
                Snip
              </span>
            )}
          </Link>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[72px] z-10 w-6 h-6 bg-surface border border-border rounded-full flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-colors shadow-sm"
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Nav */}
        <nav className={`flex-1 flex flex-col gap-1 ${collapsed ? "px-2" : "px-4"}`}>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 py-2.5 rounded-btn transition-colors ${
                  collapsed ? "justify-center px-2" : "px-3"
                } ${
                  isActive
                    ? collapsed
                      ? "bg-[#FDF3E7] text-primary"
                      : "bg-[#FDF3E7] text-primary border-l-2 border-primary rounded-r-[8px] rounded-l-none"
                    : collapsed
                    ? "text-text-secondary hover:bg-background hover:text-text-primary"
                    : "text-text-secondary hover:bg-background hover:text-text-primary border-l-2 border-transparent rounded-r-[8px] rounded-l-none"
                }`}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && (
                  <span className="font-medium text-sm truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User */}
        <div className={`mt-auto border-t border-border ${collapsed ? "p-2" : "p-3"}`}>
          {collapsed ? (
            /* Collapsed: just the avatar centered */
            <div className="flex justify-center py-1.5">
              <UserButton
                appearance={{
                  elements: { userButtonAvatarBox: "w-8 h-8" },
                }}
              />
            </div>
          ) : (
            /* Expanded: avatar + name side by side, properly separated */
            <div
              className={`flex items-center gap-2.5 px-2 py-2 rounded-btn transition-colors ${
                pathname === "/dashboard/account"
                  ? "bg-[#FDF3E7]"
                  : "hover:bg-background"
              }`}
            >
              {/* Avatar — opens Clerk dropdown on click */}
              <div className="shrink-0">
                <UserButton
                  appearance={{
                    elements: { userButtonAvatarBox: "w-8 h-8" },
                  }}
                />
              </div>
              {/* Name — navigates to account page */}
              <Link
                href="/dashboard/account"
                className="flex-1 min-w-0"
              >
                <span
                  className={`block text-sm font-medium truncate ${
                    pathname === "/dashboard/account"
                      ? "text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {displayName}
                </span>
              </Link>
            </div>
          )}
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
        <Link
          href="/dashboard/account"
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-btn transition-colors ${
            pathname === "/dashboard/account"
              ? "text-primary"
              : "text-text-tertiary hover:text-text-primary"
          }`}
        >
          <UserCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Account</span>
        </Link>
      </div>
    </>
  );
}
