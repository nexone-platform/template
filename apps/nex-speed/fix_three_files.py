import os

files_to_fix = [
    r'C:\Task\Nex Solution\nex-speed\frontend\src\pages\ContainerMechanicsPage.tsx',
    r'C:\Task\Nex Solution\nex-speed\frontend\src\pages\FleetPage.tsx',
    r'C:\Task\Nex Solution\nex-speed\frontend\src\pages\SubcontractorsPage.tsx'
]

# We know the specific problem in these files is they have existing styles like:
# <button className="btn btn-primary btn-sm" onClick={handleSaveNew} disabled={...} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

cancel_style = r"style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}"
save_style = r"style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}"

for filepath in files_to_fix:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Cancel button fix: it currently doesn't have style={...}
    content = content.replace('className="btn btn-secondary btn-sm" onClick={() => setShowAddModal(false)}>ยกเลิก', f'onClick={{() => setShowAddModal(false)}} {cancel_style}>ยกเลิก')
    content = content.replace('className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(false)}>ยกเลิก', f'onClick={{() => setShowEditModal(false)}} {cancel_style}>ยกเลิก')
    content = content.replace('className="btn btn-secondary btn-sm" onClick={() => setShowDeleteConfirm(false)}>ยกเลิก', f'onClick={{() => setShowDeleteConfirm(false)}} {cancel_style}>ยกเลิก')

    content = content.replace('className="btn btn-secondary" onClick={() => setShowAddModal(false)}>ยกเลิก', f'onClick={{() => setShowAddModal(false)}} {cancel_style}>ยกเลิก')
    content = content.replace('className="btn btn-secondary" onClick={() => setShowEditModal(false)}>ยกเลิก', f'onClick={{() => setShowEditModal(false)}} {cancel_style}>ยกเลิก')
    content = content.replace('className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>ยกเลิก', f'onClick={{() => setShowDeleteConfirm(false)}} {cancel_style}>ยกเลิก')


    # Save button fix: replace the existing style inline.
    content = content.replace("style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>", f"{save_style}>")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Repaired 3 files cleanly.")
