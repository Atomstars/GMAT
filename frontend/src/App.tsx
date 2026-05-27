import { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";
import { api } from "./api";
import type { Section, Category, Chapter, Exercise, Question, SubmissionResult } from "./api";


// ─── TIMER HOOK ──────────────────────────────────────────────────────────────
function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const reset = useCallback(() => { setSeconds(0); }, []);
  const start = useCallback(() => { setRunning(true); }, []);
  const stop = useCallback(() => { setRunning(false); }, []);

  useEffect(() => {
    if (running) ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);

  const fmt = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return { seconds, fmt, start, stop, reset };
}

// ─── QUESTION TYPE LABEL ──────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, { label: string; cls: string }> = {
  SC: { label: "Sentence Correction", cls: "badge-blue" },
  CR: { label: "Critical Reasoning", cls: "badge-purple" },
  RC: { label: "Reading Comp", cls: "badge-cyan" },
  PS: { label: "Problem Solving", cls: "badge-green" },
  MCQ: { label: "Multiple Choice", cls: "badge-green" },
  DS: { label: "Data Sufficiency", cls: "badge-amber" },
  TA: { label: "Table Analysis", cls: "badge-amber" },
  GI: { label: "Graphics Interp.", cls: "badge-amber" },
  MSR: { label: "Multi-Source", cls: "badge-amber" },
  TPA: { label: "Two-Part Analysis", cls: "badge-amber" },
};

const DS_CHOICES = `(A) Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.
(B) Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.
(C) BOTH statements TOGETHER are sufficient, but NEITHER alone is sufficient.
(D) EACH statement ALONE is sufficient.
(E) Statements (1) and (2) TOGETHER are NOT sufficient.`;

// ─── QUESTION COMPONENT ───────────────────────────────────────────────────────
function QuestionView({
  question, questionNumber, totalQuestions, exerciseId, onNext, isLast,
}: {
  question: Question; questionNumber: number; totalQuestions: number;
  exerciseId?: number; onNext: () => void; isLast: boolean;
}) {
  const [selected, setSelected] = useState<string>("");
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [tutorHistory, setTutorHistory] = useState<{ role: string; content: string }[]>([]);
  const [tutorMsg, setTutorMsg] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const timer = useTimer();
  const typeInfo = TYPE_LABELS[question.question_type] || { label: question.question_type, cls: "badge-blue" };

  useEffect(() => {
    setSelected(""); setResult(null); setShowTutor(false);
    setTutorHistory([]); setTutorMsg("");
    timer.reset(); timer.start();
  }, [question.id]);

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    timer.stop();
    setSubmitting(true);
    try {
      const res = await api.submitAnswer({
        question_id: question.id,
        exercise_id: exerciseId,
        user_answer: selected,
        time_spent_seconds: timer.seconds,
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTutorSend = async () => {
    if (!tutorMsg.trim() || tutorLoading) return;
    const msg = tutorMsg.trim();
    setTutorMsg("");
    const newHistory = [...tutorHistory, { role: "user", content: msg }];
    setTutorHistory(newHistory);
    setTutorLoading(true);
    try {
      const res = await api.tutorChat({ question_id: question.id, message: msg, history: tutorHistory });
      setTutorHistory([...newHistory, { role: "assistant", content: res.reply }]);
    } catch {
      setTutorHistory([...newHistory, { role: "assistant", content: "⚠️ Could not reach local Ollama tutor. Make sure Ollama is running with `ollama serve`." }]);
    } finally {
      setTutorLoading(false);
    }
  };

  const isDS = question.question_type === "DS";
  const hasOptions = question.options && question.options.length > 0;
  const optionsList = isDS
    ? [{ option_letter: "A", option_text: "Statement (1) ALONE is sufficient, but (2) alone is not." },
       { option_letter: "B", option_text: "Statement (2) ALONE is sufficient, but (1) alone is not." },
       { option_letter: "C", option_text: "BOTH statements TOGETHER are sufficient, but NEITHER alone is." },
       { option_letter: "D", option_text: "EACH statement ALONE is sufficient." },
       { option_letter: "E", option_text: "Statements (1) and (2) TOGETHER are NOT sufficient." }]
    : hasOptions ? question.options : [];

  return (
    <div className="question-card" id={`question-${question.id}`}>
      <div className={`question-type-banner type-${question.question_type}`} />
      <div className="question-body">
        {/* Header */}
        <div className="question-meta">
          <span className={`badge ${typeInfo.cls}`}>{typeInfo.label}</span>
          <span className="text-sm text-muted">Q {questionNumber} / {totalQuestions}</span>
          <span className="timer" style={{ marginLeft: "auto" }}>{timer.fmt}</span>
        </div>

        {/* Stem */}
        <div className="question-stem">{question.stem || "(Question image below)"}</div>

        {/* Image */}
        {question.image_path && (
          <img
            src={`http://127.0.0.1:8000/images/${question.image_path.replace("images/", "")}`}
            alt="Question diagram"
            className="question-image"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {/* DS Statements */}
        {isDS && question.statements && Object.keys(question.statements).length > 0 && (
          <div className="ds-statements">
            {Object.entries(question.statements).map(([k, v]) => (
              <div className="ds-stmt" key={k}>
                <div className="ds-stmt-key">({k})</div>
                <div className="ds-stmt-text">{v}</div>
              </div>
            ))}
          </div>
        )}

        {/* DS choices reminder */}
        {isDS && (
          <div className="ds-choices">{DS_CHOICES}</div>
        )}

        {/* Options */}
        {optionsList.length > 0 && (
          <div className="options-list">
            {optionsList.map((opt) => {
              let cls = "";
              if (result) {
                if (opt.option_letter === result.correct_answer) cls = "correct";
                else if (opt.option_letter === selected) cls = "wrong";
                else cls = "disabled";
              } else if (opt.option_letter === selected) cls = "selected";

              return (
                <div
                  key={opt.option_letter}
                  id={`option-${question.id}-${opt.option_letter}`}
                  className={`option-item ${cls} ${result ? "disabled" : ""}`}
                  onClick={() => !result && setSelected(opt.option_letter)}
                >
                  <div className="option-letter">{opt.option_letter}</div>
                  <div className="option-text">{opt.option_text}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit / Next */}
        {!result && (
          <div className="flex gap-8 mt-16">
            <button
              id={`submit-q-${question.id}`}
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!selected || submitting}
            >
              {submitting ? <span className="spinner" /> : "✓ Submit Answer"}
            </button>
          </div>
        )}

        {/* Result Panel */}
        {result && (
          <div className="explanation-panel">
            <div className={`explanation-result ${result.is_correct ? "correct" : "wrong"}`}>
              {result.is_correct ? "✓ Correct!" : `✗ Incorrect — Correct answer: (${result.correct_answer})`}
            </div>
            <div className="explanation-header" style={{ color: "var(--text-muted)" }}>
              📖 Official Explanation
            </div>
            <div className="explanation-text">{result.official_explanation || "See the image above for the solution."}</div>

            <div className="flex gap-8 mt-16">
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTutor(t => !t)}>
                🤖 Ask Tutor
              </button>
              <button
                id={`next-q-${question.id}`}
                className="btn btn-primary"
                onClick={onNext}
                style={{ marginLeft: "auto" }}
              >
                {isLast ? "🏁 Finish Exercise" : "Next →"}
              </button>
            </div>
          </div>
        )}

        {/* Tutor Panel */}
        {showTutor && (
          <div className="tutor-panel mt-16">
            <div className="tutor-header">
              <div className="tutor-avatar">🎓</div>
              <div>
                <div className="tutor-name">GMAT AI Tutor</div>
                <div className="tutor-status">● Powered by local Ollama</div>
              </div>
            </div>
            <div className="tutor-messages">
              {tutorHistory.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <div className="empty-title">Ask anything about this question</div>
                  <div className="empty-desc">The tutor is grounded strictly in the official explanation above.</div>
                </div>
              )}
              {tutorHistory.map((m, i) => (
                <div key={i} className={`tutor-msg ${m.role}`}>
                  <div className="tutor-msg-bubble">{m.content}</div>
                </div>
              ))}
              {tutorLoading && (
                <div className="tutor-msg assistant">
                  <div className="tutor-msg-bubble" style={{ display: "flex", gap: 6 }}>
                    <span className="spinner" style={{ width: 14, height: 14 }} />
                    <span style={{ color: "var(--text-muted)", fontSize: 12 }}>Thinking…</span>
                  </div>
                </div>
              )}
            </div>
            <div className="tutor-input-area">
              <input
                className="tutor-input"
                placeholder="Ask about this question…"
                value={tutorMsg}
                onChange={e => setTutorMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleTutorSend()}
              />
              <button className="btn btn-primary btn-sm" onClick={handleTutorSend} disabled={tutorLoading || !tutorMsg.trim()}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EXERCISE PAGE ────────────────────────────────────────────────────────────
function ExercisePage({
  exerciseId, exerciseTitle, chapterTitle, onBack,
}: { exerciseId: number; exerciseTitle: string; chapterTitle: string; onBack: () => void }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    api.getExerciseQuestions(exerciseId)
      .then(setQuestions)
      .finally(() => setLoading(false));
  }, [exerciseId]);

  if (loading) return <div className="loading-overlay"><span className="spinner" /></div>;
  if (questions.length === 0) return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
      <div className="empty-state mt-24">
        <div className="empty-icon">📭</div>
        <div className="empty-title">No questions loaded</div>
        <div className="empty-desc">The PDF extractor couldn't find structured questions in this chapter. Check the image crops.</div>
      </div>
    </div>
  );

  if (completed) return (
    <div>
      <div className="hero-section" style={{ textAlign: "center", padding: "60px 40px" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 className="hero-title">Exercise Complete!</h2>
        <p className="hero-desc" style={{ margin: "0 auto 24px" }}>
          You've completed all {questions.length} questions from {exerciseTitle}.
        </p>
        <div className="flex gap-8" style={{ justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={onBack}>← Back to Chapters</button>
          <button className="btn btn-primary" onClick={() => { setCurrentIdx(0); setCompleted(false); }}>
            🔄 Redo Exercise
          </button>
        </div>
      </div>
    </div>
  );

  const q = questions[currentIdx];
  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div>
      {/* Header */}
      <div className="exercise-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>{chapterTitle}</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{exerciseTitle}</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
          {currentIdx}/{questions.length}
        </div>
        <div style={{ width: 200 }}>
          <div className="exercise-progress-bar">
            <div className="exercise-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <QuestionView
        question={q}
        questionNumber={currentIdx + 1}
        totalQuestions={questions.length}
        exerciseId={exerciseId}
        isLast={currentIdx === questions.length - 1}
        onNext={() => {
          if (currentIdx === questions.length - 1) setCompleted(true);
          else setCurrentIdx(i => i + 1);
        }}
      />
    </div>
  );
}

// ─── CHAPTER LIST PAGE ────────────────────────────────────────────────────────
function ChapterListPage({
  category, onSelectChapter, onBack,
}: { category: Category; onSelectChapter: (ch: Chapter) => void; onBack: () => void }) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getChapters(category.id).then(setChapters).finally(() => setLoading(false));
  }, [category.id]);

  const bookBadge = (book: string) => {
    const m: Record<string, string> = { VERBAL: "badge-blue", QUANT: "badge-green", FOM: "badge-purple" };
    return m[book] || "badge-blue";
  };

  return (
    <div>
      <div className="flex items-center gap-12 mb-16" style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>{category.name}</h2>
      </div>
      {loading ? <div className="loading-overlay"><span className="spinner" /></div> : (
        <div className="chapter-list">
          {chapters.map(ch => (
            <div key={ch.id} className="chapter-item" id={`chapter-${ch.id}`} onClick={() => onSelectChapter(ch)}>
              <div className="chapter-num">{ch.chapter_number}</div>
              <div className="chapter-info">
                <div className="chapter-title">{ch.title}</div>
                <div className="chapter-meta">
                  <span className={`badge ${bookBadge(ch.source_book)}`}>{ch.source_book}</span>
                  {ch.start_page && <span>Pages {ch.start_page}–{ch.end_page}</span>}
                </div>
              </div>
              <span className="chapter-arrow">›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── EXERCISES PAGE ───────────────────────────────────────────────────────────
function ChapterExercisesPage({
  chapter, onSelectExercise, onBack,
}: { chapter: Chapter; onSelectExercise: (ex: Exercise) => void; onBack: () => void }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getExercises(chapter.id).then(setExercises).finally(() => setLoading(false));
  }, [chapter.id]);

  return (
    <div>
      <div className="flex items-center gap-12" style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Chapter {chapter.chapter_number}: {chapter.title}</h2>
      </div>

      {loading ? <div className="loading-overlay"><span className="spinner" /></div> : exercises.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <div className="empty-title">No exercises found</div>
          <div className="empty-desc">This chapter may have DI visual questions or no extractable problem set.</div>
        </div>
      ) : (
        <div className="chapter-list">
          {exercises.map(ex => (
            <div key={ex.id} className="chapter-item" id={`exercise-${ex.id}`} onClick={() => onSelectExercise(ex)}>
              <div className="chapter-num">#{ex.exercise_number}</div>
              <div className="chapter-info">
                <div className="chapter-title">{ex.title}</div>
                <div className="chapter-meta"><span>Click to start practice</span></div>
              </div>
              <span className="chapter-arrow">›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
function AnalyticsPage() {
  const [data, setData] = useState<{ summary: any; categories: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><span className="spinner" /></div>;
  if (!data) return null;

  const { summary, categories } = data;
  const accuracy = summary.total_attempts > 0
    ? Math.round((summary.correct_attempts / summary.total_attempts) * 100)
    : 0;

  return (
    <div>
      <div className="hero-section" style={{ marginBottom: 24 }}>
        <div className="hero-title">📊 Your <span>Performance Analytics</span></div>
        <div className="hero-desc">Track your accuracy, speed, and weak areas across all question types.</div>
      </div>

      <div className="stat-cards">
        {[
          { icon: "✅", label: "Accuracy", value: `${accuracy}%`, color: "#34d399", bg: "rgba(16,185,129,0.12)" },
          { icon: "📝", label: "Total Attempts", value: summary.total_attempts ?? 0, color: "#60a5fa", bg: "rgba(59,130,246,0.12)" },
          { icon: "🎯", label: "Correct", value: summary.correct_attempts ?? 0, color: "#34d399", bg: "rgba(16,185,129,0.12)" },
          { icon: "⏱", label: "Avg Time", value: summary.avg_time ? `${Math.round(summary.avg_time)}s` : "—", color: "#fbbf24", bg: "rgba(245,158,11,0.12)" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color, fontSize: 20 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Performance by Category</h3>
        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No data yet</div>
            <div className="empty-desc">Complete some exercises to see your performance breakdown here.</div>
          </div>
        ) : (
          <div className="chart-bar-container">
            {categories.map((cat: any) => {
              const pct = Math.round((cat.correct_attempts / (cat.attempts || 1)) * 100);
              return (
                <div key={cat.category_name} className="chart-bar-row">
                  <div className="chart-bar-label">{cat.category_name}</div>
                  <div className="chart-bar-track">
                    <div className="chart-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="chart-bar-value">{pct}%</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 8 }}>
                    {cat.correct_attempts}/{cat.attempts}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div>
      <div className="hero-section">
        <div className="hero-title">Welcome to <span>GMAT Prep Studio</span> 🎓</div>
        <p className="hero-desc">
          Practice with authentic questions extracted directly from Manhattan Prep strategy guides.
          Every question, option, and explanation is exactly as printed — no AI paraphrasing.
        </p>
        <div className="flex gap-8 mt-16">
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate("practice")}>
            ▶ Start Practicing
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => onNavigate("analytics")}>
            📊 View Analytics
          </button>
        </div>
      </div>

      <div className="stat-cards">
        {[
          { icon: "📐", label: "Quant & DI Chapters", value: "31", color: "#34d399", bg: "rgba(16,185,129,0.12)" },
          { icon: "📚", label: "Verbal Chapters", value: "22", color: "#60a5fa", bg: "rgba(59,130,246,0.12)" },
          { icon: "🔢", label: "Foundations Chapters", value: "10", color: "#c084fc", bg: "rgba(139,92,246,0.12)" },
          { icon: "❓", label: "Total Questions", value: "448+", color: "#fbbf24", bg: "rgba(245,158,11,0.12)" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color, fontSize: 20 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card-grid cols-3">
        {[
          { icon: "📝", title: "Sentence Correction", desc: "Master grammar, meaning, and sentence structure with 77+ authentic SC questions.", color: "var(--accent-blue)", nav: "practice" },
          { icon: "🧮", title: "Data Sufficiency", desc: "Sharpen your DS instincts with all 25 extracted DS questions across chapters.", color: "var(--accent-amber)", nav: "practice" },
          { icon: "💬", title: "Critical Reasoning", desc: "Train argument analysis — Find Assumptions, Strengthen, Weaken, Evaluate, and more.", color: "var(--accent-purple)", nav: "practice" },
        ].map((c, i) => (
          <div key={i} className="card" style={{ cursor: "pointer" }} onClick={() => onNavigate(c.nav)}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: c.color }}>{c.title}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PRACTICE SECTION PAGE ────────────────────────────────────────────────────
type PracticeView =
  | { type: "sections" }
  | { type: "categories"; section: Section }
  | { type: "chapters"; category: Category }
  | { type: "exercises"; chapter: Chapter }
  | { type: "exercise"; exercise: Exercise; chapter: Chapter };

function PracticePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [view, setView] = useState<PracticeView>({ type: "sections" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSections(), api.getCategories()])
      .then(([s, c]) => { setSections(s); setCategories(c); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><span className="spinner" /></div>;

  const sectionIcon: Record<string, string> = {
    Verbal: "📝", Quant: "🧮", "Data Insights": "📊",
  };

  if (view.type === "sections") {
    return (
      <div>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Choose a Section</h2>
        <div className="chapter-list">
          {sections.map(s => (
            <div key={s.id} className="chapter-item" id={`section-${s.id}`}
              onClick={() => setView({ type: "categories", section: s })}>
              <div className="chapter-num" style={{ fontSize: 22 }}>{sectionIcon[s.name] || "📖"}</div>
              <div className="chapter-info">
                <div className="chapter-title">{s.name}</div>
                <div className="chapter-meta">
                  <span>{categories.filter(c => c.section_id === s.id).length} categories</span>
                </div>
              </div>
              <span className="chapter-arrow">›</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view.type === "categories") {
    const cats = categories.filter(c => c.section_id === view.section.id);
    return (
      <div>
        <div className="flex items-center gap-12" style={{ marginBottom: 20 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setView({ type: "sections" })}>← Sections</button>
          <h2 style={{ fontWeight: 700, fontSize: 22 }}>{view.section.name}</h2>
        </div>
        <div className="chapter-list">
          {cats.map(c => (
            <div key={c.id} className="chapter-item" id={`category-${c.id}`}
              onClick={() => setView({ type: "chapters", category: c })}>
              <div className="chapter-num" style={{ fontSize: 18 }}>📂</div>
              <div className="chapter-info">
                <div className="chapter-title">{c.name}</div>
              </div>
              <span className="chapter-arrow">›</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view.type === "chapters") {
    return (
      <ChapterListPage
        category={view.category}
        onSelectChapter={ch => setView({ type: "exercises", chapter: ch })}
        onBack={() => setView({ type: "categories", section: sections.find(s => s.id === view.category.section_id)! })}
      />
    );
  }

  if (view.type === "exercises") {
    return (
      <ChapterExercisesPage
        chapter={view.chapter}
        onSelectExercise={ex => setView({ type: "exercise", exercise: ex, chapter: view.chapter })}
        onBack={() => setView({ type: "chapters", category: categories.find(c => c.id === view.chapter.category_id)! })}
      />
    );
  }

  if (view.type === "exercise") {
    return (
      <ExercisePage
        exerciseId={view.exercise.id}
        exerciseTitle={view.exercise.title}
        chapterTitle={`Ch ${view.chapter.chapter_number}: ${view.chapter.title}`}
        onBack={() => setView({ type: "exercises", chapter: view.chapter })}
      />
    );
  }

  return null;
}

// ─── SIDEBAR COMPONENT ────────────────────────────────────────────────────────
function Sidebar({ activePage, onNavigate }: { activePage: string; onNavigate: (p: string) => void }) {
  const navItems = [
    { id: "home", icon: "🏠", label: "Dashboard" },
    { id: "practice", icon: "✏️", label: "Practice" },
    { id: "analytics", icon: "📊", label: "Analytics" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">G</div>
          <div>
            <div className="logo-text">GMAT Prep</div>
            <div className="logo-sub">Local-First Studio</div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="divider" />
        <div className="nav-section-label">Resources</div>
        <div className="nav-item" style={{ fontSize: 12 }}>
          <span className="nav-icon">📖</span>448 Questions Extracted
        </div>
        <div className="nav-item" style={{ fontSize: 12 }}>
          <span className="nav-icon">🗃</span>3 Strategy Guides
        </div>
        <div className="nav-item" style={{ fontSize: 12 }}>
          <span className="nav-icon">🤖</span>Local Ollama Tutor
        </div>
      </nav>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  const pageTitle: Record<string, string> = {
    home: "Dashboard",
    practice: "Practice Questions",
    analytics: "Analytics",
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={page} onNavigate={setPage} />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">{pageTitle[page]}</div>
          <div className="topbar-actions">
            <span className="badge badge-green" style={{ fontSize: 11 }}>● Backend Connected</span>
          </div>
        </div>
        <div className="page-content">
          {page === "home" && <HomePage onNavigate={setPage} />}
          {page === "practice" && <PracticePage />}
          {page === "analytics" && <AnalyticsPage />}
        </div>
      </div>
    </div>
  );
}
