from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict
import sqlite3
import httpx
import json
import os

app = FastAPI(title="GMAT Local-First Prep System", version="1.0.0")

# Enable CORS for frontend SPA integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Portable paths — works locally AND on Vercel/Render
_BASE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(_BASE, "gmat_prep.db")
IMAGES_DIR = os.path.join(_BASE, "..", "extractor", "images")

# Serve cropped question images
if os.path.isdir(IMAGES_DIR):
    app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# --- Pydantic Models for API Requests/Responses ---

class SectionResponse(BaseModel):
    id: int
    name: str

class CategoryResponse(BaseModel):
    id: int
    section_id: int
    name: str

class ChapterResponse(BaseModel):
    id: int
    category_id: int
    source_book: str
    chapter_number: int
    title: str
    start_page: Optional[int] = None
    end_page: Optional[int] = None

class ExerciseResponse(BaseModel):
    id: int
    chapter_id: int
    exercise_number: int
    title: str

class QuestionOptionModel(BaseModel):
    option_letter: str
    option_text: str

class QuestionResponse(BaseModel):
    id: int
    chapter_id: Optional[int]
    question_type: str
    stem: str
    image_path: Optional[str]
    difficulty_level: str
    options: List[QuestionOptionModel]
    statements: Optional[Dict[str, str]] = None

class AnswerSubmission(BaseModel):
    question_id: int
    exercise_id: Optional[int] = None
    user_answer: str # 'A', 'B', etc. or multi-part JSON string
    time_spent_seconds: int
    confidence_score: Optional[int] = None
    notes: Optional[str] = None

class SubmissionResult(BaseModel):
    is_correct: bool
    correct_answer: str
    official_explanation: str

class TutorChatRequest(BaseModel):
    question_id: int
    message: str
    history: List[Dict[str, str]] = [] # [{'role': 'user', 'content': '...'}, {'role': 'assistant', 'content': '...'}]

# --- API Endpoints ---

@app.get("/sections", response_model=List[SectionResponse])
def read_sections(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id, name FROM sections ORDER BY id;")
    return [dict(row) for row in cursor.fetchall()]

@app.get("/categories", response_model=List[CategoryResponse])
def read_categories(section_id: Optional[int] = None, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    if section_id:
        cursor.execute("SELECT id, section_id, name FROM categories WHERE section_id = ? ORDER BY name;", (section_id,))
    else:
        cursor.execute("SELECT id, section_id, name FROM categories ORDER BY name;")
    return [dict(row) for row in cursor.fetchall()]

@app.get("/chapters", response_model=List[ChapterResponse])
def read_chapters(category_id: Optional[int] = None, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    if category_id:
        cursor.execute("SELECT id, category_id, source_book, chapter_number, title, start_page, end_page FROM chapters WHERE category_id = ? ORDER BY chapter_number;", (category_id,))
    else:
        cursor.execute("SELECT id, category_id, source_book, chapter_number, title, start_page, end_page FROM chapters ORDER BY source_book, chapter_number;")
    return [dict(row) for row in cursor.fetchall()]

@app.get("/exercises", response_model=List[ExerciseResponse])
def read_exercises(chapter_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id, chapter_id, exercise_number, title FROM exercises WHERE chapter_id = ? ORDER BY exercise_number;", (chapter_id,))
    return [dict(row) for row in cursor.fetchall()]

@app.get("/exercises/{exercise_id}/questions", response_model=List[QuestionResponse])
def read_exercise_questions(exercise_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    # Join exercise_questions with questions
    cursor.execute("""
    SELECT q.id, q.chapter_id, q.question_type, q.stem, q.image_path, q.difficulty_level 
    FROM questions q
    JOIN exercise_questions eq ON q.id = eq.question_id
    WHERE eq.exercise_id = ?
    ORDER BY eq.sequence_order;
    """, (exercise_id,))
    questions = [dict(row) for row in cursor.fetchall()]

    # Populate options and statements for each question
    for q in questions:
        q_id = q["id"]
        # Fetch MCQ options
        cursor.execute(
            "SELECT option_letter, option_text FROM question_options WHERE question_id = ? ORDER BY option_letter;",
            (q_id,)
        )
        q["options"] = [dict(opt) for opt in cursor.fetchall()]

        # Fetch DS statements stored as 'stmt1', 'stmt2' keys in question_answers
        cursor.execute(
            "SELECT part_key, correct_value FROM question_answers WHERE question_id = ? AND part_key LIKE 'stmt%';",
            (q_id,)
        )
        stmt_rows = cursor.fetchall()
        if stmt_rows:
            q["statements"] = {row["part_key"].replace("stmt", ""): row["correct_value"] for row in stmt_rows}
        else:
            q["statements"] = {}

    return questions

@app.get("/questions/{question_id}", response_model=QuestionResponse)
def read_question(question_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id, chapter_id, question_type, stem, image_path, difficulty_level FROM questions WHERE id = ?;", (question_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Question not found")
    
    q = dict(row)
    # Options
    cursor.execute("SELECT option_letter, option_text FROM question_options WHERE question_id = ? ORDER BY option_letter;", (question_id,))
    q["options"] = [dict(opt) for opt in cursor.fetchall()]
    q["statements"] = None
    
    return q

@app.post("/submit-answer", response_model=SubmissionResult)
def submit_answer(sub: AnswerSubmission, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # 1. Fetch correct answer and explanation
    cursor.execute("SELECT correct_value FROM question_answers WHERE question_id = ? AND part_key = 'correct';", (sub.question_id,))
    ans_row = cursor.fetchone()
    if not ans_row:
        # Fallback to general lookup
        cursor.execute("SELECT correct_value FROM question_answers WHERE question_id = ? LIMIT 1;", (sub.question_id,))
        ans_row = cursor.fetchone()
        
    cursor.execute("SELECT official_explanation FROM questions WHERE id = ?;", (sub.question_id,))
    q_row = cursor.fetchone()
    
    if not ans_row or not q_row:
        raise HTTPException(status_code=404, detail="Question answer key not seeded.")
        
    correct_ans = ans_row["correct_value"]
    official_explanation = q_row["official_explanation"]
    
    # Check correctness
    is_correct = (sub.user_answer.strip().upper() == correct_ans.strip().upper())
    
    # 2. Log attempt in user_logs
    cursor.execute("""
    INSERT INTO user_logs (question_id, exercise_id, user_answer, is_correct, time_spent_seconds, confidence_score, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    """, (sub.question_id, sub.exercise_id, sub.user_answer, is_correct, sub.time_spent_seconds, sub.confidence_score, sub.notes))
    
    db.commit()
    
    return SubmissionResult(
        is_correct=is_correct,
        correct_answer=correct_ans,
        official_explanation=official_explanation
    )

@app.post("/tutor/chat")
async def tutor_chat(req: TutorChatRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # 1. Fetch Question details and Official Explanation
    cursor.execute("""
    SELECT q.stem, q.official_explanation, c.correct_value 
    FROM questions q
    LEFT JOIN question_answers c ON q.id = c.question_id AND c.part_key = 'correct'
    WHERE q.id = ?;
    """, (req.question_id,))
    q_row = cursor.fetchone()
    
    if not q_row:
        raise HTTPException(status_code=404, detail="Question not found")
        
    stem = q_row["stem"]
    explanation = q_row["official_explanation"]
    correct_val = q_row["correct_value"] or "A"
    
    # 2. Build system instruction prompt grounded in the explanation
    system_instruction = f"""You are an elite, personal GMAT Tutor. You are grounded strictly in the provided GMAT strategy details:
- Question Stem: {stem}
- Correct Answer Choice: {correct_val}
- Official Explanation: {explanation}

CRITICAL RULES:
1. Answer the student's queries using ONLY the facts and reasoning steps explicitly written in the Official Explanation.
2. If a student asks a mathematical formula or verbal concept not present in the retrieved chunks, state clearly: "I cannot confirm this concept based on the strategy guides."
3. NEVER rewrite, simplify, or modify the wording of the question stem or official explanation.
4. Keep your explanations highly professional, concise, and focused on helping the student understand the logic of the correct answer.
"""
    
    # Construct LLM request for local Ollama service
    # We route to local Ollama running on default port 11434, utilizing the general qwen2.5:14b model
    messages = [{"role": "system", "content": system_instruction}]
    
    # Append conversation history
    for msg in req.history:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    # Append active student query
    messages.append({"role": "user", "content": req.message})
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            ollama_url = "http://localhost:11434/api/chat"
            ollama_payload = {
                "model": "qwen2.5:14b",
                "messages": messages,
                "stream": False
            }
            
            response = await client.post(ollama_url, json=ollama_payload)
            if response.status_code != 200:
                # Try fallback model if qwen2.5:14b is missing
                ollama_payload["model"] = "qwen2.5-coder:1.5b"
                response = await client.post(ollama_url, json=ollama_payload)
                
            if response.status_code != 200:
                raise HTTPException(status_code=502, detail="Local Ollama inference host returned error.")
                
            result = response.json()
            tutor_reply = result["message"]["content"]
            return {"reply": tutor_reply}
            
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Failed to connect to local Ollama inference service: {e}")

@app.get("/analytics")
def get_analytics(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Total attempts, accuracy
    cursor.execute("SELECT COUNT(*) as total_attempts, SUM(is_correct) as correct_attempts, AVG(time_spent_seconds) as avg_time FROM user_logs;")
    summary = dict(cursor.fetchone())
    
    # Performance by category
    cursor.execute("""
    SELECT cat.name as category_name, COUNT(ul.id) as attempts, SUM(ul.is_correct) as correct_attempts, AVG(ul.time_spent_seconds) as avg_time
    FROM user_logs ul
    JOIN questions q ON ul.question_id = q.id
    JOIN chapters ch ON q.chapter_id = ch.id
    JOIN categories cat ON ch.category_id = cat.id
    GROUP BY cat.name;
    """)
    categories = [dict(row) for row in cursor.fetchall()]
    
    return {
        "summary": summary,
        "categories": categories
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
