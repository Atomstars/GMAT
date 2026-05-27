import fitz
import sys

def explore_pdf(pdf_path, name):
    print(f"\n==================== Exploring {name} ====================")
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"Error opening {pdf_path}: {e}")
        return
    
    print(f"Total Pages: {len(doc)}")
    
    # Extract Outline / TOC
    toc = doc.get_toc()
    print(f"TOC Size: {len(toc)}")
    print("First 20 TOC items:")
    for item in toc[:20]:
        print(item)
    
    # Find any page containing "Problem Set" or "Solutions" to see the layout
    print("\nSearching for Problem Set and Solutions pages...")
    ps_pages = []
    sol_pages = []
    for page_num in range(len(doc)):
        # Inspect page text quickly
        text = doc[page_num].get_text("text")
        if "Problem Set" in text:
            ps_pages.append((page_num, text[:200].replace('\n', ' ')))
            if len(ps_pages) >= 5:
                break
                
    for page_num in range(len(doc)):
        text = doc[page_num].get_text("text")
        if "Solutions" in text:
            sol_pages.append((page_num, text[:200].replace('\n', ' ')))
            if len(sol_pages) >= 5:
                break
                
    print(f"Found Problem Set pages: {ps_pages}")
    print(f"Found Solutions pages: {sol_pages}")
    
    doc.close()

explore_pdf(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Quant__DI_-_Manhattan_Prep.pdf", "All the Quant & DI")
explore_pdf(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Verbal_-_Manhattan_Prep.pdf", "All the Verbal")
explore_pdf(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_Foundations_of_Math_-_Manhattan_Prep.pdf", "Foundations of Math")
