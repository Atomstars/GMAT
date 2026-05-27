import sqlite3
import json
import os

DB_PATH = r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\backend\gmat_prep.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def create_schema():
    print("Creating SQLite database schema...")
    conn = get_connection()
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # 1. Sections
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    );
    """)
    
    # 2. Categories
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
        UNIQUE(section_id, name)
    );
    """)
    
    # 3. Chapters
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        source_book TEXT NOT NULL, -- 'VERBAL', 'QUANT', 'FOM'
        chapter_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        start_page INTEGER,
        end_page INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE(category_id, chapter_number, source_book)
    );
    """)
    
    # 4. Passages (for Reading Comprehension passages or MSR texts)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS passages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id INTEGER,
        title TEXT,
        content TEXT NOT NULL,
        type TEXT NOT NULL, -- 'READING_COMP', 'MULTI_SOURCE_TABS', 'TABLE_DATA'
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL
    );
    """)
    
    # 5. Questions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id INTEGER,
        passage_id INTEGER,
        question_type TEXT NOT NULL, -- 'SC', 'CR', 'RC', 'PS', 'DS', 'TA', 'GI', 'MSR', 'TPA'
        stem TEXT NOT NULL,
        image_path TEXT, -- Bounding box cropped image relative path
        difficulty_level TEXT DEFAULT 'MEDIUM',
        official_explanation TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE SET NULL,
        FOREIGN KEY (passage_id) REFERENCES passages(id) ON DELETE SET NULL
    );
    """)
    
    # 6. Question Answers
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS question_answers (
        question_id INTEGER NOT NULL,
        part_key TEXT NOT NULL, -- 'A', 'B', 'C', 'D', 'E', '1', '2'
        correct_value TEXT NOT NULL, -- The correct answer key or text
        PRIMARY KEY (question_id, part_key),
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
    """)
    
    # 7. Question Options
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS question_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        option_letter TEXT NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
        option_text TEXT NOT NULL,
        UNIQUE(question_id, option_letter),
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
    """)
    
    # 8. Exercises
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id INTEGER NOT NULL,
        exercise_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        UNIQUE(chapter_id, exercise_number),
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    );
    """)
    
    # 9. Exercise Questions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exercise_questions (
        exercise_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        sequence_order INTEGER NOT NULL,
        PRIMARY KEY (exercise_id, question_id),
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
    """)
    
    # 10. User logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        exercise_id INTEGER,
        user_answer TEXT NOT NULL, -- JSON string mapping answers
        is_correct BOOLEAN NOT NULL,
        time_spent_seconds INTEGER NOT NULL,
        confidence_score INTEGER,
        notes TEXT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL
    );
    """)
    
    conn.commit()
    conn.close()
    print("Schema created successfully.")

def seed_sections_and_categories(cursor):
    # Insert sections
    sections = [("Verbal",), ("Quant",), ("Data Insights",)]
    cursor.executemany("INSERT OR IGNORE INTO sections (name) VALUES (?);", sections)
    
    # Get section IDs
    cursor.execute("SELECT id, name FROM sections;")
    section_map = {row["name"]: row["id"] for row in cursor.fetchall()}
    
    # Insert categories
    categories = [
        # Verbal Section
        (section_map["Verbal"], "Sentence Correction"),
        (section_map["Verbal"], "Reading Comprehension"),
        (section_map["Verbal"], "Critical Reasoning"),
        # Quant Section
        (section_map["Quant"], "Foundations of Math"),
        (section_map["Quant"], "Arithmetic & Fractions"),
        (section_map["Quant"], "Quant Strategies"),
        (section_map["Quant"], "Algebra"),
        (section_map["Quant"], "Word Problems & Advanced Math"),
        # Data Insights Section
        (section_map["Data Insights"], "Data Insights")
    ]
    cursor.executemany("INSERT OR IGNORE INTO categories (section_id, name) VALUES (?, ?);", categories)

def get_category_id(cursor, book_type, ch_num):
    # Retrieve categories and sections map
    cursor.execute("""
    SELECT c.id, c.name, s.name as section_name 
    FROM categories c 
    JOIN sections s ON c.section_id = s.id
    """)
    rows = cursor.fetchall()
    
    cat_map = {}
    for r in rows:
        cat_map[r["name"]] = r["id"]
        
    if book_type == "VERBAL":
        if ch_num <= 9:
            return cat_map["Sentence Correction"]
        elif ch_num <= 15:
            return cat_map["Reading Comprehension"]
        else:
            return cat_map["Critical Reasoning"]
            
    elif book_type == "QUANT":
        if ch_num in [2, 4, 6, 9]:
            return cat_map["Arithmetic & Fractions"]
        elif ch_num == 3:
            return cat_map["Word Problems & Advanced Math"] # Data Sufficiency belongs to Quant
        elif ch_num in [5, 7, 24]:
            return cat_map["Quant Strategies"]
        elif ch_num in [8, 10, 18, 21]:
            return cat_map["Data Insights"]
        elif ch_num in [11, 12, 13, 14, 15, 16]:
            return cat_map["Algebra"]
        else:
            return cat_map["Word Problems & Advanced Math"]
            
    elif book_type == "FOM":
        return cat_map["Foundations of Math"]
        
    return None

def seed_extracted_book(conn, json_path, chapters_json_path, book_type):
    if not os.path.exists(json_path):
        print(f"Skipping {book_type} (file {json_path} not found).")
        return
        
    print(f"Seeding {book_type} questions from {json_path}...")
    with open(json_path, "r", encoding="utf-8") as f:
        questions_list = json.load(f)
        
    with open(chapters_json_path, "r", encoding="utf-8") as f:
        chapters_list = json.load(f)
        
    cursor = conn.cursor()
    
    # 1. Seed Chapters first
    for ch in chapters_list:
        cat_id = get_category_id(cursor, book_type, ch["chapter_number"])
        if not cat_id:
            continue
        cursor.execute("""
        INSERT OR IGNORE INTO chapters (category_id, source_book, chapter_number, title, start_page, end_page)
        VALUES (?, ?, ?, ?, ?, ?);
        """, (cat_id, book_type, ch["chapter_number"], ch["title"], ch["start_page"], ch["end_page"]))
        
    # Get chapter mapper
    cursor.execute("SELECT id, chapter_number, source_book FROM chapters;")
    ch_map = {(row["chapter_number"], row["source_book"]): row["id"] for row in cursor.fetchall()}
    
    # 2. Seed Questions
    # Keep track of exercises per chapter to insert them neatly
    ch_questions = {}
    
    for q in questions_list:
        ch_id = ch_map.get((q["question_number"], book_type))
        # Wait, the question JSON has question_number, stem, options, statements, etc.
        # But we need to map to the correct chapter.
        # Let's map it based on the image_path filename or look it up:
        # Image path format: "images/q_{book_type}_{ch_num}_{q_num}.png"
        ch_num = 1
        if q.get("image_path"):
            parts = q["image_path"].split("_")
            if len(parts) >= 4:
                ch_num = int(parts[2])
        else:
            # Fallback
            ch_num = 1
            
        ch_id = ch_map.get((ch_num, book_type))
        if not ch_id:
            continue
            
        # Insert Question
        cursor.execute("""
        INSERT INTO questions (chapter_id, question_type, stem, image_path, difficulty_level, official_explanation)
        VALUES (?, ?, ?, ?, ?, ?);
        """, (ch_id, q["question_type"], q["stem"], q["image_path"], "MEDIUM", q.get("official_explanation", "")))
        
        q_id = cursor.lastrowid
        
        # Track for exercise mapping
        if ch_id not in ch_questions:
            ch_questions[ch_id] = []
        ch_questions[ch_id].append(q_id)
        
        # Insert Options
        if q.get("options"):
            for opt_letter, opt_text in q["options"].items():
                cursor.execute("""
                INSERT OR IGNORE INTO question_options (question_id, option_letter, option_text)
                VALUES (?, ?, ?);
                """, (q_id, opt_letter, opt_text))
                
        # Insert Answer Key
        correct_ans = q.get("correct_answer")
        if correct_ans:
            # If multi-part (like TPA or Yes/No matrices), we seed them.
            # For standard MCQ, part_key is just 'A' or correct letter
            cursor.execute("""
            INSERT OR IGNORE INTO question_answers (question_id, part_key, correct_value)
            VALUES (?, ?, ?);
            """, (q_id, "correct", correct_ans))
            
    # 3. Seed Exercises (1 exercise per chapter containing all questions)
    for ch_id, q_ids in ch_questions.items():
        cursor.execute("SELECT chapter_number, title FROM chapters WHERE id = ?;", (ch_id,))
        ch_row = cursor.fetchone()
        ch_num = ch_row["chapter_number"]
        ch_title = ch_row["title"]
        
        cursor.execute("""
        INSERT OR IGNORE INTO exercises (chapter_id, exercise_number, title)
        VALUES (?, ?, ?);
        """, (ch_id, 1, f"Chapter {ch_num} Problem Set Drill"))
        
        ex_id = cursor.lastrowid
        
        for idx, q_id in enumerate(sorted(q_ids)):
            cursor.execute("""
            INSERT OR IGNORE INTO exercise_questions (exercise_id, question_id, sequence_order)
            VALUES (?, ?, ?);
            """, (ex_id, q_id, idx + 1))
            
    conn.commit()
    print(f"Successfully seeded {book_type} guide.")

def seed_all():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Initialize sections & categories
    seed_sections_and_categories(cursor)
    conn.commit()
    
    # Seed books
    seed_extracted_book(
        conn,
        r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\data\quant_extracted.json",
        r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\quant_chapters.json",
        "QUANT"
    )
    seed_extracted_book(
        conn,
        r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\data\verbal_extracted.json",
        r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\verbal_chapters.json",
        "VERBAL"
    )
    seed_extracted_book(
        conn,
        r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\data\fom_extracted.json",
        r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\fom_chapters.json",
        "FOM"
    )
    
    conn.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    create_schema()
    seed_all()
