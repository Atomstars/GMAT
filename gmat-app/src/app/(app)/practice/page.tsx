"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Clock, BookOpen, Play, AlertCircle, CheckCircle, Lock } from "lucide-react";
import { GMAT_CURRICULUM } from "@/lib/mock-data";
import type { GmatSection, Chapter, Topic, PracticeSheet } from "@/types";
import { cn } from "@/lib/utils";

type DrillLevel = "sections" | "chapters" | "topics" | "sheets";

interface Breadcrumb {
  label: string;
  level: DrillLevel;
}

function PracticePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get("mode") === "timed" ? "timed" : "practice";

  const [mode, setMode] = useState<"practice" | "timed">(initialMode);
  const [level, setLevel] = useState<DrillLevel>("sections");
  const [selectedSection, setSelectedSection] = useState<GmatSection | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  const goBack = () => {
    if (level === "chapters") { setLevel("sections"); setSelectedSection(null); setBreadcrumbs([]); }
    else if (level === "topics") { setLevel("chapters"); setSelectedChapter(null); setBreadcrumbs((b) => b.slice(0, 1)); }
    else if (level === "sheets") { setLevel("topics"); setSelectedTopic(null); setBreadcrumbs((b) => b.slice(0, 2)); }
  };

  const startPractice = (sheetId: string, topicId: string, chapterId: string, sectionId: string) => {
    router.push(`/practice/session?sheet=${sheetId}&chapter=${chapterId}&section=${sectionId}&mode=${mode}`);
  };

  const startTimedTest = (sectionId: string) => {
    router.push(`/practice/timed?section=${sectionId}`);
  };

  const sectionColors: Record<string, { gradient: string; icon: string; border: string }> = {
    quantitative: { gradient: "from-violet-500 to-purple-600", icon: "bg-violet-500/10", border: "border-violet-500/20" },
    verbal: { gradient: "from-blue-500 to-cyan-500", icon: "bg-blue-500/10", border: "border-blue-500/20" },
    "data-insights": { gradient: "from-emerald-500 to-teal-500", icon: "bg-emerald-500/10", border: "border-emerald-500/20" },
  };

  const difficultyColor: Record<string, string> = {
    foundation: "text-emerald-400 bg-emerald-400/10",
    standard: "text-blue-400 bg-blue-400/10",
    advanced: "text-orange-400 bg-orange-400/10",
    adaptive: "text-purple-400 bg-purple-400/10",
  };

  return (
    <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        {level !== "sections" && (
          <button
            id="practice-back-btn"
            onClick={goBack}
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-app transition-colors hover:bg-elevated"
            style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
          >
            <ChevronLeft size={16} className="text-app" />
          </button>
        )}
        <div className="flex-1">
          {breadcrumbs.length > 0 && (
            <p className="text-xs text-muted mb-0.5">
              {breadcrumbs.map((b) => b.label).join(" › ")}
            </p>
          )}
          <h1 className="text-xl font-bold text-app">
            {level === "sections" ? "Practice" :
             level === "chapters" ? selectedSection?.label || "Chapters" :
             level === "topics" ? selectedChapter?.title || "Topics" :
             selectedTopic?.title || "Practice Sheets"}
          </h1>
        </div>
      </div>

      {/* Mode toggle (only on section level) */}
      {level === "sections" && (
        <div
          className="flex rounded-xl p-1 mb-6"
          style={{ background: "rgb(var(--bg-surface))", border: "1px solid rgb(var(--border))" }}
        >
          {([["practice", "📚 Untimed Practice"], ["timed", "⏱️ Timed Tests"]] as const).map(([m, label]) => (
            <button
              key={m}
              id={`mode-toggle-${m}`}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                mode === m ? "text-white" : "text-muted"
              )}
              style={mode === m ? { background: "rgb(var(--accent))" } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Mode description banner */}
      {level === "sections" && (
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-start gap-3 rounded-xl p-4 mb-5 border",
            mode === "practice"
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-orange-500/20 bg-orange-500/5"
          )}
        >
          {mode === "practice" ? (
            <>
              <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-app">Untimed Practice</p>
                <p className="text-xs text-muted mt-0.5">
                  No clock pressure. Drill topics at your own pace — Section → Chapter → Topic → Practice Sheet.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-app">Timed Practice Test</p>
                <p className="text-xs text-muted mt-0.5">
                  GMAT-accurate timing. Quant 45 min · Verbal 45 min · DI 45 min. Simulates real exam pressure.
                </p>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ── SECTIONS ── */}
      <AnimatePresence mode="wait">
        {level === "sections" && (
          <motion.div key="sections" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {GMAT_CURRICULUM.map((section, i) => {
              const colors = sectionColors[section.id];
              const totalSheets = section.chapters.reduce((acc, ch) => acc + ch.totalSheets, 0);
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  {mode === "practice" ? (
                    // Untimed: drill into chapters
                    <button
                      id={`section-${section.id}`}
                      onClick={() => {
                        setSelectedSection(section);
                        setLevel("chapters");
                        setBreadcrumbs([{ label: section.short, level: "sections" }]);
                      }}
                      className="w-full text-left rounded-2xl p-5 border border-app transition-all duration-200 hover:scale-[1.01]"
                      style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br", colors.gradient)}>
                            {section.icon}
                          </div>
                          <div>
                            <p className="font-bold text-app">{section.label}</p>
                            <p className="text-xs text-muted mt-0.5">
                              {section.chapters.length} chapters · {totalSheets} practice sheets
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-muted" />
                      </div>
                    </button>
                  ) : (
                    // Timed: start directly
                    <button
                      id={`timed-section-${section.id}`}
                      onClick={() => startTimedTest(section.id)}
                      className="w-full text-left rounded-2xl p-5 border border-app transition-all duration-200 hover:scale-[1.01]"
                      style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br", colors.gradient)}>
                            {section.icon}
                          </div>
                          <div>
                            <p className="font-bold text-app">{section.label}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-orange-400 bg-orange-400/10"
                              >
                                ⏱ {section.timedTestMinutes} min
                              </span>
                              <span className="text-xs text-muted">{section.timedTestQuestions} questions</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                            style={{ background: "rgb(var(--accent))" }}
                          >
                            Start
                          </div>
                        </div>
                      </div>
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── CHAPTERS ── */}
        {level === "chapters" && selectedSection && (
          <motion.div key="chapters" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            {selectedSection.chapters.map((chapter, i) => (
              <motion.button
                key={chapter.id}
                id={`chapter-${chapter.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => {
                  setSelectedChapter(chapter);
                  setLevel("topics");
                  setBreadcrumbs((b) => [...b, { label: chapter.title, level: "chapters" }]);
                }}
                className="w-full text-left rounded-2xl p-4 border border-app transition-all hover:scale-[1.01]"
                style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: "rgba(var(--accent), 0.12)", color: "rgb(var(--accent))" }}
                    >
                      {chapter.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-app text-sm">{chapter.title}</p>
                      <p className="text-xs text-muted">
                        {chapter.topics.length} topics · {chapter.totalSheets} sheets
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </div>
                <p className="text-xs text-muted mt-2 ml-13 pl-1 leading-relaxed">{chapter.description}</p>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* ── TOPICS ── */}
        {level === "topics" && selectedChapter && (
          <motion.div key="topics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            {selectedChapter.topics.map((topic, i) => (
              <motion.button
                key={topic.id}
                id={`topic-${topic.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => {
                  setSelectedTopic(topic);
                  setLevel("sheets");
                  setBreadcrumbs((b) => [...b, { label: topic.title, level: "topics" }]);
                }}
                className="w-full text-left rounded-2xl p-4 border border-app transition-all hover:scale-[1.01]"
                style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-app text-sm">{topic.title}</p>
                  <ChevronRight size={16} className="text-muted" />
                </div>
                <p className="text-xs text-muted mb-3">{topic.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{topic.sheets.length} sheets · {topic.totalQuestions} questions</span>
                  {topic.completedQuestions !== undefined && (
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--bg-elevated))" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(topic.completedQuestions / topic.totalQuestions) * 100}%`,
                          background: "rgb(var(--accent))",
                        }}
                      />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* ── SHEETS ── */}
        {level === "sheets" && selectedTopic && (
          <motion.div key="sheets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            {selectedTopic.sheets.map((sheet, i) => (
              <motion.div
                key={sheet.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-4 border border-app"
                style={{ background: "rgb(var(--bg-surface))", borderColor: "rgb(var(--border))" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-app text-sm">{sheet.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", difficultyColor[sheet.difficulty])}>
                        {sheet.difficulty}
                      </span>
                      <span className="text-xs text-muted">·</span>
                      <span className="text-xs text-muted">{sheet.questionCount} questions</span>
                      <span className="text-xs text-muted">·</span>
                      <span className="text-xs text-muted">~{sheet.estimatedMinutes}m</span>
                    </div>
                  </div>

                  {sheet.completedCount !== undefined && sheet.completedCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle size={12} />
                      {Math.round((sheet.completedCount / sheet.questionCount) * 100)}%
                    </div>
                  )}
                </div>

                {sheet.completedCount !== undefined && (
                  <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "rgb(var(--bg-elevated))" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(sheet.completedCount / sheet.questionCount) * 100}%`,
                        background: "rgb(var(--success))",
                      }}
                    />
                  </div>
                )}

                <button
                  id={`start-sheet-${sheet.id}`}
                  onClick={() =>
                    startPractice(
                      sheet.id,
                      selectedTopic.id,
                      selectedChapter?.id || "",
                      selectedSection?.id || ""
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "rgb(var(--accent))" }}
                >
                  <Play size={14} />
                  Start Practice Sheet
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense>
      <PracticePageInner />
    </Suspense>
  );
}
