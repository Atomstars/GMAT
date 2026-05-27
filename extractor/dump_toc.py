import fitz

def dump_toc(pdf_path, txt_path):
    print(f"Dumping TOC for {pdf_path} to {txt_path}...")
    try:
        doc = fitz.open(pdf_path)
        toc = doc.get_toc()
        with open(txt_path, 'w', encoding='utf-8') as f:
            for item in toc:
                # item format: [level, title, page_number]
                f.write(f"{item[0]} | {item[1]} | {item[2]}\n")
        print(f"Successfully dumped {len(toc)} TOC items.")
        doc.close()
    except Exception as e:
        print(f"Error: {e}")

dump_toc(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Quant__DI_-_Manhattan_Prep.pdf", r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\quant_toc.txt")
dump_toc(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Verbal_-_Manhattan_Prep.pdf", r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\verbal_toc.txt")
dump_toc(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_Foundations_of_Math_-_Manhattan_Prep.pdf", r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\fom_toc.txt")
