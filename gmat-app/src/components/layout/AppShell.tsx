"use client";

import { BottomNav } from "./Navigation";
import { AiPanel } from "@/components/ai/AiPanel";
import { useTimeTracker } from "@/hooks/useTimeTracker";
import { useTimeStore } from "@/stores";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { endSession, tickLive } = useTimeStore();

  // Track overall app time as "practice" by default
  useTimeTracker({
    activityType: "practice",
    onTick: tickLive,
    onSessionEnd: (seconds, activity) => endSession(seconds, activity),
  });

  return (
    <div className="min-h-dvh bg-app flex items-center justify-center p-0 md:p-6 overflow-x-hidden relative">
      {/* Premium ambient glows for desktop backing */}
      <div className="hidden md:block absolute w-[450px] h-[450px] rounded-full bg-accent/8 blur-[100px] pointer-events-none z-0 -translate-x-[200px]" />
      <div className="hidden md:block absolute w-[400px] h-[400px] rounded-full bg-accent-cyan/4 blur-[90px] pointer-events-none z-0 translate-x-[220px] -translate-y-[100px]" />

      {/* Main High-Fidelity Mobile Viewport Frame Container */}
      <div
        className="w-full max-w-[430px] h-dvh md:h-[880px] md:max-h-[90vh] bg-surface md:rounded-[40px] md:border md:border-app relative flex flex-col shadow-2xl overflow-hidden z-10"
        style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--bg-surface))" }}
      >
        {/* Main scrollable content inside mobile container */}
        <main className="flex-1 overflow-y-auto pb-16 pt-safe">
          {children}
        </main>

        {/* Unified Mobile Bottom Navigation */}
        <BottomNav />

        {/* AI Tutor Slide-up bottom sheet */}
        <AiPanel />
      </div>
    </div>
  );
}
