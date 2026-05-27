import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return "text-success";
  if (accuracy >= 60) return "text-warning";
  return "text-error";
}

export function getSectionLabel(section: string): string {
  switch (section) {
    case "quantitative": return "Quantitative";
    case "verbal": return "Verbal";
    case "data-insights": return "Data Insights";
    default: return section;
  }
}

export function getSectionShort(section: string): string {
  switch (section) {
    case "quantitative": return "Quant";
    case "verbal": return "Verbal";
    case "data-insights": return "DI";
    default: return section;
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "foundation": return "text-success";
    case "standard": return "text-accent";
    case "advanced": return "text-warning";
    case "adaptive": return "gradient-text";
    default: return "text-muted";
  }
}

export function pluralize(count: number, word: string): string {
  return `${count} ${word}${count !== 1 ? "s" : ""}`;
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return "🔥";
  if (streak >= 14) return "⚡";
  if (streak >= 7) return "✨";
  if (streak >= 3) return "💪";
  return "🌱";
}

export function formatScore(score: number): string {
  return score.toString();
}

export function getScoreColor(score: number): string {
  if (score >= 705) return "text-success";
  if (score >= 605) return "text-accent";
  if (score >= 505) return "text-warning";
  return "text-error";
}
