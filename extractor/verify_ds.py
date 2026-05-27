import fitz
import sys

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Quant__DI_-_Manhattan_Prep.pdf")
text = doc[107].get_text("text")
with open(r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\ch3_problem_set_text.txt", "w", encoding="utf-8") as f:
    f.write(text)
print("Saved ch3_problem_set_text.txt.")
doc.close()
