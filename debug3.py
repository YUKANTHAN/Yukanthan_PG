import re

with open('white-travels-article.md', 'r', encoding='utf-8') as f:
    md = f.read()

lines = md.split('\n')

sections = []
current_section = None
in_code = False
code_lang = ''
in_mermaid = False
code_lines = []
mermaid_lines = []
table_lines = []

def finish_section():
    global current_section
    if current_section and (current_section.get('title') or 
                           current_section.get('all_text') or
                           current_section.get('tables') or
                           current_section.get('code_blocks') or
                           current_section.get('mermaid_blocks')):
        cleaned = []
        for t in current_section.get('all_text', []):
            if t and t.strip():
                cleaned.append(t.strip())
        current_section['all_text'] = cleaned
        sections.append(current_section)

for i, line in enumerate(lines):
    # Handle Unicode arrows carefully
    has_arrow = '\u2192' in line
    
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
            else:
                in_code = False
                if current_section:
                    current_section.setdefault('code_blocks', []).append(''.join(code_lines))
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
        if current_section:
            current_section.setdefault('all_text', []).append('HR')
        continue
    
    # Headers
    hm = re.match(r'^(#{1,6})\s+(.+)$', line)
    if hm:
        finish_section()
        current_section = {
            'title': hm.group(2),
            'level': len(hm.group(1)),
            'all_text': [],
            'tables': [],
            'code_blocks': [],
            'mermaid_blocks': []
        }
        continue
    
    # Tables
    stripped = line.strip()
    if stripped.startswith('|') and stripped.endswith('|'):
        if not table_lines:
            table_lines = [stripped]
        else:
            table_lines.append(stripped)
        continue
    else:
        if table_lines and current_section:
            current_section.setdefault('tables', []).append(table_lines)
        table_lines = []
    
    # Text
    if stripped:
        if current_section:
            current_section.setdefault('all_text', []).append(stripped)
        else:
            print(f'  WARNING: No current section for text: {stripped[:50]}')

# Finish last section
finish_section()

print(f'Total sections: {len(sections)}')
for idx, sec in enumerate(sections):
    print(f'\\n=== Section {idx+1}: {sec["title"][:50]} ===')
    print(f'  Level: {sec["level"]}')
    print(f'  all_text count: {len(sec["all_text"])}')
    print(f'  first 3 items: {sec["all_text"][:3]}')
    print(f'  tables: {len(sec["tables"])}')
    print(f'  code_blocks: {len(sec["code_blocks"])}')
    print(f'  mermaid_blocks: {len(sec["mermaid_blocks"])}')