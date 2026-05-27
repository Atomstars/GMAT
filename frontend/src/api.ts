// Backend URL: set VITE_API_URL env var on Vercel/Render to point to your deployed backend
// For local dev: http://127.0.0.1:8000
// For production: https://your-render-app.onrender.com
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export type Section = { id: number; name: string };
export type Category = { id: number; section_id: number; name: string };
export type Chapter = {
  id: number; category_id: number; source_book: string;
  chapter_number: number; title: string; start_page?: number; end_page?: number;
};
export type Exercise = { id: number; chapter_id: number; exercise_number: number; title: string };
export type QuestionOption = { option_letter: string; option_text: string };
export type Question = {
  id: number; chapter_id?: number; question_type: string; stem: string;
  image_path?: string; difficulty_level: string;
  options: QuestionOption[]; statements?: Record<string, string>;
};
export type SubmissionResult = {
  is_correct: boolean; correct_answer: string; official_explanation: string;
};
export type AnalyticsSummary = {
  total_attempts: number; correct_attempts: number; avg_time: number;
};
export type AnalyticsCategory = {
  category_name: string; attempts: number; correct_attempts: number; avg_time: number;
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  getSections: () => get<Section[]>("/sections"),
  getCategories: (sectionId?: number) =>
    get<Category[]>(`/categories${sectionId ? `?section_id=${sectionId}` : ""}`),
  getChapters: (categoryId?: number) =>
    get<Chapter[]>(`/chapters${categoryId ? `?category_id=${categoryId}` : ""}`),
  getExercises: (chapterId: number) =>
    get<Exercise[]>(`/exercises?chapter_id=${chapterId}`),
  getExerciseQuestions: (exerciseId: number) =>
    get<Question[]>(`/exercises/${exerciseId}/questions`),
  getQuestion: (questionId: number) =>
    get<Question>(`/questions/${questionId}`),
  submitAnswer: (body: {
    question_id: number; exercise_id?: number; user_answer: string;
    time_spent_seconds: number; confidence_score?: number; notes?: string;
  }) => post<SubmissionResult>("/submit-answer", body),
  getAnalytics: () =>
    get<{ summary: AnalyticsSummary; categories: AnalyticsCategory[] }>("/analytics"),
  tutorChat: (body: {
    question_id: number; message: string;
    history: { role: string; content: string }[];
  }) => post<{ reply: string }>("/tutor/chat", body),

  // Helper: get full image URL (works both locally and in production)
  imageUrl: (imagePath: string) => {
    const filename = imagePath.replace("images/", "");
    return `${BASE_URL}/images/${filename}`;
  },
};
