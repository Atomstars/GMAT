"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Target, Zap, Clock, BookOpen, TrendingUp, Bot, ChevronRight, Play, Trophy } from "lucide-react";
import Link from "next/link";
import { useUserStore, useTimeStore } from "@/stores";
import { GMAT_CURRICULUM } from "@/lib/mock-data";
import { cn, formatDuration, getSectionShort, getStreakEmoji } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { user, stats } = useUserStore();
  const { todaySeconds, byActivity, totalAppSeconds } = useTimeStore();

  const firstName = user?.displayName?.split(" ")[0] || "Student";
  const todayMinutes = Math.floor(todaySeconds / 60);
  const totalHours = Math.floor(totalAppSeconds / 3600);

  const chartData = stats.scoreHistory.slice(-8).map((p) => ({
    date: p.date.slice(5),
    score: p.score,
  }));

  const sectionColors: Record<string, string> = {
    quantitative: "#8B5CF6",
    verbal: "#3B82F6",
    "data-insights": "#10B981",
  };

  if (!mounted) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-app">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto md:max-w-3xl">

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <p className="text-muted text-sm">Good {getGreeting()},</p>
          <h1 className="text-2xl font-bold text-app">{firstName} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: "rgba(var(--warning), 0.12)", color: "rgb(245 158 11)" }}
          >
            <Flame size={14} />
            {stats.currentStreak}d {getStreakEmoji(stats.currentStreak)}
          </div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">

        {/* Today's goal ring + quick stats */}
        <motion.div variants={cardVariants}>
          <div
            className="rounded-2xl p-5 border border-app"
            style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
          >
            <div className="flex items-center gap-4">
              {/* Goal ring */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgb(var(--bg-elevated))" strokeWidth="7" />
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke="rgb(var(--accent))"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - Math.min(todayMinutes / (user?.dailyGoalMinutes || 60), 1))}`}
                    transform="rotate(-90 40 40)"
                    style={{ transition: "stroke-dashoffset 0.6s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-app" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {todayMinutes}
                  </span>
                  <span className="text-[9px] text-muted">min</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="flex-1 grid grid-cols-2 gap-3">
                {[
                  { label: "Today's Goal", value: `${todayMinutes}/${user?.dailyGoalMinutes || 60}m`, icon: Target, color: "var(--accent)" },
                  { label: "Total Hours", value: `${totalHours}h`, icon: Clock, color: "var(--accent-cyan)" },
                  { label: "Accuracy", value: `${stats.accuracy.toFixed(0)}%`, icon: TrendingUp, color: "34 197 94" },
                  { label: "Questions", value: stats.totalQuestions.toString(), icon: BookOpen, color: "var(--accent)" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
                    <p className="text-base font-bold text-app">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Score trajectory */}
        <motion.div variants={cardVariants}>
          <div
            className="rounded-2xl p-5 border border-app"
            style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted font-medium uppercase tracking-wide">Score Trajectory</p>
                <p className="text-2xl font-bold text-app mt-0.5">
                  {stats.scoreHistory.at(-1)?.score ?? "—"}
                  <span className="text-sm font-normal text-muted ml-1">/ 805</span>
                </p>
              </div>
              <div
                className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                style={{ background: "rgba(34,197,94,0.12)", color: "rgb(34 197 94)" }}
              >
                <TrendingUp size={11} />
                +{(stats.scoreHistory.at(-1)?.score ?? 0) - (stats.scoreHistory[0]?.score ?? 0)} pts
              </div>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" hide />
                <Tooltip
                  contentStyle={{
                    background: "rgb(var(--bg-elevated))",
                    border: "1px solid rgb(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "rgb(var(--text-primary))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="rgb(var(--accent))"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: "rgb(var(--accent))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Section health */}
        <motion.div variants={cardVariants}>
          <div
            className="rounded-2xl p-5 border border-app"
            style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
          >
            <p className="text-xs text-muted font-medium uppercase tracking-wide mb-4">Section Health</p>
            <div className="space-y-3">
              {GMAT_CURRICULUM.map((section) => {
                const stat = stats.sectionStats[section.id];
                const color = sectionColors[section.id];
                return (
                  <div key={section.id} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted w-14">{section.short}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-elevated))" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.accuracy}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-app w-10 text-right">{stat.accuracy.toFixed(0)}%</span>
                    <span className="text-xs text-muted w-6 text-right">{stat.estimatedScore}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted mt-2 text-right">Accuracy % · Est. score (60–90)</p>
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={cardVariants}>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/practice" id="dashboard-practice-btn">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl p-4 flex flex-col gap-2 cursor-pointer"
                style={{ background: "linear-gradient(135deg, rgb(var(--accent)), rgb(108 99 255 / 0.8))" }}
              >
                <Play size={20} className="text-white" />
                <p className="text-white font-bold text-sm">Practice</p>
                <p className="text-white/70 text-xs">No time limit</p>
              </motion.div>
            </Link>
            <Link href="/practice?mode=timed" id="dashboard-timed-btn">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl p-4 flex flex-col gap-2 cursor-pointer border border-app"
                style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
              >
                <Clock size={20} style={{ color: "rgb(245 158 11)" }} />
                <p className="font-bold text-sm text-app">Timed Test</p>
                <p className="text-muted text-xs">45 min · GMAT-sim</p>
              </motion.div>
            </Link>
            <Link href="/progress" id="dashboard-progress-btn">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl p-4 flex flex-col gap-2 cursor-pointer border border-app"
                style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
              >
                <BarChart3 size={20} style={{ color: "rgb(16 185 129)" }} />
                <p className="font-bold text-sm text-app">Analytics</p>
                <p className="text-muted text-xs">Time & progress</p>
              </motion.div>
            </Link>
            <Link href="/ai-tutor" id="dashboard-ai-btn">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl p-4 flex flex-col gap-2 cursor-pointer border border-app"
                style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
              >
                <Bot size={20} style={{ color: "rgb(0 212 255)" }} />
                <p className="font-bold text-sm text-app">AI Tutor</p>
                <p className="text-muted text-xs">Ask anything</p>
              </motion.div>
            </Link>
          </div>
        </motion.div>

        {/* Time this week */}
        <motion.div variants={cardVariants}>
          <div
            className="rounded-2xl p-5 border border-app"
            style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted font-medium uppercase tracking-wide">Study Activity (14 days)</p>
              <Link href="/progress" className="text-xs font-medium" style={{ color: "rgb(var(--accent))" }}>
                See all →
              </Link>
            </div>
            <div className="flex items-end gap-1 h-16">
              {stats.weeklyProgress.map((day, i) => {
                const max = Math.max(...stats.weeklyProgress.map((d) => d.minutesStudied));
                const height = (day.minutesStudied / max) * 100;
                const isToday = i === stats.weeklyProgress.length - 1;
                return (
                  <motion.div
                    key={day.date}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.04, duration: 0.5, ease: "easeOut" }}
                    className="flex-1 rounded-sm"
                    style={{
                      background: isToday ? "rgb(var(--accent))" : "rgb(var(--bg-elevated))",
                      minHeight: "4px",
                    }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted">14d ago</span>
              <span className="text-[10px] text-muted">Today</span>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// Needed for quick actions grid icon
function BarChart3({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
