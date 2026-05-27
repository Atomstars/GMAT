"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp, BookOpen, Zap, BarChart3, Activity } from "lucide-react";
import { useUserStore, useTimeStore } from "@/stores";
import { MOCK_TIME_ANALYTICS } from "@/lib/mock-data";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";

const ACTIVITY_COLORS: Record<string, string> = {
  practice: "#6C63FF",
  "timed-test": "#F59E0B",
  "mock-test": "#EF4444",
  "ai-tutor": "#00D4FF",
  review: "#10B981",
};

const ACTIVITY_LABELS: Record<string, string> = {
  practice: "Practice",
  "timed-test": "Timed Tests",
  "mock-test": "Mock Tests",
  "ai-tutor": "AI Tutor",
  review: "Review",
};

function fmtSeconds(s: number): string {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const cardV = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
} as const;

export default function ProgressPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { stats } = useUserStore();
  const timeStore = useTimeStore();

  // Use live store or fall back to mock for demo
  const analytics = {
    totalAppSeconds: timeStore.totalAppSeconds || MOCK_TIME_ANALYTICS.totalAppTimeSeconds,
    todaySeconds: timeStore.todaySeconds || MOCK_TIME_ANALYTICS.todayAppTimeSeconds,
    byActivity: Object.keys(timeStore.byActivity).some((k) => (timeStore.byActivity as Record<string, number>)[k] > 0)
      ? timeStore.byActivity
      : MOCK_TIME_ANALYTICS.byActivityType,
    dailySessions: timeStore.dailySessions.length > 0
      ? timeStore.dailySessions
      : MOCK_TIME_ANALYTICS.dailySessions,
    peakHours: timeStore.peakHours.some((h) => h > 0) ? timeStore.peakHours : MOCK_TIME_ANALYTICS.peakHours,
    avgSession: timeStore.sessionHistory.length > 0
      ? timeStore.sessionHistory.reduce((a, s) => a + s.durationSeconds, 0) / timeStore.sessionHistory.length
      : MOCK_TIME_ANALYTICS.avgSessionLengthSeconds,
  };

  // Daily bar chart data (last 14 days)
  const dailyChartData = analytics.dailySessions.slice(-14).map((d) => ({
    date: d.date.slice(5),
    Practice: Math.round((d.byActivity?.practice || 0) / 60),
    Timed: Math.round((d.byActivity?.["timed-test"] || 0) / 60),
    Mock: Math.round((d.byActivity?.["mock-test"] || 0) / 60),
    AI: Math.round((d.byActivity?.["ai-tutor"] || 0) / 60),
  }));

  // Pie data
  const pieData = Object.entries(analytics.byActivity)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: ACTIVITY_LABELS[key] || key,
      value: Math.round(value / 60),
      color: ACTIVITY_COLORS[key] || "#888",
    }));

  // Peak hours chart
  const peakData = analytics.peakHours.map((s, i) => ({
    hour: i === 0 ? "12a" : i < 12 ? `${i}a` : i === 12 ? "12p" : `${i - 12}p`,
    minutes: Math.round(s / 60),
  }));

  // Score chart
  const scoreData = stats.scoreHistory.map((p) => ({
    date: p.date.slice(5),
    Score: p.score,
  }));

  if (!mounted) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-app">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-6 max-w-2xl mx-auto md:max-w-3xl">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-app mb-6"
      >
        Progress & Analytics
      </motion.h1>

      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >

        {/* Time summary cards */}
        <motion.div variants={cardV} className="grid grid-cols-2 gap-3">
          {[
            { label: "Total App Time", value: fmtSeconds(analytics.totalAppSeconds), icon: Clock, color: "var(--accent)" },
            { label: "Today", value: fmtSeconds(analytics.todaySeconds), icon: Activity, color: "0 212 255" },
            { label: "Avg Session", value: fmtSeconds(Math.round(analytics.avgSession)), icon: Zap, color: "245 158 11" },
            { label: "Questions Done", value: stats.totalQuestions.toString(), icon: BookOpen, color: "34 197 94" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl p-4 border border-app"
              style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: `rgb(${color})` }} />
                <p className="text-xs text-muted">{label}</p>
              </div>
              <p className="text-xl font-bold text-app">{value}</p>
            </div>
          ))}
        </motion.div>

        {/* Time breakdown pie chart */}
        <motion.div
          variants={cardV}
          className="rounded-2xl p-5 border border-app"
          style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
        >
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-4">Time Breakdown by Activity</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                    <span className="text-xs text-muted">{entry.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-app">{entry.value}m</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Daily time stacked bar chart */}
        <motion.div
          variants={cardV}
          className="rounded-2xl p-5 border border-app"
          style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
        >
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-4">
            Daily Study Time (14 days) · minutes
          </p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={dailyChartData} barSize={8}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgb(var(--bg-elevated))",
                  border: "1px solid rgb(var(--border))",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "rgb(var(--text-primary))",
                }}
              />
              <Bar dataKey="Practice" stackId="a" fill={ACTIVITY_COLORS.practice} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Timed" stackId="a" fill={ACTIVITY_COLORS["timed-test"]} />
              <Bar dataKey="Mock" stackId="a" fill={ACTIVITY_COLORS["mock-test"]} />
              <Bar dataKey="AI" stackId="a" fill={ACTIVITY_COLORS["ai-tutor"]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-2">
            {[["Practice", "practice"], ["Timed", "timed-test"], ["Mock", "mock-test"], ["AI", "ai-tutor"]].map(([label, key]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm" style={{ background: ACTIVITY_COLORS[key] }} />
                <span className="text-[10px] text-muted">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Score trajectory */}
        <motion.div
          variants={cardV}
          className="rounded-2xl p-5 border border-app"
          style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-muted font-medium uppercase tracking-wide">Score Trajectory</p>
            <p className="text-lg font-bold text-app">{scoreData.at(-1)?.Score ?? "—"} <span className="text-muted text-sm font-normal">/ 805</span></p>
          </div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={scoreData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgb(var(--text-muted))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "rgb(var(--bg-elevated))",
                  border: "1px solid rgb(var(--border))",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "rgb(var(--text-primary))",
                }}
              />
              <Line type="monotone" dataKey="Score" stroke="rgb(var(--accent))" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Section accuracy */}
        <motion.div
          variants={cardV}
          className="rounded-2xl p-5 border border-app"
          style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
        >
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-4">Section Accuracy</p>
          {([
            ["quantitative", "Quantitative", "#8B5CF6"],
            ["verbal", "Verbal", "#3B82F6"],
            ["data-insights", "Data Insights", "#10B981"],
          ] as [string, string, string][]).map(([key, label, color]) => {
            const s = stats.sectionStats[key as keyof typeof stats.sectionStats];
            return (
              <div key={key} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium text-app">{label}</span>
                  <span className="text-sm font-semibold text-app">{s.accuracy.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-elevated))" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.accuracy}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted">{s.correctAnswers}/{s.totalQuestions} correct</span>
                  <span className="text-[10px] text-muted">~{s.averageTime}s/Q avg</span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Peak study hours */}
        <motion.div
          variants={cardV}
          className="rounded-2xl p-5 border border-app"
          style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
        >
          <p className="text-xs text-muted font-medium uppercase tracking-wide mb-4">Peak Study Hours</p>
          <div className="flex items-end gap-0.5 h-12">
            {peakData.map((d, i) => {
              const max = Math.max(...peakData.map((p) => p.minutes));
              const h = max > 0 ? (d.minutes / max) * 100 : 0;
              const isPeak = d.minutes === max;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.02, duration: 0.5 }}
                    className="w-full rounded-sm"
                    style={{
                      background: isPeak ? "rgb(var(--accent))" : "rgb(var(--bg-elevated))",
                      minHeight: "2px",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted">12am</span>
            <span className="text-[10px] text-muted">12pm</span>
            <span className="text-[10px] text-muted">11pm</span>
          </div>
          <p className="text-[10px] text-muted mt-1">
            Peak: {peakData.reduce((best, d) => d.minutes > best.minutes ? d : best, peakData[0])?.hour} · {Math.round(analytics.avgSession / 60)} min avg session
          </p>
        </motion.div>

      </motion.div>
    </div>
  );
}
