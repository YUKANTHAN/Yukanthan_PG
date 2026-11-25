#!/usr/bin/env python3
"""
Generate 1280x800 PNG project-specific placeholder images
Each image tailored to the actual project purpose
"""

from PIL import Image, ImageDraw, ImageFont, ImageColor
import os

projects = [
    {
        "filename": "zenofest",
        "title": "ZenoFest 2026",
        "category": "Full Stack Event Platform",
        "bg_color": "#1a1a3e",
        "accent": "#00d4ff",
        "accent_rgb": (0, 212, 255),
        "theme": "event",
        "icon": "🎉",
        "features": ["3D Venue", "Live Schedule", "AR Navigation", "Live Chat"],
        "ui_elements": ["3D Map", "Schedule Grid", "Live Stream", "Chat Panel"]
    },
    {
        "filename": "ml_face_attendance",
        "title": "ML Face Attendance",
        "category": "AI / Computer Vision",
        "bg_color": "#0d1b2a",
        "accent": "#00ff88",
        "accent_rgb": (0, 255, 136),
        "theme": "ai",
        "icon": "👤",
        "features": ["Face Detection", "Anti-Spoofing", "Auto Reports", "Analytics"],
        "ui_elements": ["Camera Feed", "Face Boxes", "Attendance Log", "Stats Panel"]
    },
    {
        "filename": "music_app",
        "title": "MUSIC-APP",
        "category": "Full Stack / Media",
        "bg_color": "#1a0d2e",
        "accent": "#bb86fc",
        "accent_rgb": (187, 134, 252),
        "theme": "music",
        "icon": "🎵",
        "features": ["Mood AI", "Flutter Export", "Waveform Editor", "Playlists"],
        "ui_elements": ["Waveform", "Mood Selector", "Library Grid", "Mini Player"]
    },
    {
        "filename": "traveloop",
        "title": "Traveloop",
        "category": "Web / Travel",
        "bg_color": "#0c1d2b",
        "accent": "#00bcd4",
        "accent_rgb": (0, 188, 212),
        "theme": "travel",
        "icon": "✈️",
        "features": ["Mood AI", "Multi-City", "Budget Tracker", "Offline Maps"],
        "ui_elements": ["Map View", "Itinerary Cards", "Budget Bar", "Mood Selector"]
    },
    {
        "filename": "arun_crackers",
        "title": "Arun Crackers",
        "category": "E-commerce",
        "bg_color": "#2c0a0a",
        "accent": "#ff6b00",
        "accent_rgb": (255, 107, 0),
        "theme": "ecommerce",
        "icon": "🧨",
        "features": ["Inventory Sync", "Razorpay", "Analytics", "Multi-store"],
        "ui_elements": ["Product Grid", "Order Dashboard", "Stock Alerts", "Sales Chart"]
    },
    {
        "filename": "lumo_candles",
        "title": "Lumo Candles",
        "category": "Web / E-commerce",
        "bg_color": "#2d1a0a",
        "accent": "#ffd700",
        "accent_rgb": (255, 215, 0),
        "theme": "ecommerce",
        "icon": "🕯️",
        "features": ["Scent Profiles", "Subscription", "Gift Boxes", "AR Preview"],
        "ui_elements": ["Scent Wheel", "Candle Grid", "Subscription Plans", "AR Viewer"]
    },
    {
        "filename": "global_infosys",
        "title": "Global Info Sys Inc",
        "category": "Web / Business",
        "bg_color": "#0a1628",
        "accent": "#00b4d8",
        "accent_rgb": (0, 180, 216),
        "theme": "corporate",
        "icon": "🏢",
        "features": ["Service Catalog", "Client Portal", "Ticketing", "SLA Dashboard"],
        "ui_elements": ["Service Grid", "Ticket Kanban", "SLA Tracker", "Reports"]
    },
    {
        "filename": "wisdomystery",
        "title": "Wisdomystery",
        "category": "Web / Experimental",
        "bg_color": "#1a0a2e",
        "accent": "#c77dff",
        "accent_rgb": (199, 125, 255),
        "theme": "education",
        "icon": "🔬",
        "features": ["3D Flipbook", "MCQ Engine", "Progress Tracker", "AI Tutor"],
        "ui_elements": ["Flipbook Viewer", "Quiz Cards", "Progress Rings", "AI Chat"]
    },
]

def create_project_image(project):
    filename = project["filename"]
    title = project["title"]
    category = project["category"]
    bg_color = project["bg_color"]
    accent = project["accent"]
    accent_rgb = project["accent_rgb"]
    theme = project["theme"]
    icon = project["icon"]
    features = project["features"]
    ui_elements = project["ui_elements"]
    
    # Create 1280x800 image
    img = Image.new('RGB', (1280, 800), color=project["bg_color"])
    draw = ImageDraw.Draw(img)
    
    # Fonts
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
    
    draw = ImageDraw.Draw(img)
    
    # Light background with subtle pattern
    draw.rectangle([0, 0, 1280, 800], fill=project["bg_color"])
    
    # Subtle grid pattern
    for x in range(0, 1280, 40):
        draw.line([(x, 0), (x, 800)], fill=(255, 255, 255, 10), width=1)
    for y in range(0, 800, 40):
        draw.line([(0, y), (1280, y)], fill=(255, 255, 255, 8), width=1)
    
    # Accent glow in center
    glow_center = (640, 400)
    for r in range(300, 0, -30):
        alpha = int(20 * (1 - r/200))
        draw.ellipse([640-r, 400-r, 640+r, 400+r], 
                     fill=(*ImageColor.getrgb(project["accent"]), 10))
    
    # Header bar
    draw.rectangle([0, 0, 1280, 60], fill=(0, 0, 0, 180))
    
    # Logo/Title
    try:
        font_large = ImageFont.truetype("arial.ttf", 36)
        font_medium = ImageFont.truetype("arial.ttf", 24)
        font_small = ImageFont.truetype("arial.ttf", 16)
        font_tiny = ImageFont.truetype("arial.ttf", 12)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_tiny = ImageFont.load_default()
    
    draw = ImageDraw.Draw(img)
    
    # Top bar
    draw.rectangle([0, 0, 1280, 50], fill=(0, 0, 0, 200))
    draw.text((30, 12), project["title"], fill=(255, 255, 255), font=font_large)
    draw.text((30, 45), project["category"], fill=(180, 180, 200), font=font_small)
    
    # Main content area
    # Left panel - navigation
    draw.rectangle([30, 80, 280, 770], fill=(255, 255, 255, 20))
    draw.rounded_rectangle([20, 90, 270, 750], radius=12, fill=(255, 255, 255, 15))
    
    # Navigation items
    nav_items = ["Dashboard", "Analytics", "Projects", "Settings", "Team"]
    for i, item in enumerate(["Dashboard", "Analytics", "Projects", "Settings", "Reports"]):
        y = 120 + i * 70
        if i == 0:
            draw.rounded_rectangle([40, y-10, 250, y+45], radius=8, 
                                   fill=(*ImageColor.getrgb(project["accent"]), 40))
        draw.text((55, y), item, fill=(200, 200, 220), font=ImageFont.load_default())
    
    # Main content area
    content_x = 300
    content_y = 80
    content_w = 950
    content_h = 700
    
    # Header
    draw.text((70, 100), project["title"], fill=(255, 255, 255), font=ImageFont.truetype("arial.ttf", 36))
    draw.text((70, 150), project["category"], fill=(*ImageColor.getrgb(project["accent"]), 200), font=ImageFont.load_default())
    
    # Feature cards
    card_w = 380
    card_h = 160
    gap = 30
    start_x = 70
    start_y = 220
    
    for i, feature in enumerate(features):
        col = i % 3
        row = i // 3
        x = 70 + col * (380 + 30)
        y = 220 + (i // 3) * 200
        
        # Card background
        draw.rounded_rectangle([x, y, x + 380, y + 180], radius=16, 
                               fill=(255, 255, 255, 15), outline=(255,255,255,50), width=1)
        
        # Feature icon/emoji area
        icon_size = 80
        draw.ellipse([x + 20, y + 20, x + 20 + icon_size, y + 20 + icon_size], 
                     fill=(*ImageColor.getrgb(project["accent"]), 40), 
                     outline=(*ImageColor.getrgb(project["accent"]), 100), width=2)
        # Emoji/icon placeholder
        try:
            font_emoji = ImageFont.truetype("seguiemj.ttf", 36)
        except:
            font_emoji = ImageFont.load_default()
        
        # Feature name
        draw.text((x + 20, y + 20 + icon_size + 10), feature, fill=(255, 255, 255), font=ImageFont.load_default())
    
    # Right panel - code/terminal mock
    right_x = 950
    draw.rectangle([980, 100, 1250, 750], fill=(15, 15, 25, 200))
    draw.rounded_rectangle([990, 90, 1250, 750], radius=8, 
                           fill=(15, 15, 20, 200), outline=(100, 100, 150), width=1)
    
    # Terminal header
    draw.rectangle([1000, 110, 1240, 150], fill=(30, 30, 40))
    for i, color in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        draw.ellipse([1010 + i*18, 120, 1010 + i*18 + 12, 120 + 12], fill=color)
    
    # Code lines
    code_lines = [
        "const project = {",
        "  name: '" + filename + "',",
        "  tech: ['React', 'Node.js', 'AI'],",
        "  deploy: () => {",
        "    console.log('Deploying...');",
        "  }",
        "}"
    ]
    for i, line in enumerate(code_lines):
        color = (180, 220, 255) if not line.strip().startswith(" ") else (150, 200, 180)
        draw.text((20, 170 + i * 25), line, fill=color, font=ImageFont.load_default())
    
    # Bottom status bar
    draw.rectangle([0, 760, 1280, 800], fill=(0, 0, 0, 150))
    draw.text((30, 770), f"🚀 {project['title']} • {project['category']} • Ready to deploy", 
              fill=(180, 180, 200), font=ImageFont.load_default())
    
    # Project badge
    draw.rounded_rectangle([900, 20, 1250, 60], radius=20, 
                           fill=(*ImageColor.getrgb(project["accent"]), 50),
                           outline=(*ImageColor.getrgb(project["accent"]), 200), width=2)
    draw.text((1120 - len(project["title"]) * 8, 28), project["title"], 
              fill=project["accent"], font=ImageFont.load_default())
    draw.text((1120 - len(project["category"]) * 6, 45), project["category"], 
              fill=(180, 180, 200), font=ImageFont.load_default())
    
    # Save
    filepath = os.path.join(r"C:\Portfolio\portfolio-website-main\public\images", f"{project['filename']}.png")
    img.save(filepath, "PNG")
    print(f'Created: {project["filename"]}.png ({os.path.getsize(filepath):,} bytes)')

# Run
output_dir = r"C:\Portfolio\portfolio-website-main\public\images"
os.makedirs(output_dir, exist_ok=True)

for project in projects:
    try:
        create_project_image(project)
    except Exception as e:
        print(f"Error creating {project['filename']}: {e}")

print("\nAll done!")