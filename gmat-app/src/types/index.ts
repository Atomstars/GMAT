// ─── GMAT Section/Chapter/Topic hierarchy ───────────────────────────────────

export type SectionId = "quantitative" | "verbal" | "data-insights";

export type Difficulty = "foundation" | "standard" | "advanced" | "adaptive";

export type QuestionType =
  | "problem-solving"
  | "data-sufficiency"
  | "critical-reasoning"
  | "reading-comprehension"
  | "multi-source-reasoning"
  | "table-analysis"
  | "graphics-interpretation"
  | "two-part-analysis";

export type ActivityType = "practice" | "timed-test" | "mock-test" | "ai-tutor" | "review";

// ─── Chapter / Practice Sheet hierarchy ──────────────────────────────────────

export interface PracticeSheet {
  id: string;
  topicId: string;
  title: string;
  questionCount: number;
  difficulty: Difficulty;
  estimatedMinutes: number;
  completedCount?: number;   // progress tracking
  accuracy?: number;
}

export interface Topic {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  sheets: PracticeSheet[];
  totalQuestions: number;
  completedQuestions?: number;
}

export interface Chapter {
  id: string;
  sectionId: SectionId;
  title: string;
  icon: string;
  description: string;
  topics: Topic[];
  totalSheets: number;
  completedSheets?: number;
}

export interface GmatSection {
  id: SectionId;
  label: string;
  short: string;
  icon: string;
  color: string;
  chapters: Chapter[];
  timedTestQuestions: number;
  timedTestMinutes: number;
}

// ─── Questions ────────────────────────────────────────────────────────────────

export interface Option {
  id: string;
  label: string;
  text: string;
}

export interface Question {
  id: string;
  sectionId: SectionId;
  chapterId: string;
  topicId: string;
  sheetId: string;
  type: QuestionType;
  difficulty: Difficulty;
  difficultyScore: number; // 1–10
  prompt: string;
  passage?: string;
  options?: Option[];
  correctAnswer: string;
  explanation: string;
  tags: string[];
  estimatedTime: number; // seconds
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: string;
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export interface PracticeSession {
  id: string;
  userId: string;
  type: "practice" | "timed-test";   // NO timer vs timer
  sectionId: SectionId | "mixed";
  chapterId?: string;
  topicId?: string;
  sheetId?: string;
  title: string;
  questions: Question[];
  answers: UserAnswer[];
  startTime: string;
  endTime?: string;
  status: "in-progress" | "completed" | "paused";
  timeLimitSeconds?: number;          // only set for timed-test
  score?: number;
  accuracy?: number;
}

export interface MockTest {
  id: string;
  userId: string;
  status: "in-progress" | "completed";
  currentSection: SectionId;
  sections: MockSection[];
  startTime: string;
  endTime?: string;
  totalScore?: number;
  sectionScores?: Record<SectionId, number>;
}

export interface MockSection {
  section: SectionId;
  questions: Question[];
  answers: UserAnswer[];
  timeLimit: number;
  timeRemaining: number;
  status: "not-started" | "in-progress" | "completed";
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  targetScore: number;
  testDate?: string;
  dailyGoalMinutes: number;
  weakAreas: SectionId[];
  onboardingComplete: boolean;
  createdAt: string;
}

// ─── Stats & Time Tracking ────────────────────────────────────────────────────

export interface AppSession {
  id: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  activityType: ActivityType;
}

export interface TimeAnalytics {
  totalAppTimeSeconds: number;
  todayAppTimeSeconds: number;
  byActivityType: Record<ActivityType, number>; // seconds
  dailySessions: DailyTime[];                   // last 14 days
  sessionHistory: AppSession[];                 // recent sessions
  peakHours: number[];                          // 24-element array (seconds per hour)
  avgSessionLengthSeconds: number;
}

export interface DailyTime {
  date: string;                                 // YYYY-MM-DD
  totalSeconds: number;
  byActivity: Partial<Record<ActivityType, number>>;
}

export interface StudyStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  totalTimeSpent: number; // minutes (legacy — kept for compat)
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  sectionStats: Record<SectionId, SectionStat>;
  weeklyProgress: DayProgress[];
  scoreHistory: ScoreDataPoint[];
  timeAnalytics: TimeAnalytics;
}

export interface SectionStat {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  estimatedScore: number;
}

export interface DayProgress {
  date: string;
  questionsAnswered: number;
  minutesStudied: number;
}

export interface ScoreDataPoint {
  date: string;
  score: number;
  section?: SectionId;
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  questionContext?: {
    questionId: string;
    userAnswer?: string;
    isCorrect?: boolean;
  };
}
