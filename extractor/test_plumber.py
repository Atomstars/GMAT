import pdfplumber

with pdfplumber.open(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Quant__DI_-_Manhattan_Prep.pdf") as pdf:
    # 0-based page index 138
    page = pdf.pages[138]
    text = page.extract_text()
    print("=== pdfplumber text ===")
    print(text[:2000])
