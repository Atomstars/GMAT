"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, BookOpen, BarChart3, Bot, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/practice", label: "Practice", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/ai-tutor", label: "AI Tutor", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      id="bottom-nav"
      className="absolute bottom-0 left-0 right-0 z-50 glass border-t border-app pb-safe"
      style={{ borderColor: "rgb(var(--border))" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              id={`bottom-nav-${label.toLowerCase()}`}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 no-select relative"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 rounded-xl mx-1"
                  style={{ background: "rgba(var(--accent), 0.12)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={20}
                className={cn(
                  "relative z-10 transition-colors duration-200",
                  isActive ? "text-accent" : "text-muted"
                )}
                style={isActive ? { color: "rgb(var(--accent))" } : {}}
              />
              <span
                className={cn(
                  "text-[10px] font-medium relative z-10 transition-colors duration-200",
                  isActive ? "text-accent" : "text-muted"
                )}
                style={isActive ? { color: "rgb(var(--accent))" } : {}}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      id="sidebar-nav"
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 border-r border-app z-40"
      style={{
        background: "rgb(var(--bg-surface))",
        borderColor: "rgb(var(--border))",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-app" style={{ borderColor: "rgb(var(--border))" }}>
        <div
          className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center text-white font-bold text-sm"
        >
          G
        </div>
        <div>
          <p className="font-bold text-sm text-app">GMAT Focus</p>
          <p className="text-xs text-muted">Premium Prep</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.slice(0, 4).map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              id={`sidebar-${label.toLowerCase()}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 relative group",
                isActive ? "text-accent" : "text-muted hover:text-app"
              )}
              style={isActive ? { color: "rgb(var(--accent))" } : {}}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "rgba(var(--accent), 0.12)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon size={18} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom settings */}
      <div className="px-3 py-4 border-t border-app" style={{ borderColor: "rgb(var(--border))" }}>
        <Link
          href="/settings"
          id="sidebar-settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200",
            pathname === "/settings" ? "text-accent" : "text-muted hover:text-app"
          )}
          style={pathname === "/settings" ? { color: "rgb(var(--accent))" } : {}}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
