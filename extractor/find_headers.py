import fitz
import re

doc = fitz.open(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Quant__DI_-_Manhattan_Prep.pdf")

for idx in range(47, 65):
    text = doc[idx].get_text("text")
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    print(f"\n--- Index {idx} (1-based page {idx+1}) ---")
    for line in lines:
        if "problem set" in line.lower() or "solutions" in line.lower() or re.match(r"^\d+\.", line):
            print(f"MATCH: {line}")
doc.close()
