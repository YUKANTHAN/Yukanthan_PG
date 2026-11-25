#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate DOCX from white-travels-article.md using python-docx
Parser: split markdown by headers, then extract tables/code/mermaid from each chunk
"""

import re
from docx import Document
from docx.shared import Pt, Cm, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


def extract_tables_from_text(text):
    """Extract markdown tables from a text chunk"""
    lines = text.split('\n')
    table_lines = []
    tables = []
    current_table = []
    
    for line in lines:
        stripped = line.strip()
        # Check if line is a table row (starts and ends with |, has content cells)
        if stripped.startswith('|') and stripped.endswith('|'):
            cells = [c.strip() for c in stripped.split('|') if c.strip()]
            if len(cells) >= 2:
                # Check if it's a separator line (only dashes and colons)
                is_separator = all(
                    re.match(r'^-+:?\|?$|^-\|?$', c) for c in cells
                )
                if not is_separator:
                    current_table.append(stripped)
                elif current_table:
                    # Previous table ended
                    if len(current_table) >= 2:
                        tables.append(current_table)
                    current_table = []
            else:
                if current_table:
                    if len(current_table) >= 2:
                        tables.append(current_table)
                    current_table = []
        else:
            # Non-pipe line - if we have an accumulated table, save it
            if current_table:
                if len(current_table) >= 2:
                    tables.append(current_table)
                current_table = []
    
    # Save last table
    if current_table and len(current_table) >= 2:
        tables.append(current_table)
    
    # Convert table lines to rows of cell texts
    result = []
    for tbl in tables:
        rows = []
        for line in tbl:
            cells = [c.strip() for c in line.split('|') if c.strip()]
            rows.append(cells)
        result.append(rows)
    
    return result


def extract_code_blocks_from_text(text):
    """Extract mermaid and code blocks from text"""
    lines = text.split('\n')
    code_blocks = []
    mermaid_blocks = []
    in_code = False
    code_lang = ''
    code_lines = []
    mermaid_lines = []
    
    for line in lines:
        if line.startswith('```'):
            if not in_code and not mermaid_lines:
                in_code = True
                code_lang = line[3:].strip()
                code_lines = []
                if code_lang == 'mermaid':
                    # Mermaid block
                    pass
            elif in_code:
                if code_lang == 'mermaid':
                    mermaid_blocks.append(''.join(code_lines))
                else:
                    code_blocks.append(''.join(code_lines))
                in_code = False
                code_lines = []
        elif in_code or (code_lang == 'mermaid' and line.strip()):
            if in_code:
                code_lines.append(line)
            elif code_lang == 'mermaid':
                mermaid_lines.append(line)
    
    # Handle case where mermaid block extends to end of text
    if code_lang == 'mermaid' and code_lines:
        mermaid_blocks.append(''.join(code_lines))
    
    return mermaid_blocks, code_blocks


def parse_markdown_by_chunks(md_text):
    """Parse markdown by splitting on headers, then processing each chunk"""
    lines = md_text.split('\n')
    
    # First, split into chunks separated by headers
    chunks = []
    current_chunk = []
    current_header = None
    
    for line in lines:
        hm = re.match(r'^(#{1,6})\s+(.+)$', line)
        if hm:
            # Save previous chunk if it has content
            if current_chunk and (current_header or any(l.strip() for l in current_chunk)):
                chunks.append((current_header, '\n'.join(current_chunk)))
            current_header = hm.group(2)
            current_level = len(hm.group(1))
            current_chunk = [line]  # Include the header line
        else:
            current_chunk.append(line)
    
    # Save last chunk
    if current_chunk and (current_header or any(l.strip() for l in current_chunk)):
        chunks.append((current_header, '\n'.join(current_chunk)))
    
    # Process each chunk
    sections = []
    for header, chunk_text in chunks:
        if not header:
            continue
        
        # Extract tables from this chunk
        table_rows = extract_tables_from_text(chunk_text)
        
        # Extract code/mermaid blocks
        mermaid_blocks, code_blocks = extract_code_blocks_from_text(chunk_text)
        
        # Get remaining text (remove table lines, code block markers, etc.)
        # Simple approach: just take all lines that aren't tables or code blocks
        lines = chunk_text.split('\n')
        item_lines = []
        for line in lines:
            stripped = line.strip()
            # Skip table lines
            if stripped.startswith('|') and stripped.endswith('|'):
                continue
            # Skip code block markers
            if line.startswith('```'):
                continue
            # Skip HR
            if re.match(r'^(---|\*\*\*|\___)$', stripped):
                item_lines.append('HR')
                continue
            # Skip empty lines
            if not stripped:
                continue
            item_lines.append(stripped)
        
        # Clean up: remove leading/trailing whitespace from each line
        item_lines = [l.strip() for l in item_lines if l.strip()]
        
        # Remove consecutive HR markers (keep only one)
        cleaned_lines = []
        prev_was_hr = False
        for l in item_lines:
            if l == 'HR':
                if not prev_was_hr:
                    cleaned_lines.append(l)
                prev_was_hr = True
            else:
                cleaned_lines.append(l)
                prev_was_hr = False
        
        # For bold text (**text**), we'll handle it during DOCX generation
        # For now, just store the text as-is
        
        sections.append({
            'title': header,
            'level': min(current_level if 'current_level' in dir() else 1, 3),
            'items': cleaned_lines,
            'tables': table_rows,
            'code_blocks': code_blocks,
            'mermaid_blocks': mermaid_blocks
        })
    
    return sections


def add_heading(doc, text, size=22, before=24, after=8):
    p = doc.add_heading(text, level=min(3, 1 if size >= 22 else 2))
    for run in p.runs:
        run.font.size = Pt(size)
        run.bold = True
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)


def add_para(doc, text, bold=False, italic=False, size=11, before=6, after=6):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.size = Pt(size)
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)


def add_table(doc, table_rows):
    if not table_rows:
        return
    
    ncols = max(len(r) for r in table_rows)
    table = doc.add_table(rows=len(table_rows), cols=ncols)
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    for i, row_data in enumerate(table_rows):
        while len(row_data) < ncols:
            row_data.append('')
        for j, cell_text in enumerate(row_data):
            cell = table.rows[i].cells[j]
            cell.text = cell_text
            for paragraph in cell.paragraphs:
                paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                for run in paragraph.runs:
                    run.font.size = Pt(10)
                    if i == 0:
                        run.bold = True


def add_code_block(doc, code_text):
    p = doc.add_paragraph()
    run = p.add_run(code_text)
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


def add_mermaid(doc, mermaid_text):
    p = doc.add_paragraph()
    run = p.add_run('[Mermaid Diagram]')
    run.bold = True
    run.italic = True
    run.font.size = Pt(14)
    run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)
    
    p2 = doc.add_paragraph()
    run2 = p2.add_run(mermaid_text)
    run2.font.name = 'Courier New'
    run2.font.size = Pt(10)
    run2.font.color.rgb = RGBColor(0x66, 0x66, 0x66)
    p2.paragraph_format.space_before = Pt(6)
    p2.paragraph_format.space_after = Pt(12)
    shading = OxmlElement('w:shd')
    shading.set(qn('w:fill'), 'f0f0f0')
    shading.set(qn('w:val'), 'clear')
    p2._p.get_or_add_pPr().append(shading)


def main():
    # Read markdown
    with open('white-travels-article.md', 'r', encoding='utf-8') as f:
        md = f.read()
    
    # Parse markdown by chunks
    sections = parse_markdown_by_chunks(md)
    
    # Create document
    doc = Document()
    
    # Set default style
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)
    font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    style.paragraph_format.space_before = Pt(6)
    style.paragraph_format.space_after = Pt(6)
    style.paragraph_format.line_spacing = 1.15
    
    # Margins
    for section in doc.sections:
        section.top_margin = Cm(2.54)
        section.bottom_margin = Cm(2.54)
        section.left_margin = Cm(2.54)
        section.right_margin = Cm(2.54)
    
    # Title page
    p = doc.add_heading('White Travels: Anatomy of a Production Travel Disruption Agent', level=1)
    for run in doc.paragraphs[0].runs:
        run.font.size = Pt(26)
        run.bold = True
    p.paragraph_format.space_before = Pt(40)
    p.paragraph_format.space_after = Pt(8)
    
    p = doc.add_heading('Anatomy of a Production Travel Disruption Agent', level=2)
    for run in doc.paragraphs[-1].runs:
        run.italic = True
        run.font.size = Pt(17)
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    
    p = doc.add_heading('How we built an autonomous agent that resolves 92% of travel disruptions in under 45 seconds\u2014and the architecture patterns you can steal.', level=2)
    for run in doc.paragraphs[-1].runs:
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
    
    # Process each section
    for sec in sections:
        title = sec['title']
        level = sec['level']
        items = sec.get('items', [])
        tables = sec.get('tables', [])
        code_blocks = sec.get('code_blocks', [])
        mermaid_blocks = sec.get('mermaid_blocks', [])
        
        if not title:
            continue
        
        # Heading size
        if level == 1:
            sz = 22
        elif level == 2:
            sz = 20
        else:
            sz = 18
        
        add_heading(doc, title, size=sz, before=24, after=8)
        
        # Text content
        for text in items:
            # Check for bold **text**
            if text.startswith('**') and text.endswith('**'):
                t = text[2:-2]
                add_para(doc, t, bold=True, italic=False, size=11, before=6, after=6)
            elif text.startswith('*') and text.endswith('*'):
                t = text[1:-1]
                add_para(doc, t, bold=False, italic=True, size=11, before=6, after=6)
            else:
                add_para(doc, text, bold=False, italic=False, size=11, before=6, after=6)
        
        # Tables
        for tbl_rows in tables:
            add_table(doc, tbl_rows)
        
        # Code blocks
        for cb in code_blocks:
            add_code_block(doc, cb)
        
        # Mermaid blocks
        for mb in mermaid_blocks:
            add_mermaid(doc, mb)
    
    # References
    doc.add_page_break()
    add_heading(doc, 'References', size=22, before=24, after=12)
    
    refs = [
        '1. Anthropic Engineering. "Building Effective Agents." Anthropic Engineering Blog, Dec 2024.',
        '2. LangChain Blog. "LangGraph: Multi-Agent Workflows." LangChain Blog, Jan 2024.',
        '3. LangGraph Documentation. "Multi-Agent Workflows." LangChain Documentation.',
        '4. Anthropic. "Model Context Protocol." Anthropic Documentation.'
    ]
    
    for ref in refs:
        add_para(doc, ref, size=11, before=4, after=4)
    
    # Save
    doc.save('white-travels-article.docx')
    print('DOCX generated successfully!')


if __name__ == '__main__':
    main()