"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile, PracticeSession, AiMessage, StudyStats, ActivityType, AppSession, DailyTime } from "@/types";
import { MOCK_STATS } from "@/lib/mock-data";

// ─── Time Tracking Store ──────────────────────────────────────────────────────

interface TimeStore {
  // Current live session
  currentSessionStart: number | null;
  currentActivity: ActivityType | null;
  liveSeconds: number;

  // Persisted analytics
  totalAppSeconds: number;
  todaySeconds: number;
  todayDate: string;
  byActivity: Record<ActivityType, number>;
  dailySessions: DailyTime[];
  sessionHistory: AppSession[];
  peakHours: number[]; // 24-element array

  // Actions
  startSession: (activity: ActivityType) => void;
  endSession: (totalSeconds: number, activity: ActivityType) => void;
  tickLive: (seconds: number) => void;
  resetTodayIfNeeded: () => void;
}

const DEFAULT_BY_ACTIVITY: Record<ActivityType, number> = {
  practice: 0,
  "timed-test": 0,
  "mock-test": 0,
  "ai-tutor": 0,
  review: 0,
};

export const useTimeStore = create<TimeStore>()(
  persist(
    (set, get) => ({
      currentSessionStart: null,
      currentActivity: null,
      liveSeconds: 0,
      totalAppSeconds: 0,
      todaySeconds: 0,
      todayDate: new Date().toISOString().split("T")[0],
      byActivity: { ...DEFAULT_BY_ACTIVITY },
      dailySessions: [],
      sessionHistory: [],
      peakHours: Array(24).fill(0),

      startSession: (activity) => {
        get().resetTodayIfNeeded();
        set({ currentSessionStart: Date.now(), currentActivity: activity, liveSeconds: 0 });
      },

      endSession: (totalSeconds, activity) => {
        if (totalSeconds < 5) return;
        const today = new Date().toISOString().split("T")[0];
        const hour = new Date().getHours();

        set((s) => {
          // Update peak hours
          const peakHours = [...s.peakHours];
          peakHours[hour] = (peakHours[hour] || 0) + totalSeconds;

          // Update by-activity totals
          const byActivity = { ...s.byActivity, [activity]: (s.byActivity[activity] || 0) + totalSeconds };

          // Update daily sessions
          const dailySessions = [...s.dailySessions];
          const dayIdx = dailySessions.findIndex((d) => d.date === today);
          if (dayIdx >= 0) {
            dailySessions[dayIdx] = {
              ...dailySessions[dayIdx],
              totalSeconds: dailySessions[dayIdx].totalSeconds + totalSeconds,
              byActivity: {
                ...dailySessions[dayIdx].byActivity,
                [activity]: ((dailySessions[dayIdx].byActivity[activity] || 0) + totalSeconds),
              },
            };
          } else {
            dailySessions.push({
              date: today,
              totalSeconds,
              byActivity: { [activity]: totalSeconds },
            });
          }
          // Keep last 90 days
          if (dailySessions.length > 90) dailySessions.shift();

          // Session history
          const newSession: AppSession = {
            id: crypto.randomUUID(),
            startTime: new Date(Date.now() - totalSeconds * 1000).toISOString(),
            endTime: new Date().toISOString(),
            durationSeconds: totalSeconds,
            activityType: activity,
          };
          const sessionHistory = [newSession, ...s.sessionHistory].slice(0, 50);

          return {
            totalAppSeconds: s.totalAppSeconds + totalSeconds,
            todaySeconds: s.todaySeconds + totalSeconds,
            byActivity,
            dailySessions,
            sessionHistory,
            peakHours,
            currentSessionStart: null,
            currentActivity: null,
            liveSeconds: 0,
          };
        });
      },

      tickLive: (seconds) => set({ liveSeconds: seconds }),

      resetTodayIfNeeded: () => {
        const today = new Date().toISOString().split("T")[0];
        if (get().todayDate !== today) {
          set({ todayDate: today, todaySeconds: 0 });
        }
      },
    }),
    { name: "gmat-time-analytics" }
  )
);

// ─── User Store ───────────────────────────────────────────────────────────────

interface UserStore {
  user: UserProfile | null;
  stats: StudyStats;
  theme: "dark" | "light" | "system";
  setUser: (user: UserProfile | null) => void;
  setTheme: (theme: "dark" | "light" | "system") => void;
  updateStats: (stats: Partial<StudyStats>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      stats: MOCK_STATS,
      theme: "dark",
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      updateStats: (stats) => set((s) => ({ stats: { ...s.stats, ...stats } })),
    }),
    { name: "gmat-user" }
  )
);

// ─── Session Store ────────────────────────────────────────────────────────────

interface SessionStore {
  currentSession: PracticeSession | null;
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  showExplanation: boolean;
  liveSeconds: number;
  setSession: (session: PracticeSession) => void;
  clearSession: () => void;
  selectAnswer: (answer: string) => void;
  nextQuestion: () => void;
  toggleExplanation: () => void;
  setLiveSeconds: (s: number) => void;
}

export const useSessionStore = create<SessionStore>()((set, get) => ({
  currentSession: null,
  currentQuestionIndex: 0,
  selectedAnswer: null,
  isAnswered: false,
  showExplanation: false,
  liveSeconds: 0,
  setSession: (session) =>
    set({ currentSession: session, currentQuestionIndex: 0, selectedAnswer: null, isAnswered: false }),
  clearSession: () =>
    set({ currentSession: null, currentQuestionIndex: 0, selectedAnswer: null, isAnswered: false, showExplanation: false }),
  selectAnswer: (answer) => {
    if (get().isAnswered) return;
    set({ selectedAnswer: answer, isAnswered: true });
  },
  nextQuestion: () =>
    set((s) => ({
      currentQuestionIndex: s.currentQuestionIndex + 1,
      selectedAnswer: null,
      isAnswered: false,
      showExplanation: false,
    })),
  toggleExplanation: () => set((s) => ({ showExplanation: !s.showExplanation })),
  setLiveSeconds: (liveSeconds) => set({ liveSeconds }),
}));

// ─── AI Store ─────────────────────────────────────────────────────────────────

interface AiStore {
  isOpen: boolean;
  messages: AiMessage[];
  isLoading: boolean;
  context: { questionId?: string; userAnswer?: string; isCorrect?: boolean; prompt?: string } | null;
  openAi: (context?: AiStore["context"]) => void;
  closeAi: () => void;
  addMessage: (msg: Omit<AiMessage, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useAiStore = create<AiStore>()((set) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  context: null,
  openAi: (context = null) => set({ isOpen: true, context }),
  closeAi: () => set({ isOpen: false }),
  addMessage: (msg) =>
    set((s) => ({
      messages: [...s.messages, { ...msg, id: crypto.randomUUID(), timestamp: new Date().toISOString() }],
    })),
  setLoading: (isLoading) => set({ isLoading }),
  clearMessages: () => set({ messages: [] }),
}));

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UiStore {
  activeTab: string;
  sidebarOpen: boolean;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiStore>()((set) => ({
  activeTab: "dashboard",
  sidebarOpen: false,
  setActiveTab: (activeTab) => set({ activeTab }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
