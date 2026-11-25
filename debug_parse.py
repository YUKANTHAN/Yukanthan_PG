import re

with open('white-travels-article.md', 'r', encoding='utf-8') as f:
    md = f.read()

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

lines = md.split('\n')
i = 0
while i < len(lines):
    line = lines[i]
    
    if line.startswith('```'):
        if not in_code_block and not in_mermaid_block:
            in_code_block = True
            code_block_lang = line[3:].strip()
            code_block_lines = []
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

print(f'Total sections: {len(sections)}')
for idx, sec in enumerate(sections):
    title_preview = sec['title'][:50] if sec['title'] else 'NO TITLE'
    print(f'\n=== Section {idx+1}: {title_preview} ===')
    print(f'Level: {sec["level"]}')
    print(f'Content items: {len(sec["content"])}')
    print(f'Tables: {len(sec["tables"])}')
    print(f'Code blocks: {len(sec["code_blocks"])}')
    print(f'Mermaid blocks: {len(sec["mermaid_blocks"])}')
    for j, item in enumerate(sec['content'][:3]):
        txt = str(item['text'])[:60] if item['type'] == 'text' else 'N/A'
        print(f'  Content[{j}]: type={item["type"]}, text={txt}...')
    if len(sec['content']) > 3:
        print(f'  ... and {len(sec["content"])-3} more items')