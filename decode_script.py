import base64

with open('C:/Users/HP/Desktop/Pixulse-Cloud/Pixulse-Cloud/ak/templates/escape_road.html', 'r', encoding='utf-8') as f:
    html = f.read()

b64 = html.split('base64,')[1].split('".replace')[0]
b64 += '=' * (-len(b64) % 4)

with open('loader.js', 'wb') as f:
    f.write(base64.b64decode(b64))
