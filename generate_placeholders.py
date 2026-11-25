#!/usr/bin/env python3
"""
Generate 1280x800 PNG placeholder images for new projects
Matching the style of old project images (light backgrounds, mock UI)
"""

from PIL import Image, ImageDraw, ImageFont, ImageColor
import os

# Project configurations: (filename, title, category, primary_color, secondary_color, icon_emoji)
projects = [
    ("zenofest", "ZenoFest 2026", "Full Stack Event Platform", "#1a1a3e", "#00d4ff", "🎉"),
    ("ml_face_attendance", "ML Face Attendance", "AI / Computer Vision", "#0d1b2a", "#00ff88", "👤"),
    ("music_app", "MUSIC-APP", "Full Stack / Media", "#1a0d2e", "#bb86fc", "🎵"),
    ("traveloop", "Traveloop", "Web / Travel", "#0c1d2b", "#00bcd4", "✈️"),
    ("arun_crackers", "Arun Crackers", "E-commerce", "#2c0a0a", "#ff6b00", "🧨"),
    ("lumo_candles", "Lumo Candles", "Web / E-commerce", "#2d1a0a", "#ffd700", "🕯️"),
    ("global_infosys", "Global Info Sys Inc", "Web / Business", "#0a1628", "#00b4d8", "🏢"),
    ("wisdomystery", "Wisdom mystery", "Web / Experimental", "#1a0a2e", "#c77dff", "🔬"),
]

# Output directory
output_dir = r"C:\Portfolio\portfolio-website-main\public\images"
os.makedirs(output_dir, exist_ok=True)

# Create images
for filename, title, category, bg_color, accent_color, icon in projects:
    # Create 1280x800 image
    img = Image.new('RGB', (1280, 800), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a nice font, fall back to default
    try:
        font_large = ImageFont.truetype("arial.ttf", 48)
        font_medium = ImageFont.truetype("arial.ttf", 28)
        font_small = ImageFont.truetype("arial.ttf", 20)
        font_tiny = ImageFont.truetype("arial.ttf", 16)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_tiny = ImageFont.load_default()
    
    # Draw a browser window mockup
    # Window chrome
    window_x, window_y = 60, 60
    window_w, window_h = 1160, 680
    
    # Window shadow
    shadow_offset = 10
    draw.rectangle([window_x + shadow_offset, window_y + shadow_offset, 
                    window_x + window_w + shadow_offset, window_y + window_h + shadow_offset],
                   fill=(0, 0, 0, 128))
    
    # Window body
    draw.rectangle([window_x, window_y, window_x + window_w, window_y + window_h],
                   fill=(255, 255, 255))
    
    # Window top bar
    draw.rectangle([window_x, window_y, window_x + window_w, window_y + 50],
                   fill=(240, 240, 240))
    
    # Window dots
    for i, color in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        draw.ellipse([window_x + 20 + i*25, window_y + 18, window_x + 32 + i*25, window_y + 30],
                     fill=color)
    
    # URL bar
    draw.rounded_rectangle([window_x + 120, window_y + 12, window_x + window_w - 20, window_y + 38],
                           radius=8, fill=(255, 255, 255))
    draw.text((window_x + 140, window_y + 18), f"https://{filename}.vercel.app", 
              fill=(150, 150, 150), font=font_small)
    
    # Content area background
    content_y = window_y + 50
    draw.rectangle([window_x, content_y, window_x + window_w, window_y + window_h],
                   fill=(250, 250, 252))
    
    # Sidebar
    sidebar_w = 200
    draw.rectangle([window_x, content_y, window_x + sidebar_w, window_y + window_h],
                   fill=(245, 245, 248))
    
    # Sidebar items
    sidebar_items = ["Dashboard", "Projects", "Analytics", "Settings", "Profile"]
    for i, item in enumerate(sidebar_items):
        y_pos = content_y + 80 + i * 60
        if i == 0:
            draw.rounded_rectangle([window_x + 15, y_pos - 10, window_x + sidebar_w - 15, y_pos + 35],
                                   radius=8, fill=(*ImageColor.getrgb(accent_color), 30))
        draw.text((window_x + 30, y_pos), item, fill=(100, 100, 120), font=font_small)
    
    # Main content area
    main_x = window_x + sidebar_w + 40
    main_y = content_y + 40
    
    # Title
    draw.text((main_x, main_y), title, fill=(30, 30, 50), font=font_large)
    draw.text((main_x, main_y + 60), category, fill=ImageColor.getrgb(accent_color), font=font_medium)
    
    # Mock content cards
    card_y = main_y + 120
    card_w = 320
    card_h = 180
    card_gap = 20
    
    for i in range(3):
        card_x = main_x + i * (card_w + card_gap)
        # Card shadow
        draw.rounded_rectangle([card_x + 5, card_y + 5, card_x + card_w + 5, card_y + card_h + 5],
                               radius=12, fill=(0, 0, 0, 30))
        # Card body
        draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h],
                               radius=12, fill=(255, 255, 255))
        # Card accent bar
        draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + 8],
                               radius=4, fill=ImageColor.getrgb(accent_color))
        # Mock chart/graph area
        chart_x = card_x + 20
        chart_y = card_y + 30
        chart_w = card_w - 40
        chart_h = card_h - 60
        # Draw mock bars
        for bar in range(5):
            bar_height = 20 + (bar * 15) % 60
            bar_x = chart_x + bar * 40
            draw.rectangle([bar_x, chart_y + chart_h - bar_height, bar_x + 25, chart_y + chart_h],
                           fill=ImageColor.getrgb(accent_color))
        
        # Mock text lines
        draw.rectangle([card_x + 20, card_y + card_h - 40, card_x + card_w - 20, card_y + card_h - 35],
                       fill=(230, 230, 235))
        draw.rectangle([card_x + 20, card_y + card_h - 25, card_x + card_w - 60, card_y + card_h - 20],
                       fill=(240, 240, 245))
    
    # Bottom row - table mockup
    table_y = card_y + card_h + 30
    draw.rounded_rectangle([main_x, table_y, main_x + 1000, table_y + 150],
                           radius=12, fill=(255, 255, 255))
    # Table header
    draw.rectangle([main_x, table_y, main_x + 1000, table_y + 40],
                   fill=(245, 245, 248))
    for col in range(4):
        col_x = main_x + 20 + col * 250
        draw.rectangle([col_x, table_y + 10, col_x + 180, table_y + 30],
                       fill=(220, 220, 225))
    # Table rows
    for row in range(3):
        row_y = table_y + 50 + row * 30
        for col in range(4):
            col_x = main_x + 20 + col * 250
            draw.rectangle([col_x, row_y, col_x + 180, row_y + 15],
                           fill=(240, 240, 245))
    
    # Add accent glow effect in corner
    glow_x = window_x + window_w - 200
    glow_y = window_y + window_h - 200
    for r in range(100, 0, -10):
        alpha = int(30 * (1 - r/100))
        draw.ellipse([glow_x - r, glow_y - r, glow_x + r, glow_y + r],
                     fill=(*ImageColor.getrgb(accent_color), alpha))
    
    # Save
    output_path = os.path.join(output_dir, f"{filename}.png")
    img.save(output_path, "PNG")
    print(f"Created: {output_path} ({os.path.getsize(output_path):,} bytes)")

print("\nAll placeholder images created!")