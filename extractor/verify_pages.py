import fitz
import sys

# Reconfigure stdout to use UTF-8 to prevent encoding errors on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Quant__DI_-_Manhattan_Prep.pdf")
toc = doc.get_toc()

# Let's find "Chapter 2. Math Fundamentals" and "Problem Set" in the TOC
print("TOC items for Chapter 2:")
for item in toc:
    if "Chapter 2" in item[1] or ("Problem Set" in item[1] and item[2] < 70) or ("Solutions" in item[1] and item[2] < 70):
        print(item)

# Let's print the first 400 characters of text from PDF page index 55 to 65
for idx in range(54, 65):
    if idx < len(doc):
        text = doc[idx].get_text("text").replace('\n', ' ')
        print(f"\n--- PDF Page Index {idx} (1-based: {idx+1}, outline page: {idx+1}) ---")
        print(text[:300])

doc.close()
