import os
import re

directory = r'C:\Task\Nex Solution\nex-speed\frontend\src\pages'

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Fix type 1: `onClick={() => someCall()}} style={{...}}>` -> `onClick={() => someCall()} style={{...}}>`
    # Warning: some closures might have multiple braces, but usually it's single line simple logic.
    content = re.sub(r'onClick=\{\(\)\s*=>\s*([^{]+?)\}\}\s*style=\{\{', r'onClick={() => \1} style={{', content)

    # Fix type 2: `}}} style={{...}}>>` -> `}} style={{...}}>`
    content = re.sub(r'\}\}\}\s*style=\{\{(.*?)\}\}\s*>>', r'}} style={{\1}}>', content)

    # Note: `}} style={cancelStyle}>>ยกเลิก</button>` has double `>>`
    # Wait, the extra `>` came from inner which was `>ยกเลิก` in my script. 
    # Let's cleanly fix any `>>ยกเลิก` to `>ยกเลิก`
    content = re.sub(r'>>\s*ยกเลิก', r'>ยกเลิก', content)
    content = re.sub(r'>>\s*บันทึก', r'>บันทึก', content)

    # Also clean up any extra `}` in style 
    # Sometimes my script might have output `onClick={() => ...} style={{ ... }} style={{...}}>`
    # If the button had a previously defined style!
    # Let's fix duplicate styles by just replacing `style={{...}} style={{...}}` 
    # with the LAST style block since that's what we want.
    content = re.sub(r'style=\{\{.*?\}\}\s*style=\{\{(.*?)\}\}', r'style={{\1}}', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")

for root, _, files in os.walk(directory):
    for f in files:
        if f.endswith('.tsx'):
            fix_file(os.path.join(root, f))
