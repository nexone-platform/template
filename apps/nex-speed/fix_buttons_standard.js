const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            processDir(p);
        } else if (p.endsWith('Page.tsx')) {
            processFile(p);
        }
    });
}

function processFile(p) {
    let c = fs.readFileSync(p, 'utf8');
    let original = c;

    // 1. Fix Modal Save buttons text and background color
    let saveBtnRegex = /<button[^>]*onClick=\{o?n?C?l?i?c?k?\s*=?\s*\{?[^>]*?(saveForm|handleSave|handleSaveModal|saveUser)[^>]*\}[^>]*>([\s\S]*?)<\/button>/g;
    c = c.replace(saveBtnRegex, (match, fn, inner) => {
        let styleMatch = match.match(/style=\{\{([^\}]+)\}\}/);
        let styleStr = styleMatch ? styleMatch[0] : `style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}`;
        
        // Ensure green
        if(styleStr.includes('#ef4444')) return match; // actually don't replace if it's explicitly the cancel button
        styleStr = styleStr.replace(/background:\s*['"][^'"]+['"]/, "background: 'var(--accent-green)'");
        
        let disabledMatch = match.match(/disabled=\{([^}]+)\}/);
        let disabledStr = disabledMatch ? disabledMatch[0] : '';
        
        let onClickMatch = match.match(/onClick=\{([^\}]+)\}/);
        let onClickStr = onClickMatch ? onClickMatch[0] : `onClick={${fn}}`;

        let modalVar = c.includes('modalMode') ? 'modalMode' : 'modal';
        let newInner = `{${modalVar} === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}`;
        
        if (inner.includes('เพิ่มข้อมูล') && inner.includes('บันทึกข้อมูล')) return match;

        let classNameMatch = match.match(/className="([^"]+)"/);
        let classNameStr = classNameMatch ? classNameMatch[0] : '';
        
        return `<button ${onClickStr} ${styleStr} ${classNameStr} ${disabledStr}>${newInner}</button>`;
    });

    // 2. Fix Add buttons in toolbar (blue color, text "เพิ่มข้อมูล")
    let addBtnRegex = /<button[^>]*onClick=\{o?n?C?l?i?c?k?\s*=?\s*\{?[^>]*?(handleAdd|setModal\('add'\)|setModalMode\('add'\))[^>]*\}[^>]*>([\s\S]*?)<\/button>/g;
    c = c.replace(addBtnRegex, (match, fn, inner) => {
        let styleMatch = match.match(/style=\{\{([^\}]+)\}\}/);
        let styleStr = styleMatch ? styleMatch[0] : `style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}`;
        styleStr = styleStr.replace(/background:\s*['"][^'"]+['"]/, "background: 'var(--accent-blue)'");

        let onClickMatch = match.match(/onClick=\{([^\}]+)\}/);
        let onClickStr = onClickMatch ? onClickMatch[0] : (fn.includes('setModal') ? `onClick={() => setModal('add')}` : `onClick={handleAdd}`);
        let classNameMatch = match.match(/className="([^"]+)"/);
        let classNameStr = classNameMatch ? classNameMatch[0] : 'className="btn btn-primary btn-sm"';
        
        // Retain the Plus icon if present
        let hasPlus = inner.includes('<Plus');
        let newInner = (hasPlus ? '<Plus size={16} /> ' : '') + '<span>' + (p.includes('ParkingType') ? 'เพิ่มประเภทลานจอดรถ' : 'เพิ่มข้อมูล') + '</span>';
        
        return `<button ${onClickStr} ${classNameStr} ${styleStr}>${newInner}</button>`;
    });

    if (c !== original) {
        fs.writeFileSync(p, c, 'utf8');
        console.log('Fixed buttons in', p);
    }
}

processDir('src/pages');
