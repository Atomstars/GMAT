import fitz
import re
import json

def extract_chapter_data(pdf_path, ch_info):
    doc = fitz.open(pdf_path)
    
    # 0-based page range
    start_idx = ch_info["problem_set_page"] - 1
    end_idx = ch_info["end_page"] - 1 if ch_info["end_page"] else len(doc) - 1
    
    # Merge pages
    merged_text = ""
    for idx in range(start_idx, end_idx + 1):
        merged_text += doc[idx].get_text("text") + "\n"
        
    doc.close()
    
    # Split into Problem Set and Solutions
    pattern = r"(?mi)^\s*(?:Drill\s+Sets\s+)?Solutions\s*$"
    match = re.search(pattern, merged_text)
    if not match:
        print("Error: Solutions header not found!")
        return None
        
    split_idx = match.start()
    ps_text = merged_text[:split_idx].strip()
    sol_text = merged_text[split_idx:].strip()
    
    # --- Parse Problem Set ---
    questions = {}
    current_q = None
    lines = ps_text.split('\n')
    
    for line in lines:
        line_s = line.strip()
        if not line_s:
            continue
            
        # Check if new question
        q_match = re.match(r"^(\d+)\.$", line_s)
        if q_match:
            q_num = int(q_match.group(1))
            if current_q:
                questions[current_q["question_number"]] = current_q
            current_q = {
                "question_number": q_num,
                "stem": "",
                "statements": {"1": "", "2": ""},
                "options": {"A": "", "B": "", "C": "", "D": "", "E": ""},
                "question_type": "PS", # Default
                "current_mode": "STEM"
            }
            continue
            
        if current_q:
            # Check for statement or option markers
            # Matches (1), (2), (A), (B), (C), (D), (E)
            marker_match = re.match(r"^\(([12A-E])\)(.*)$", line_s)
            if marker_match:
                key = marker_match.group(1)
                val = marker_match.group(2).strip()
                if key in ["1", "2"]:
                    current_q["question_type"] = "DS"
                    current_q["current_mode"] = f"STMT_{key}"
                    if val:
                        current_q["statements"][key] = val
                else:
                    current_q["question_type"] = "MCQ"
                    current_q["current_mode"] = f"OPT_{key}"
                    if val:
                        current_q["options"][key] = val
            else:
                # Append to current active buffer
                mode = current_q["current_mode"]
                if mode == "STEM":
                    current_q["stem"] = (current_q["stem"] + " " + line_s).strip()
                elif mode.startswith("STMT_"):
                    k = mode.split("_")[1]
                    current_q["statements"][k] = (current_q["statements"][k] + " " + line_s).strip()
                elif mode.startswith("OPT_"):
                    k = mode.split("_")[1]
                    current_q["options"][k] = (current_q["options"][k] + " " + line_s).strip()
                    
    if current_q:
        questions[current_q["question_number"]] = current_q
        
    # --- Parse Solutions ---
    sol_lines = sol_text.split('\n')
    current_sol = None
    
    for line in sol_lines:
        line_s = line.strip()
        if not line_s:
            continue
            
        # Check if solutions header or question
        q_match = re.match(r"^(\d+)\.$", line_s)
        if q_match:
            q_num = int(q_match.group(1))
            if current_sol:
                # Save previous solution
                if current_sol["question_number"] in questions:
                    questions[current_sol["question_number"]]["official_explanation"] = current_sol["explanation"]
                    questions[current_sol["question_number"]]["correct_answer"] = current_sol["correct_answer"]
            current_sol = {
                "question_number": q_num,
                "explanation": "",
                "correct_answer": None,
                "is_first_line": True
            }
            continue
            
        if current_sol:
            if current_sol["is_first_line"]:
                current_sol["is_first_line"] = False
                # Check if it starts with answer letter in parentheses like (C): or (B) 43: or (D)
                ans_match = re.match(r"^\(([A-E])\)\s*[:\s]*-?\s*(.*)$", line_s)
                if ans_match:
                    current_sol["correct_answer"] = ans_match.group(1)
                    rem = ans_match.group(2).strip()
                    if rem:
                        current_sol["explanation"] = rem
                else:
                    current_sol["explanation"] = line_s
            else:
                current_sol["explanation"] = (current_sol["explanation"] + " " + line_s).strip()
                
    if current_sol:
        if current_sol["question_number"] in questions:
            questions[current_sol["question_number"]]["official_explanation"] = current_sol["explanation"]
            questions[current_sol["question_number"]]["correct_answer"] = current_sol["correct_answer"]
            
    # Clean up parser metadata
    for q in questions.values():
        q.pop("current_mode", None)
        # Clean statements and options if empty
        if q["question_type"] == "MCQ":
            q["statements"] = None
            # remove empty options
            q["options"] = {k: v for k, v in q["options"].items() if v}
        elif q["question_type"] == "DS":
            q["options"] = None
        else:
            q["options"] = None
            q["statements"] = None
            
    return list(questions.values())

# Let's test on Ch 4 (MCQ) of Quant
ch4_quant = {
  "chapter_number": 4,
  "title": "Fractions and Ratios",
  "start_page": 114,
  "problem_set_page": 138,
  "solutions_page": 140,
  "end_page": 146
}
ch4_data = extract_chapter_data(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Quant__DI_-_Manhattan_Prep.pdf", ch4_quant)

print(f"Extracted {len(ch4_data)} questions from Chapter 4:")
print("\n--- Example Question 10 (MCQ) ---")
print(json.dumps([q for q in ch4_data if q["question_number"] == 10][0], indent=2))

print("\n--- Example Question 11 (MCQ) ---")
print(json.dumps([q for q in ch4_data if q["question_number"] == 11][0], indent=2))

# Let's test on Ch 3 (DS) of Quant
ch3_quant = {
  "chapter_number": 3,
  "title": "Data Sufficiency 101",
  "start_page": 63,
  "problem_set_page": 108,
  "solutions_page": 109,
  "end_page": 113
}
ch3_data = extract_chapter_data(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Quant__DI_-_Manhattan_Prep.pdf", ch3_quant)

print(f"\nExtracted {len(ch3_data)} questions from Chapter 3:")
print("\n--- Example Question 2 (DS) ---")
print(json.dumps([q for q in ch3_data if q["question_number"] == 2][0], indent=2))
