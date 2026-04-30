import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        let f = path.join(dir, file);
        if(fs.statSync(f).isDirectory()) walkDir(f, callback);
        else if(f.endsWith('.tsx') || f.endsWith('.jsx')) callback(f);
    });
}

const addBtnStyle = `style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}`;

walkDir('src/pages', f => {
    let content = fs.readFileSync(f, 'utf-8');
    let o = content;

    // 1. Fix leftover ADD triggers that were accidentally made green
    // Match `onClick={handleAdd}` with `<Plus`
    content = content.replace(/(<button[^>]*onClick=\{handleAdd\}[^>]*>)\s*(<Plus[^>]*>\s*.*?)\s*(<\/button>)/gs, (match, openTag, inner, closeTag) => {
        let newOpenTag = openTag;
        if (newOpenTag.includes('style={{')) {
            newOpenTag = newOpenTag.replace(/style=\{\{[\s\S]*?\}\}/, addBtnStyle);
        } else {
            newOpenTag = newOpenTag.replace(/<button/, `<button ${addBtnStyle}`);
        }
        return newOpenTag + '\n                    ' + inner + '\n                ' + closeTag;
    });

    // 2. Fix leftover handleSaveNew which are strictly Add modals
    content = content.replace(/(<button[^>]*onClick=\{handleSaveNew\}[^>]*>)\s*([\s\S]*?)\s*(<\/button>)/gs, (match, openTag, inner, closeTag) => {
        // usually green. Keep green. Just change text.
        let newInner = inner.replace(/<><Plus[^>]*>\s*บันทึก<\/>/, 'เพิ่มข้อมูล');
        return openTag + '\n                                    {saving ? \'กำลังบันทึก...\' : \'เพิ่มข้อมูล\'}\n                                ' + closeTag;
    });

    // 3. Fix modal === 'add' || modal === 'edit' static '💾 บันทึก'
    // Search for 💾 บันทึก
    // If we replace it with `{modal === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}`
    // Or `{editMode ? ...}` depending on the file. Let's just blindly replace '💾 บันทึก' -> `{modal === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}` 
    // because `MaintenancePage`, `MechanicsPage`, `PartsShopsPage`, `StockOilPage`, `StockPartsPage`, `StoragePage` all share the exact same `modal === 'add'` or `modal === 'edit'` variable structure!
    content = content.replace(/>💾\s*บันทึก<\/button>/g, `>{modal === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}</button>`);
    content = content.replace(/'💾\s*บันทึก'/g, `'บันทึกข้อมูล'`); // fallback

    if (content !== o) {
        fs.writeFileSync(f, content, 'utf-8');
        console.log('Fixed:', f);
    }
});
