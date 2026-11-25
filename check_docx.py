from docx import Document
doc = Document('white-travels-article.docx')
headings = [p for p in doc.paragraphs if p.style.name.startswith('Heading')]
print(f'Total headings: {len(headings)}')
for p in headings:
    print(p.style.name, p.text[:60])