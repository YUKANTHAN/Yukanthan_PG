from PIL import Image
import os

path = r"C:\Portfolio\portfolio-website-main\public\images\zenofest.png"
img = Image.open(r"C:\Portfolio\portfolio-website-main\public\images\zenofest.png")
print(f"Size: {img.size}, Mode: {img.mode}, Bytes: {os.path.getsize(path)}")