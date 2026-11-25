#!/usr/bin/env python3
"""
Generate a realistic 1280x800 PNG screenshot placeholder for ML Face Attendance
Based on the actual Attendify app described in its README
"""

from PIL import Image, ImageDraw, ImageFont, ImageColor
import os

def create_ml_face_attendance_screenshot():
    # Create 1280x800 image
    img = Image.new('RGB', (1280, 800), color='#0d1b2a')
    draw = ImageDraw.Draw(img)
    
    # Try to load fonts
    try:
        font_large = ImageFont.truetype("arial.ttf", 36)
        font_medium = ImageFont.truetype("arial.ttf", 24)
        font_medium_bold = ImageFont.truetype("arialbd.ttf", 24)
        font_small = ImageFont.truetype("arial.ttf", 16)
        font_tiny = ImageFont.truetype("arial.ttf", 12)
        font_mono = ImageFont.truetype("consola.ttf", 13)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_tiny = ImageFont.load_default()
    
    draw = ImageDraw.Draw(img)
    
    # Dark theme background matching the app's dark mode
    bg_color = '#0d1b2a'
    accent = '#00ff88'
    accent_rgb = (0, 255, 136)
    bg_rgb = (13, 27, 42)
    
    # Background
    draw.rectangle([0, 0, 1280, 800], fill='#0d1b2a')
    
    # Subtle grid pattern
    for x in range(0, 1280, 50):
        draw.line([(x, 0), (x, 800)], fill=(255, 255, 255, 5), width=1)
    for y in range(0, 800, 50):
        draw.line([(0, y), (1280, y)], fill=(255, 255, 255, 5), width=1)
    
    # Accent glow in center
    for r in range(300, 0, -30):
        alpha = int(15 * (1 - r/300))
        draw.ellipse([640-r, 400-r, 640+r, 400+r], 
                     fill=(*ImageColor.getrgb('#00ff88'), alpha))
    
    # Top navigation bar (dark)
    draw.rectangle([0, 0, 1280, 60], fill=(10, 20, 35, 230))
    
    # App title
    try:
        font_large = ImageFont.truetype("arial.ttf", 28)
        font_medium = ImageFont.truetype("arial.ttf", 20)
        font_small = ImageFont.truetype("arial.ttf", 14)
        font_tiny = ImageFont.truetype("arial.ttf", 11)
        font_mono = ImageFont.truetype("consola.ttf", 12)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
        font_tiny = ImageFont.load_default()
    
    draw = ImageDraw.Draw(img)
    
    # Top nav bar
    draw.rectangle([0, 0, 1280, 56], fill=(10, 15, 25, 240))
    draw.text((24, 14), "Attendify", fill='#00ff88', font=ImageFont.truetype("arial.ttf", 24) if True else ImageFont.load_default())
    draw.text((160, 16), "Attendance System", fill=(180, 180, 200), font=ImageFont.load_default())
    
    # Nav items
    nav_items = ["Dashboard", "Students", "Attendance", "Reports", "Settings"]
    for i, item in enumerate(["Dashboard", "Students", "Attendance", "Reports", "Settings"]):
        x = 200 + i * 140
        if i == 0:
            draw.rounded_rectangle([120 + i*160, 12, 120 + (i+1)*160 - 20, 48], radius=6, fill=(0, 255, 136, 40))
        draw.text((25 + i*160, 16), item, fill=(255, 255, 255) if i==0 else (180, 180, 200), font=ImageFont.load_default())
    
    # Right side - theme toggle, profile
    draw.rectangle([1140, 12, 1260, 48], fill=(25, 30, 40, 200), outline=(0, 255, 136, 100), width=1)
    draw.text((1200, 18), "🌙", fill=(200, 200, 220), font=ImageFont.load_default())
    
    # Main content area - Split layout
    # Left sidebar
    draw.rectangle([20, 70, 280, 780], fill=(13, 20, 35, 200))
    draw.rounded_rectangle([20, 80, 270, 770], radius=12, fill=(15, 20, 30, 220), outline=(0, 255, 136, 50), width=1)
    
    # Sidebar navigation
    nav_items = [
        ("📊", "Dashboard"),
        ("👥", "Students"),
        ("📋", "Attendance"),
        ("📊", "Analytics"),
        ("📄", "Reports"),
        ("⚙️", "Settings"),
    ]
    for i, (icon, label) in enumerate([("📊", "Dashboard"), ("👥", "Students"), ("📋", "Attendance"), ("📊", "Analytics"), ("📄", "Reports"), ("⚙️", "Settings")]):
        y = 90 + i * 65
        if i == 0:
            draw.rounded_rectangle([25, 85 + i*65, 265, 65 + i*65 + 50], radius=10, fill=(0, 255, 136, 30))
        draw.text((35, 100 + i*65), f"{icon}  {label}", fill=(255, 255, 255) if i==0 else (180, 180, 200), font=ImageFont.load_default())
    
# Year filter dropdown area
    draw.rounded_rectangle([30, 420, 250, 480], radius=8, fill=(20, 25, 35), outline=(0, 255, 136, 50), width=1)
    draw.text((35, 430), "Year Filter", fill=(150, 150, 180), font=ImageFont.load_default())
    years = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
    for i, year in enumerate(years):
        y = 435 + i * 22
        if i == 0:
            draw.rounded_rectangle([35, 430 + i*22, 250, 430 + i*22 + 18], radius=4, fill=(0, 255, 136, 60))
        draw.text((45, 433 + i*22), year, fill=(255, 255, 255) if i==0 else (180, 180, 200), font=ImageFont.load_default())
    
# Holiday toggle
    draw.rounded_rectangle([30, 480, 250, 540], radius=8, fill=(20, 25, 35), outline=(0, 255, 136, 50), width=1)
    draw.text((35, 488), "Day Type: Working Day", fill=(0, 255, 136), font=ImageFont.load_default())
    
    # Holiday toggle switch
    draw.rounded_rectangle([180, 488, 240, 502], radius=12, fill=(0, 255, 136), outline=None)
    draw.ellipse([210, 488, 230, 508], fill=(255, 255, 255))
    
    # Main content area
    # Header
    draw.text((230, 70), "Attendify", fill='#00ff88', font=ImageFont.truetype("arial.ttf", 32) if True else ImageFont.load_default())
    draw.text((200, 110), "AI Face Attendance System", fill=(180, 180, 200), font=ImageFont.load_default())
    
    # Stats cards row
    stats = [
        ("Total Students", "1,234", "👥"),
        ("Present Today", "1,087", "✅"),
        ("Absent", "147", "❌"),
        ("Late", "23", "⏰"),
    ]
    for i, (label, value, icon) in enumerate(stats):
        x = 230 + i * 310
        y = 75
        draw.rounded_rectangle([230 + i*310, 160, 230 + i*310 + 280, 160 + 100], radius=12, 
                               fill=(15, 20, 30), outline=(0, 255, 136, 60), width=1)
        draw.text((245 + i*310, 180), icon, fill=(0, 255, 136), font=ImageFont.load_default())
        draw.text((210 + i*310, 200), value, fill=(255, 255, 255), font=ImageFont.truetype("arial.ttf", 32) if True else ImageFont.load_default())
        draw.text((210 + i*310, 240), label, fill=(150, 180, 200), font=ImageFont.load_default())
    
    # Charts area - Two charts side by side
    # Left: Weekly Attendance Chart (bar chart)
    draw.rounded_rectangle([30, 300, 630, 480], radius=12, fill=(15, 20, 30), outline=(0, 255, 136, 50), width=1)
    draw.text((50, 310), "Weekly Attendance", fill=(255, 255, 255), font=ImageFont.load_default())
    # Mock bar chart
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    values = [85, 92, 78, 95, 88, 45, 30]
    max_val = max(values)
    bar_w = 50
    gap = 20
    start_x = 50
    base_y = 450
    for i, (day, val) in enumerate(zip(days, values)):
        h = int((val / max(values)) * 100)
        x = 50 + i * 75
        bar_h = int((val / max_val) * 100)
        draw.rectangle([50 + i*75, 430 - bar_h, 50 + i*75 + 40, 430], 
                       fill=(0, 255, 136, 200), outline=(0, 255, 136), width=1)
        draw.text((50 + i*75 + 10, 440), day, fill=(180, 180, 200), font=ImageFont.load_default())
        draw.text((50 + i*75 + 5, 420 - bar_h), str(val) + "%", fill=(0, 255, 136), font=ImageFont.load_default())
    
    draw.text((50, 305), "Weekly Attendance %", fill=(200, 200, 220), font=ImageFont.load_default())
    
    # Right chart - Year-wise Distribution (doughnut chart representation)
    draw.rounded_rectangle([670, 300, 1250, 480], radius=12, fill=(15, 20, 30), outline=(0, 255, 136, 50), width=1)
    draw.text((690, 310), "Year-wise Distribution", fill=(255, 255, 255), font=ImageFont.load_default())
    
    # Doughnut chart mockup
    center_x, center_y = 950, 400
    year_data = [("1st Year", 30, "#00ff88"), ("2nd Year", 25, "#00b4d8"), ("3rd Year", 25, "#ffd60a"), ("4th Year", 20, "#ff6b00")]
    angle = -90
    for label, pct, color in year_data:
        # Draw arc
        angle = pct * 3.6
        # Simplified - draw arc segments
        for i in range(int(pct * 3.6)):
            angle_rad = (i + 90) * 3.14159 / 180
            x1 = 650 + 100 * (i / (pct * 3.6))
            # Simplified - just draw colored segments
            pass
    
    # Simplified doughnut segments
    colors = ["#00ff88", "#00b4d8", "#ffd60a", "#ff6b00"]
    percentages = [30, 25, 25, 20]
    labels = ["1st Year", "2nd Year", "3rd Year", "4th Year"]
    angle = -90
    for i, (pct, color, label) in enumerate(zip([30, 25, 25, 20], colors, labels)):
        # Draw segment
        for deg in range(int(angle), int(angle + pct * 3.6)):
            rad = deg * 3.14159 / 180
            x1 = 950 + 80 * (deg * 3.14159 / 180)
            y1 = 400 + 80 * (deg * 3.14159 / 180)
            # Simplified - draw lines
        angle += pct * 3.6
    
    # Legend
    for i, (label, color) in enumerate(zip(labels, colors)):
        y = 520 + i * 22
        draw.ellipse([700, 480 + i*22, 714, 494 + i*22], fill=color)
        draw.text((720, 510 + i*22), f"{label} {['30%','25%','25%','20%'][i]}", fill=(200,200,220), font=ImageFont.load_default())
    
    # Bottom section - Recent Activity / Student Table
    draw.rounded_rectangle([30, 510, 1250, 780], radius=12, fill=(15, 20, 30), outline=(0, 255, 136, 50), width=1)
    draw.text((50, 520), "Recent Attendance", fill=(255, 255, 255), font=ImageFont.load_default())
    
    # Table header
    headers = ["Student", "Year", "Status", "Time", "Method"]
    col_widths = [250, 100, 120, 150, 120]
    x = 40
    for i, (header, w) in enumerate(zip(["Student", "Year", "Status", "Time", "Method"], [250, 100, 120, 150, 120])):
        draw.rectangle([40 + sum([250, 100, 120, 150, 120][:i]), 540, 40 + sum([250, 100, 120, 150, 120][:i+1]), 565], 
                       fill=(10, 15, 25))
        draw.text((45 + sum([250, 100, 120, 150, 120][:i]), 545), header, fill=(0, 255, 136), font=ImageFont.load_default())
    
    # Sample student rows
    students = [
        ("Rajesh Kumar", "3rd Year", "Present", "09:15 AM", "Face ID"),
        ("Priya Sharma", "2nd Year", "Present", "09:14 AM", "Face ID"),
        ("Amit Patel", "1st Year", "Absent", "--", "--"),
        ("Sneha Reddy", "4th Year", "Late", "09:22 AM", "Face ID"),
        ("Vikram Singh", "3rd Year", "Present", "09:10 AM", "Manual"),
    ]
    
    for row_i, student in enumerate(students):
        y = 570 + row_i * 30
        bg = (20, 25, 35) if row_i % 2 == 0 else (15, 18, 28)
        draw.rectangle([40, y, 1240, y + 28], fill=bg)
        x = 50
        for j, (val, w) in enumerate(zip(student, [250, 100, 120, 150, 120])):
            color = (0, 255, 136) if student[2] == "Present" else (255, 107, 0) if student[2] == "Late" else (255, 50, 50) if student[2] == "Absent" else (200, 200, 200)
            draw.text((40 + sum([250, 100, 120, 150, 120][:j]), 550 + row_i * 30), val, fill=color if j == 2 else (220, 220, 220), font=ImageFont.load_default())
    
    # Bottom status bar
    draw.rectangle([0, 760, 1280, 800], fill=(10, 15, 25))
    draw.text((30, 770), "🟢  System Online  |  Camera: Connected  |  Last Sync: 2 min ago  |  1,234 Students Registered", 
              fill=(150, 150, 180), font=ImageFont.load_default())
    
    # Save
    output_path = r"C:\Portfolio\portfolio-website-main\public\images\ml_face_attendance.png"
    img.save(output_path, "PNG")
    print(f"Created: ml_face_attendance.png ({os.path.getsize(output_path):,} bytes)")

if __name__ == "__main__":
    create_ml_face_attendance_screenshot()