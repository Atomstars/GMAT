import fitz

doc = fitz.open(r"C:\Users\Akash\OneDrive\Desktop\New folder\_OceanofPDF.com_GMAT_All_the_Quant__DI_-_Manhattan_Prep.pdf")
page = doc[138]

images = page.get_images()
print(f"Total images on page: {len(images)}")
for img in images:
    print(img)
    
doc.close()
