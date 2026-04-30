import os
import re

directory = r'C:\Task\Nex Solution\nex-speed\frontend\src\pages'

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Damage 1: `onClick={async () = style={{...}}> {`
    # Damage 2: `onClick={() = style={{...}}> {`
    # Damage 3: `onClick={() = style={{...}}> setShowAddModal(false)}>`
    
    # We want to remove the injected `= style={{...}}>` and replace it with `=>`.
    # Let's target literal ` = style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>`
    # and the green one.
    
    red_style = r" = style=\{\{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 \}\}>"
    green_style = r" = style=\{\{ padding: '8px 16px', background: 'var\(--accent-green\)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 \}\}>"
    
    # Also I injected `color: 'white' }}} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>>ยกเลิก`
    
    content = re.sub(red_style, r" =>", content)
    content = re.sub(green_style, r" =>", content)
    
    # Clean up any leftover double logic like `} => {` that might occur? No, the original was `() => {`, and the script replaced `=>` with `= style=...>` so we restore it to `=>`.
    
    # Damage 4: The duplicate style in View/Delete Modals where it appended `}} style={{...}}>>`
    # Let's fix that too.
    content = re.sub(r'\}\}\}\s*style=\{\{.*?\}\}>>', r'}}>', content)
    
    # Some buttons might have `>บันทึก` or `>ยกเลิก` if there was a `>>` before.
    content = re.sub(r'>>\s*ยกเลิก', r'>ยกเลิก', content)
    content = re.sub(r'>>\s*บันทึก', r'>บันทึก', content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed damage in: {filepath}")

for root, _, files in os.walk(directory):
    for f in files:
        if f.endswith('.tsx'):
            fix_file(os.path.join(root, f))
