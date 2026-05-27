import json
import re

def parse_toc_file(toc_path, book_type):
    chapters = []
    
    with open(toc_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    current_chapter = None
    
    for idx, line in enumerate(lines):
        parts = line.strip().split(' | ')
        if len(parts) != 3:
            continue
        level = int(parts[0])
        title = parts[1]
        page = int(parts[2])
        
        # Check if it is a chapter header
        # Patterns: 
        # "Chapter 1. How Quant and DI Work"
        # "Chapter 1: Arithmetic"
        # "Chapter 1: The Sentence Correction Process"
        ch_match = re.search(r"Chapter\s+(\d+)[\.:]\s*(.*)", title, re.IGNORECASE)
        if ch_match:
            ch_num = int(ch_match.group(1))
            ch_title = ch_match.group(2).strip()
            
            if current_chapter:
                # Close previous chapter's end page before opening new one
                current_chapter["end_page"] = page - 1
                chapters.append(current_chapter)
                
            current_chapter = {
                "chapter_number": ch_num,
                "title": ch_title,
                "start_page": page,
                "problem_set_page": None,
                "solutions_page": None,
                "end_page": None
            }
        
        # If we have an active chapter, check for Problem Set or Solutions
        elif current_chapter:
            if "problem set" in title.lower() or "chapter review: drill sets" in title.lower():
                current_chapter["problem_set_page"] = page
            elif "solutions" in title.lower() or "drill sets solutions" in title.lower():
                current_chapter["solutions_page"] = page
                
    if current_chapter:
        # For the last chapter, end page will be the end of the document or next major section.
        # We can close it at the end of the document (which we will handle during extraction).
        chapters.append(current_chapter)
        
    return chapters

quant_chapters = parse_toc_file(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\quant_toc.txt", "QUANT")
verbal_chapters = parse_toc_file(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\verbal_toc.txt", "VERBAL")
fom_chapters = parse_toc_file(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\fom_toc.txt", "FOM")

print(f"Parsed {len(quant_chapters)} chapters from Quant & DI Strategy Guide:")
for c in quant_chapters[:5]:
    print(c)

print(f"\nParsed {len(verbal_chapters)} chapters from Verbal Strategy Guide:")
for c in verbal_chapters[:5]:
    print(c)

print(f"\nParsed {len(fom_chapters)} chapters from Foundations of Math Strategy Guide:")
for c in fom_chapters[:5]:
    print(c)

# Save the parsed chapters mappings as JSON files
with open(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\quant_chapters.json", "w", encoding="utf-8") as f:
    json.dump(quant_chapters, f, indent=2)
with open(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\verbal_chapters.json", "w", encoding="utf-8") as f:
    json.dump(verbal_chapters, f, indent=2)
with open(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\fom_chapters.json", "w", encoding="utf-8") as f:
    json.dump(fom_chapters, f, indent=2)

print("\nSaved JSON chapter maps successfully.")
