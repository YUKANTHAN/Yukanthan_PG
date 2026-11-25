import re
import requests

try:
    r = requests.get('http://localhost:8080/', timeout=5)
    print('Root:', r.status_code, len(r.text))
    
    # Check for icon links in HTML
    icon_links = re.findall(r'<link[^>]*rel=["\']icon[^>]*>|<link[^>]*rel=["\']shortcut icon[^>]*>|<link[^>]*rel=["\']apple-touch-icon[^>]*>', r.text, re.IGNORECASE)
    for link in re.findall(r'<link[^>]*>', r.text):
        if 'icon' in link.lower() or 'favicon' in link.lower() or 'manifest' in link.lower() or 'apple-touch' in link.lower():
            print(f'Found link: {link.strip()}')
    if not re.search(r'<link[^>]*rel=["\']icon|favicon|manifest|apple-touch', r.text, re.IGNORECASE):
        print('No icon/favicon/manifest links found in HTML')
except Exception as e:
    print('Error:', e)