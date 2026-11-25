import re

with open(r'C:\Portfolio\portfolio-website-main\src\config.ts', 'r', encoding='utf-8') as f:
    content = f.read()

images = re.findall(r'image:\s*"(/images/[^"]+)"', content)
print('Image paths in config.ts:')
for img in images:
    print(f'  {img}')
print(f'\nTotal: {len(images)} images')