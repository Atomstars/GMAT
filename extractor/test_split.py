import fitz
import re

def test_split(pdf_path, ch_info, name):
    print(f"\n==================== Testing Split for {name} Ch {ch_info['chapter_number']} ====================")
    doc = fitz.open(pdf_path)
    
    # 0-based page range
    start_idx = ch_info["problem_set_page"] - 1
    end_idx = ch_info["end_page"] - 1 if ch_info["end_page"] else len(doc) - 1
    
    # Merge all page texts
    merged_text = ""
    for idx in range(start_idx, end_idx + 1):
        merged_text += doc[idx].get_text("text") + "\n--- PAGE BREAK ---\n"
        
    doc.close()
    
    # Let's find "Solutions" or "Drill Sets Solutions" header
    # We want to match "Solutions" on a line by itself (ignoring whitespace)
    pattern = r"(?mi)^\s*(?:Drill\s+Sets\s+)?Solutions\s*$"
    match = re.search(pattern, merged_text)
    if not match:
        print("Error: Could not find Solutions header!")
        return
        
    split_idx = match.start()
    ps_text = merged_text[:split_idx].strip()
    sol_text = merged_text[split_idx:].strip()
    
    print(f"Total Merged Text Length: {len(merged_text)}")
    print(f"Problem Set Text Length: {len(ps_text)}")
    print(f"Solutions Text Length: {len(sol_text)}")
    
    print("\n--- Problem Set Start (first 300 chars) ---")
    print(ps_text[:300])
    print("\n--- Problem Set End (last 300 chars) ---")
    print(ps_text[-300:])
    
    print("\n--- Solutions Start (first 300 chars) ---")
    print(sol_text[:300])
    
# Let's test on Ch 3 of Quant
ch3_quant = {
  "chapter_number": 3,
  "title": "Data Sufficiency 101",
  "start_page": 63,
  "problem_set_page": 108,
  "solutions_page": 109,
  "end_page": 113
}
test_split(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Quant__DI_-_Manhattan_Prep.pdf", ch3_quant, "Quant")
