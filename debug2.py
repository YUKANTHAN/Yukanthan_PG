import re

with open('white-travels-article.md', 'r', encoding='utf-8') as f:
    md = f.read()

lines = md.split('\n')

sections = []
current_title = None
current_level = 0
current_items = []
tables = []
code_blocks = []
mermaid_blocks = []
in_code = False
code_lines = []
in_mermaid = False
mermaid_lines = []
in_table = False
table_lines = []

def flush():
    global in_code, code_lines, in_mermaid, mermaid_lines, in_table, table_lines
    if in_code and code_lines:
        code_blocks.append(''.join(code_lines))
        in_code = False
        code_lines = []
    if in_mermaid and mermaid_lines:
        mermaid_blocks.append(''.join(mermaid_lines))
        in_mermaid = False
        mermaid_lines = []
    if in_table and table_lines:
        tables.append(table_lines)
        in_table = False
        table_lines = []

for i, line in enumerate(lines):
    if line.startswith('```'):
        if not in_code and not in_mermaid:
            in_code = True
            next_part = line[3:].strip()
            in_mermaid = (next_part == 'mermaid')
            code_lines = []
        elif in_code:
            if in_mermaid:
                in_mermaid = False
            else:
                in_code = False
        continue
    
    if in_code or in_mermaid:
        if line.strip():
            if in_code:
                code_lines.append(line)
            elif in_mermaid:
                mermaid_lines.append(line)
        continue
    
    if re.match(r'^(---|\*\*\*|___)$', line.strip()):
        flush()
        current_items.append('HR')
        continue
    
    hm = re.match(r'^(#{1,6})\s+(.+)$', line)
    if hm:
        flush()
        if current_title and (current_items or code_blocks or mermaid_blocks or tables):
            sections.append({'title': current_title, 'level': current_level, 'items': current_items, 'tables': tables, 'code_blocks': code_blocks, 'mermaid_blocks': mermaid_blocks})
        current_title = hm.group(2)
        current_level = len(hm.group(1))
        current_items = []
        tables = []
        code_blocks = []
        mermaid_blocks = []
        continue
    
    stripped = line.strip()
    if stripped.startswith('|') and stripped.endswith('|'):
        if not in_table:
            in_table = True
            table_lines = []
        table_lines.append(stripped)
        continue
    else:
        flush()
        in_table = False
        table_lines = []
    
    if stripped:
        current_items.append(stripped)

flush()
if current_title and (current_items or code_blocks or mermaid_blocks or tables):
    sections.append({'title': current_title, 'level': current_level, 'items': current_items, 'tables': tables, 'code_blocks': code_blocks, 'mermaid_blocks': mermaid_blocks})

print(f'Total sections: {len(sections)}')
for idx in range(len(sections)):
    sec = sections[idx]
    title_preview = sec['title'][:50] if sec['title'] else 'NO TITLE'
    print(f'\n=== Section {idx+1}: {title_preview} ===')
    print(f'Level: {sec["level"]}')
    print(f'Items: {len(sec["items"])}')
    print(f'Tables: {len(sec["tables"])}')
    print(f'Code blocks: {len(sec["code_blocks"])}')
    print(f'Mermaid blocks: {len(sec["mermaid_blocks"])}')
    for j in range(min(5, len(sec['items']))):
        item = sec['items'][j]
        print(f'  Item[{j}]: {item[:60]}')