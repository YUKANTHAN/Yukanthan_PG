import os
from PIL import Image
import os

for f in os.listdir('.'):
    if f.endswith('.png') and os.path.getsize(f) > 10000:
        try:
            with Image.open(f) as img:
                print(f'{f}: {img.size[0]}x{img.size[1]} - {img.mode} - {os.path.getsize(f)} bytes')
        except Exception as e:
            print(f'{f}: Error - {e}')