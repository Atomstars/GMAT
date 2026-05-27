import fitz
import re
import os
import json
import traceback

def clean_text(text):
    if not text:
        return ""
    # Remove digital artifacts like OceanofPDF.com or footers
    text = re.sub(r"OceanofPDF\.com", "", text, flags=re.IGNORECASE)
    # Enforce standard spaces
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def crop_question_image(page, start_y, end_y, ch_num, q_num, book_type):
    try:
        # Standard GMAT page bounds in points are usually 612 x 792 (letter size)
        # Main text content is inside x=70 to x=550.
        # Let's add slight vertical padding
        padding = 5
        y0 = max(0, start_y - padding)
        y1 = min(page.rect.height, end_y + padding)
        
        # Bounding box Rect
        rect = fitz.Rect(65, y0, 550, y1)
        
        # Render high-DPI
        pix = page.get_pixmap(clip=rect, dpi=200)
        
        # Output folder
        out_dir = r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\images"
        os.makedirs(out_dir, exist_ok=True)
        
        filename = f"q_{book_type}_{ch_num}_{q_num}.png"
        filepath = os.path.join(out_dir, filename)
        
        pix.save(filepath)
        return f"images/{filename}"
    except Exception as e:
        print(f"Error cropping image for Ch {ch_num} Q {q_num}: {e}")
        return None

def parse_chapter_pipeline(pdf_path, ch_info, book_type):
    ch_num = ch_info["chapter_number"]
    ch_title = ch_info["title"]
    print(f"\n[Chapter {ch_num}: {ch_title}] Parsing...")
    
    if not ch_info["problem_set_page"] or not ch_info["solutions_page"]:
        print(f"Skipping Chapter {ch_num} (no problem set or solutions outline item).")
        return []
        
    doc = fitz.open(pdf_path)
    
    start_idx = ch_info["problem_set_page"] - 1
    end_idx = ch_info["end_page"] - 1 if ch_info["end_page"] else len(doc) - 1
    
    # We will build page-by-page mapping of text blocks to do precise coordinate crops
    page_blocks = {}
    merged_text = ""
    
    for idx in range(start_idx, end_idx + 1):
        if idx >= len(doc):
            continue
        page = doc[idx]
        blocks = page.get_text("blocks")
        # Format block coordinates for later retrieval
        page_blocks[idx] = sorted(blocks, key=lambda b: b[1]) # Sort by top y coordinate
        
        # We append page boundary marker to split cleanly later
        merged_text += f"\n--- PAGE START {idx} ---\n"
        for b in page_blocks[idx]:
            merged_text += b[4] + "\n"
            
    doc.close()
    
    # Split into Problem Set and Solutions
    pattern = r"(?mi)^\s*(?:Drill\s+Sets\s+)?Solutions\s*$"
    match = re.search(pattern, merged_text)
    if not match:
        print(f"Warning: Solutions header not found in Ch {ch_num}!")
        return []
        
    split_idx = match.start()
    ps_part = merged_text[:split_idx]
    sol_part = merged_text[split_idx:]
    
    # --- Parse Problem Set and Locate Bounding Boxes ---
    questions = {}
    current_q = None
    
    # Split by lines, keeping track of page indicators
    lines = ps_part.split('\n')
    current_page_idx = start_idx
    
    for line in lines:
        line_s = line.strip()
        if not line_s:
            continue
            
        # Track active page
        pg_match = re.match(r"^--- PAGE START (\d+) ---$", line_s)
        if pg_match:
            current_page_idx = int(pg_match.group(1))
            continue
            
        # Match question start e.g. "1."
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
                "question_type": "PS", # default
                "page_index": current_page_idx,
                "start_y": None,
                "end_y": None,
                "current_mode": "STEM"
            }
            
            # Find start y-coordinate on the active page
            if current_page_idx in page_blocks:
                for b in page_blocks[current_page_idx]:
                    if re.search(rf"^{q_num}\.\s*$", b[4].strip()):
                        current_q["start_y"] = b[1]
                        break
                if current_q["start_y"] is None:
                    # Fallback to first block containing the question number
                    for b in page_blocks[current_page_idx]:
                        if b[4].strip().startswith(f"{q_num}."):
                            current_q["start_y"] = b[1]
                            break
            continue
            
        if current_q:
            # Check for statement or option markers
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
                    
            # Update end y coordinate on the active page
            if current_page_idx in page_blocks:
                for b in page_blocks[current_page_idx]:
                    # If this block contains the current stem, statements, or options text, update end_y
                    if line_s in b[4]:
                        current_q["end_y"] = max(current_q["end_y"] or 0, b[3])
                        
    if current_q:
        questions[current_q["question_number"]] = current_q
        
    # --- Parse Solutions ---
    sol_lines = sol_part.split('\n')
    current_sol = None
    
    for line in sol_lines:
        line_s = line.strip()
        if not line_s:
            continue
            
        pg_match = re.match(r"^--- PAGE START (\d+) ---$", line_s)
        if pg_match:
            continue
            
        q_match = re.match(r"^(\d+)\.$", line_s)
        if q_match:
            q_num = int(q_match.group(1))
            if current_sol:
                if current_sol["question_number"] in questions:
                    questions[current_sol["question_number"]]["official_explanation"] = clean_text(current_sol["explanation"])
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
            questions[current_sol["question_number"]]["official_explanation"] = clean_text(current_sol["explanation"])
            questions[current_sol["question_number"]]["correct_answer"] = current_sol["correct_answer"]
            
    # Crop images and finalize objects
    doc_crop = fitz.open(pdf_path)
    for q in list(questions.values()):
        # Determine taxonomy book defaults
        if book_type == "VERBAL":
            if ch_num <= 9:
                q["question_type"] = "SC"
            elif ch_num <= 15:
                q["question_type"] = "RC"
            else:
                q["question_type"] = "CR"
        elif book_type == "QUANT":
            if ch_num == 3:
                q["question_type"] = "DS"
            elif ch_num == 8:
                q["question_type"] = "TA"
            elif ch_num == 10:
                q["question_type"] = "GI"
            elif ch_num == 18:
                q["question_type"] = "MSR"
            elif ch_num == 21:
                q["question_type"] = "TPA"
                
        # Perform image cropping
        if q["start_y"] is not None and q["page_index"] < len(doc_crop):
            page_crop = doc_crop[q["page_index"]]
            # Determine end y boundary
            # If end_y is not captured well, or is less than start_y, fallback to next question's start or page bottom
            start_y = q["start_y"]
            end_y = q["end_y"] or (start_y + 150)
            
            # Bound check
            if end_y <= start_y:
                end_y = start_y + 150
            
            # Crop page region
            q["image_path"] = crop_question_image(page_crop, start_y, end_y, ch_num, q["question_number"], book_type)
        else:
            q["image_path"] = None
            
        # Clean clean clean
        q.pop("current_mode", None)
        q.pop("page_index", None)
        q.pop("start_y", None)
        q.pop("end_y", None)
        
        q["stem"] = clean_text(q["stem"])
        
        if q["question_type"] == "MCQ" or q["question_type"] in ["SC", "CR", "RC", "TPA"]:
            q["statements"] = None
            q["options"] = {k: clean_text(v) for k, v in q["options"].items() if v}
        elif q["question_type"] == "DS":
            q["options"] = None
            q["statements"] = {k: clean_text(v) for k, v in q["statements"].items() if v}
        else:
            # Fallback
            q["options"] = {k: clean_text(v) for k, v in q["options"].items() if v}
            q["statements"] = {k: clean_text(v) for k, v in q["statements"].items() if v}
            
    doc_crop.close()
    print(f"Successfully processed {len(questions)} questions for Chapter {ch_num}.")
    return list(questions.values())

def run_extraction_all():
    print("Starting production-grade extraction pipeline...")
    
    # 1. Quant & DI Strategy Guide
    print("\n--- Processing All the Quant & DI Book ---")
    with open(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\quant_chapters.json", "r", encoding="utf-8") as f:
        quant_chapters = json.load(f)
        
    quant_extracted = []
    for ch in quant_chapters:
        try:
            res = parse_chapter_pipeline(
                r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Quant__DI_-_Manhattan_Prep.pdf",
                ch, "QUANT"
            )
            quant_extracted.extend(res)
        except Exception as e:
            print(f"FAILED parsing Quant Ch {ch['chapter_number']}: {e}")
            traceback.print_exc()
            
    with open(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\data\quant_extracted.json", "w", encoding="utf-8") as f:
        json.dump(quant_extracted, f, indent=2)
        
    # 2. Verbal Strategy Guide
    print("\n--- Processing All the Verbal Book ---")
    with open(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\verbal_chapters.json", "r", encoding="utf-8") as f:
        verbal_chapters = json.load(f)
        
    verbal_extracted = []
    for ch in verbal_chapters:
        try:
            res = parse_chapter_pipeline(
                r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Verbal_-_Manhattan_Prep.pdf",
                ch, "VERBAL"
            )
            verbal_extracted.extend(res)
        except Exception as e:
            print(f"FAILED parsing Verbal Ch {ch['chapter_number']}: {e}")
            traceback.print_exc()
            
    with open(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\data\verbal_extracted.json", "w", encoding="utf-8") as f:
        json.dump(verbal_extracted, f, indent=2)
        
    # 3. Foundations of Math Guide
    print("\n--- Processing Foundations of Math Book ---")
    with open(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\fom_chapters.json", "r", encoding="utf-8") as f:
        fom_chapters = json.load(f)
        
    fom_extracted = []
    for ch in fom_chapters:
        try:
            res = parse_chapter_pipeline(
                r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_Foundations_of_Math_-_Manhattan_Prep.pdf",
                ch, "FOM"
            )
            fom_extracted.extend(res)
        except Exception as e:
            print(f"FAILED parsing FOM Ch {ch['chapter_number']}: {e}")
            traceback.print_exc()
            
    with open(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\data\fom_extracted.json", "w", encoding="utf-8") as f:
        json.dump(fom_extracted, f, indent=2)
        
    print("\n[COMPLETE] Extraction finished successfully. Data written to extractor/data/")

if __name__ == "__main__":
    run_extraction_all()
