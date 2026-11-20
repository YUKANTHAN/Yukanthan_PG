#!/usr/bin/env python3
"""
Generate DOCX from white-travels-article.md using python-docx
"""

import re
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.shared import Emu
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT


def parse_markdown_sections(md_text):
    """Parse markdown into structured sections"""
    sections = []
    current_section = {
        'title': '',
        'level': 0,
        'content': [],
        'tables': [],
        'code_blocks': [],
        'mermaid_blocks': []
    }
    in_code_block = False
    code_block_lines = []
    code_block_lang = ''
    in_mermaid_block = False
    mermaid_block_lines = []
    in_table = False
    table_lines = []

    lines = md_text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i]
        
        if line.startswith('```'):
            if not in_code_block and not in_mermaid_block:
                in_code_block = True
                code_block_lang = line[3:].strip()
            elif in_code_block:
                if code_block_lang == 'mermaid':
                    in_code_block = False
                    in_mermaid_block = True
                    mermaid_block_lines = []
                else:
                    in_code_block = False
                    in_mermaid_block = False
            elif in_mermaid_block:
                in_mermaid_block = False
            i += 1
            continue
        
        if in_code_block:
            code_block_lines.append(line)
            i += 1
            continue
            
        if in_mermaid_block:
            mermaid_block_lines.append(line)
            i += 1
            continue
        
        # Headers
        hm = re.match(r'^(#{1,6})\s+(.+)', line)
        if hm:
            if current_section['title'] or current_section['content']:
                sections.append(current_section)
            current_section = {
                'title': hm.group(2),
                'level': len(hm.group(1)),
                'content': [],
                'tables': [],
                'code_blocks': [],
                'mermaid_blocks': []
            }
            i += 1
            continue
        
        if line.strip() == '---' or line.strip() == '***':
            current_section['content'].append({'type': 'hr'})
            i += 1
            continue
        
        # Tables
        if '|' in line and line.strip().startswith('|'):
            if not in_table:
                in_table = True
                table_lines = []
            table_lines.append(line)
            i += 1
            continue
        else:
            if in_table:
                in_table = False
                current_section['tables'].append(table_lines)
                table_lines = []
        
        if line.strip():
            current_section['content'].append({'type': 'text', 'text': line})
        
        i += 1
    
    if current_section['title'] or current_section['content']:
        sections.append(current_section)
    
    return sections


def main():
    # Read markdown
    with open('white-travels-article.md', 'r', encoding='utf-8') as f:
        md = f.read()
    
    # Parse markdown
    sections = parse_markdown_sections(md)
    
    # Create document
    doc = Document()
    
    # Set default style
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)
    font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    
    # Set default paragraph formatting
    style.paragraph_format.space_before = Pt(6)
    style.paragraph_format.space_after = Pt(6)
    style.paragraph_format.line_spacing = 1.15
    
    # Set default margins for all sections
    for section in doc.sections:
        section.top_margin = Cm(2.54)  # 1 inch
        section.bottom_margin = Cm(2.54)
        section.left_margin = Cm(2.54)
        section.right_margin = Cm(2.54)
    
    # Title page
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('White Travels: Anatomy of a Production Travel Disruption Agent')
    run.bold = True
    run.font.size = Pt(26)
    run.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    p.paragraph_format.space_before = Pt(40)
    p.paragraph_format.space_after = Pt(8)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('Anatomy of a Production Travel Disruption Agent')
    run.italic = True
    run.font.size = Pt(17)
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('How we built an autonomous agent that resolves 92% of travel disruptions in under 45 seconds\u2014and the architecture patterns you can steal.')
    run.italic = True
    run.font.size = Pt(17)
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(12)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('Yukanthan P G  \u2022  AI Engineer & Full-Stack Developer  \u2022  GitHub: @yukanthan  \u2022  LinkedIn: yukanthan067')
    run.font.size = Pt(15)
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run('Technical Article  \u2022  ~1200 Words  \u2022  1-2 Pages')
    run.font.size = Pt(13)
    run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(24)
    
    # Parse markdown content
    md_content = open('white-travels-article.md', 'r', encoding='utf-8').read()
    sections = parse_markdown_sections(md)
    
    for sec in sections:
        if sec['title']:
            level = sec['level']
            if level == 1:
                heading_style = 'Heading 1'
                size = 22
            elif level == 2:
                heading_style = 'Heading 2'
                size = 20
            else:
                heading_style = 'Heading 3'
                size = 18
            
            p = doc.add_heading(sec['title'], level=min(sec['level'], 3))
            for run in doc.paragraphs[-1].runs:
                run.font.size = Pt(22 if sec['level'] == 1 else 20 if sec['level'] == 2 else 18)
                run.bold = True
            doc.paragraphs[-1].paragraph_format.space_before = Pt(24)
            doc.paragraphs[-1].paragraph_format.space_after = Pt(8)
        
        # Content
        for item in sec['content']:
            if item['type'] == 'hr':
                p = doc.add_paragraph()
                run = p.add_run('\u2500' * 70)
                run.font.color.rgb = RGBColor(0x99, 0x99, 0x99)
                run.font.size = Pt(10)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p.paragraph_format.space_before = Pt(12)
                p.paragraph_format.space_after = Pt(12)
                continue
            
            text = item['text']
            bold = False
            italic = False
            if text.startswith('**') and text.endswith('**'):
                text = text[2:-2]
                bold = True
            elif text.startswith('*') and text.endswith('*'):
                text = text[1:-1]
                italic = True
            
            p = doc.add_paragraph()
            run = p.add_run(text)
            run.bold = bold
            run.italic = italic
            run.font.size = Pt(11)
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
        
        # Tables
        for table_lines in sec['tables']:
            # Parse table
            rows = []
            for line in table_lines:
                cells = [c.strip() for c in line.split('|') if c.strip()]
                if cells:
                    rows.append(cells)
            
            if rows:
                table = doc.add_table(rows=len(rows), cols=len(rows[0]))
                table.style = 'Table Grid'
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                
                for i, row in enumerate(rows):
                    for j, cell_text in enumerate(row):
                        cell = table.rows[i].cells[j]
                        cell.text = cell_text
                        for paragraph in cell.paragraphs:
                            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                            for run in paragraph.runs:
                                run.font.size = Pt(12)
                                if i == 0:
                                    run.bold = True
            
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(12)
        
        # Code blocks
        for code_block in sec['code_blocks']:
            p = doc.add_paragraph()
            run = p.add_run(code_block['content'])
            run.font.name = 'Courier New'
            run.font.size = Pt(10)
            run.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
            p.paragraph_format.space_before = Pt(6)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.0
            shading = OxmlElement('w:shd')
            shading.set(qn('w:fill'), 'f5f5f5')
            shading.set(qn('w:val'), 'clear')
            p._p.get_or_add_pPr().append(shading)
        
        # Mermaid blocks
        for mermaid_block in sec['mermaid_blocks']:
            p = doc.add_paragraph()
            run = p.add_run('[Mermaid Diagram]')
            run.bold = True
            run.italic = True
            run.font.size = Pt(14)
            run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(6)
            
            p2 = doc.add_paragraph()
            run2 = p2.add_run(mermaid_block)
            run2.font.name = 'Courier New'
            run2.font.size = Pt(10)
            run2.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
            p2.paragraph_format.space_before = Pt(6)
            p2.paragraph_format.space_after = Pt(12)
            shading = OxmlElement('w:shd')
            shading.set(qn('w:fill'), 'f0f0f0')
            shading.set(qn('w:val'), 'clear')
            p2._p.get_or_add_pPr().append(shading)
    
    # References section
    doc.add_page_break()
    p = doc.add_heading('References', level=1)
    for run in doc.paragraphs[-1].runs:
        run.font.size = Pt(22)
        run.bold = True
    doc.paragraphs[-1].paragraph_format.space_before = Pt(24)
    doc.paragraphs[-1].paragraph_format.space_after = Pt(12)
    
    refs = [
        '1. Anthropic Engineering. "Building Effective Agents." Anthropic Engineering Blog, Dec 2024.',
        '2. LangChain Blog. "LangGraph: Multi-Agent Workflows." LangChain Blog, Jan 2024.',
        '3. LangGraph Documentation. "Multi-Agent Workflows." LangChain Documentation.',
        '4. Anthropic. "Model Context Protocol." Anthropic Documentation.'
    ]
    
    for ref in refs:
        p = doc.add_paragraph(ref)
        for run in p.runs:
            run.font.size = Pt(11)
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
    
    # Save
    doc.save('white-travels-article.docx')
    print('DOCX generated successfully!')


if __name__ == '__main__':
    main()