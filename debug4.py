import re

with open('white-travels-article.md', 'r', encoding='utf-8') as f:
    md = f.read()

lines = md.split('\n')

sections = []
current_title = None
current_level = 0
current_items = []
table_sections = []
code_blocks = []
mermaid_blocks = []
in_code = False
code_lang = ''
in_mermaid = False
code_lines = []
mermaid_lines = []

def save_section():
    global current_title, current_level, current_items, table_sections
    global code_blocks, mermaid_blocks
    
    if current_title:
        processed_tables = []
        for tbl in table_sections:
            rows = []
            for line in tbl:
                cells = [c.strip() for c in line.split('|') if c.strip()]
                if cells:
                    rows.append(cells)
            if len(rows) >= 2:
                processed_tables.append(rows)
        
        cleaned_items = []
        for item in current_items:
            if item == 'HR':
                continue
            stripped = item.strip()
            if stripped:
                cleaned_items.append(stripped)
        
        sections.append({
            'title': current_title,
            'level': current_level,
            'items': cleaned_items,
            'tables': processed_tables,
            'code_blocks': code_blocks,
            'mermaid_blocks': mermaid_blocks
        })
    
    current_title = None
    current_level = 0
    current_items = []
    table_sections = []
    code_blocks = []
    mermaid_blocks = []

for i, line in enumerate(lines):
    # Code blocks
    if line.startswith('```'):
        if not in_code and not in_mermaid:
            in_code = True
            code_lang = line[3:].strip()
            code_lines = []
            if code_lang == 'mermaid':
                in_mermaid = True
        elif in_code:
            if code_lang == 'mermaid':
                in_mermaid = False
                mermaid_blocks.append(''.join(code_lines))
            else:
                in_code = False
                code_blocks.append(''.join(code_lines))
        continue
    
    if in_code or in_mermaid:
        if line.strip():
            if in_code:
                code_lines.append(line)
            elif in_mermaid:
                mermaid_lines.append(line)
        continue
    
    # HR
    if re.match(r'^(---|\*\*\*|\___)$', line.strip()):
        current_items.append('HR')
        continue
    
    # Headers
    hm = re.match(r'^(#{1,6})\s+(.+)$', line)
    if hm:
        save_section()
        current_title = hm.group(2)
        current_level = len(hm.group(1))
        current_items = []
        table_sections = []
        code_blocks = []
        mermaid_blocks = []
        continue
    
    # Tables
    stripped = line.strip()
    cells = [c.strip() for c in stripped.split('|') if c.strip()]
    is_table_data = (stripped.startswith('|') and stripped.endswith('|') and 
                    len(cells) >= 2 and 
                    not re.match(r'^\|*-+:?\|\|?$', stripped))
    
    if is_table_data:
        table_sections.append(stripped)
        continue
    
    # Flush tables when non-table line comes
    if table_sections and current_title:
        processed = []
        for tbl in table_sections:
            rows = []
            for line in tbl:
                cells = [c.strip() for c in line.split('|') if c.strip()]
                if cells:
                    rows.append(cells)
            if len(rows) >= 2:
                processed.append(rows)
        if processed:
            pass
        table_sections = []
    
    # Text
    if stripped:
        current_items.append(stripped)

save_section()

print(f'Total sections: {len(sections)}')
for idx, sec in enumerate(sections):
    print(f'\\n=== Section {idx+1}: {sec["title"][:50]} ===')
    print(f'  Level: {sec["level"]}')
    print(f'  Items: {len(sec["items"])}')
    print(f'  Tables: {len(sec["tables"])}')
    for j, t in enumerate(sec['tables'][:1]):
        print(f'  Table rows: {len(t)}')
        for r in t[:3]:
            print(f'    {r}')
    print(f'  Code blocks: {len(sec["code_blocks"])}')
    print(f'  Mermaid blocks: {len(sec["mermaid_blocks"])}')
    print(f'  First 3 items: {sec["items"][:3]}')