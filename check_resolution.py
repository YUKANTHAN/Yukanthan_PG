import os
from PIL import Image

img_dir = r"C:\Portfolio\portfolio-website-main\dist\images"
for f in os.listdir(r"C:\Portfolio\portfolio-website-main\dist\images"):
    if f.endswith('.png'):
        path = os.path.join(r"C:\Portfolio\portfolio-website-main\dist\images", f)
        try:
            with Image.open(path) as img:
                print(f"{f}: {img.size[0]}x{img.size[1]} - {os.path.getsize(path)} bytes")
        except Exception as e:
            print(f"{f}: {os.path.getsize(path)} bytes - Error: {e}")