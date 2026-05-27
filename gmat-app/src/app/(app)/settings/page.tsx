"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Bell, Target, Calendar, LogOut, ChevronRight } from "lucide-react";
import { useUserStore } from "@/stores";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { theme, setTheme, user } = useUserStore();

  const sections = [
    {
      title: "Study Preferences",
      items: [
        { icon: Target, label: "Target Score", value: `${user?.targetScore || 705}`, href: "#" },
        { icon: Calendar, label: "Test Date", value: user?.testDate || "Not set", href: "#" },
        { icon: Bell, label: "Daily Reminders", value: "9:00 AM", href: "#" },
      ],
    },
    {
      title: "Appearance",
      items: [],
    },
  ];

  if (!mounted) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-app">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-6 max-w-lg mx-auto">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-app mb-6">
        Settings
      </motion.h1>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 border border-app mb-4 flex items-center gap-4"
        style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
      >
        <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center text-white text-xl font-bold">
          {(user?.displayName?.[0] || "S").toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-app">{user?.displayName || "Student"}</p>
          <p className="text-sm text-muted">{user?.email || "student@example.com"}</p>
          <p className="text-xs mt-1" style={{ color: "rgb(var(--accent))" }}>GMAT Focus Premium</p>
        </div>
      </motion.div>

      {/* Theme toggle */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 border border-app mb-4"
        style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
      >
        <p className="text-xs text-muted font-medium uppercase tracking-wide mb-3">Appearance</p>
        <div className="flex rounded-xl p-1" style={{ background: "rgb(var(--bg-elevated))" }}>
          {([["dark", "Dark", Moon], ["light", "Light", Sun]] as const).map(([val, label, Icon]) => (
            <button
              key={val}
              id={`theme-${val}`}
              onClick={() => setTheme(val)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={theme === val ? { background: "rgb(var(--accent))", color: "white" } : { color: "rgb(var(--text-muted))" }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Settings list */}
      {sections.filter((s) => s.items.length > 0).map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + si * 0.07 }}
          className="rounded-2xl border border-app mb-4 overflow-hidden"
          style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
        >
          <p className="text-xs text-muted font-medium uppercase tracking-wide px-5 py-3 border-b border-app" style={{ borderColor: "rgb(var(--border))" }}>
            {section.title}
          </p>
          {section.items.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 px-5 py-4 ${i < section.items.length - 1 ? "border-b border-app" : ""}`}
              style={i < section.items.length - 1 ? { borderColor: "rgb(var(--border))" } : {}}
            >
              <Icon size={16} className="text-muted" />
              <span className="flex-1 text-sm text-app">{label}</span>
              <span className="text-sm text-muted">{value}</span>
              <ChevronRight size={14} className="text-muted" />
            </div>
          ))}
        </motion.div>
      ))}

      {/* Sign out */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        id="sign-out-btn"
        onClick={() => (window.location.href = "/")}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold border border-app transition-all hover:opacity-80"
        style={{ borderColor: "rgb(var(--error))", color: "rgb(var(--error))", background: "rgba(239,68,68,0.05)" }}
      >
        <LogOut size={16} />
        Sign Out
      </motion.button>
    </div>
  );
}
