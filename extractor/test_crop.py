import fitz

doc = fitz.open(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Quant__DI_-_Manhattan_Prep.pdf")
page = doc[138]

# Bounding box of Question 10 based on our inspection:
# Block 7 (stem) starts at y=338.0, x=77.0
# Block 10 (option C) ends at y=433.7, x=137.0
# Let's crop Rect(x0=70, y0=330, x1=550, y1=440)
rect = fitz.Rect(70, 330, 550, 440)

# Render to high-DPI pixmap
pix = page.get_pixmap(clip=rect, dpi=200)
output_path = r"C:\Users\Akash\OneDrive\Desktop\gmat-prep-system\extractor\images\q10_crop.png"
pix.save(output_path)
print(f"Saved crop to {output_path}")

doc.close()
