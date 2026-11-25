import re
import os

with open(r'C:\Portfolio\portfolio-website-main\src\config.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract image paths and strip leading slash
images = [img.lstrip('/') for img in re.findall(r'image:\s*"(/images/[^"]+)"', content)]
dist_images = r'C:\Portfolio\portfolio-website-main\dist'

print('Verifying images in dist/:')
all_exist = True
for img in images:
    path = os.path.join(dist_images, img)
    exists = os.path.exists(path)
    size = os.path.getsize(path) if exists else 0
    status = 'OK' if exists else 'MISSING'
    print(f'  {status} {img} ({size} bytes)')
    if not exists:
        all_exist = False

print(f'\nAll images present: {all_exist}')