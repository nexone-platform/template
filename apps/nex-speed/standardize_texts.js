import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath, callback);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            callback(fullPath);
        }
    });
}

const addBtnStyle = `style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}`;

walkDir('src/pages', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;

    // 1. Standardize Save button text (add -> เพิ่มข้อมูล, edit -> บันทึกข้อมูล)
    // Most use ternary logic: {saving ? '...' : (editMode ? '...' : '...')}
    // Some use { modal === 'edit' ? 'อัปเดต' : 'เพิ่มข้อมูล' }
    // We can use a regex to capture these ternary patterns.
    // Pattern: (something \? '.*?' \: (?:'|`|".*?")something_else(?:'|`|")) => wait, no, the simplest way is to find the save buttons.
    // The save button is usually `style={{ padding: '8px 16px', background: 'var(--accent-green)' ...`
    // Let's find `<button [^>]*background: 'var\(--accent-green\)'[^>]*>(.*?)</button>`
    const saveBtnRegex = /(<button[^>]*background:\s*['"]?var\(--accent-green\)['"]?[^>]*>)([\s\S]*?)(<\/button>)/g;
    content = content.replace(saveBtnRegex, (match, openTag, innerContent, closeTag) => {
        // innerContent could be `{saving ? 'กำลัง...' : (edit ? 'xx' : 'yy')}`
        
        let newInner = innerContent;
        
        // Find if there is a nested ternary for edit/add
        // e.g. `(editMode ? 'บันทึก' : 'เพิ่มรถ')`
        const editAddTernaryRegex = /\(\s*([a-zA-Z0-9_]+(?:\.?[a-zA-Z0-9_]+)*\s*(?:==|===|!=|!==)?\s*['"]?[a-zA-Z0-9_]*['"]?)\s*\?\s*(['"`].*?['"`])\s*:\s*(['"`].*?['"`])\s*\)/;
        if (editAddTernaryRegex.test(newInner)) {
            newInner = newInner.replace(editAddTernaryRegex, `($1 ? 'บันทึกข้อมูล' : 'เพิ่มข้อมูล')`);
        } 
        // Or if it's `{ modal === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล' }`
        else {
            // Check for simpler ternary without parenthesis
            const simpleTernaryRegex = /\{\s*([a-zA-Z0-9_]+(?:\.?[a-zA-Z0-9_]+)*\s*(?:==|===|!=|!==)\s*['"`]add['"`])\s*\?\s*(['"`].*?['"`])\s*:\s*(['"`].*?['"`])\s*\}/;
            if (simpleTernaryRegex.test(newInner)) {
               newInner = newInner.replace(simpleTernaryRegex, `{$1 ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}`);
            } else {
                const simpleTernaryRegex2 = /\{\s*([a-zA-Z0-9_]+(?:\.?[a-zA-Z0-9_]+)*\s*(?:==|===|!=|!==)\s*['"`]edit['"`])\s*\?\s*(['"`].*?['"`])\s*:\s*(['"`].*?['"`])\s*\}/;
                if (simpleTernaryRegex2.test(newInner)) {
                   newInner = newInner.replace(simpleTernaryRegex2, `{$1 ? 'บันทึกข้อมูล' : 'เพิ่มข้อมูล'}`);
                } else {
                    // It could just be plain text like 'บันทึก' or {editMode ? 'บันทึกข้อมูล' : 'เพิ่มข้อมูล'} without parens
                    // If we can't cleanly parse it, we might just try to replace string literals that look like save/add words
                    // but we only want to touch Save buttons.
                    // Let's replace commonly used words if they are string literals inside JSX
                    newInner = newInner.replace(/(['"`])(?:💾\s*บันทึก|บันทึก|บันทึกการเปลี่ยนแปลง|แก้ไขข้อมูล|บันทึก(?!ข้อมูล)\w*)(['"`])/g, `$1บันทึกข้อมูล$2`);
                    newInner = newInner.replace(/(['"`])(?:เพิ่ม\w+|สร้าง\w+|ยืนยันการเพิ่ม|Add)(['"`])/g, `$1เพิ่มข้อมูล$2`);
                }
            }
        }
        
        // Final fallback: if it's just plain text inside the button without curly braces
        if (!newInner.includes('{') && (newInner.includes('บันทึก') || newInner.includes('เพิ่ม') || newInner.includes('แก้ไข') || newInner.includes('อัปเดต'))) {
            // Note: Since this button is universally the save button, if it just says some static text, it depends if it's an Add or Edit form. But mostly they use ternary.
            // Let's ignore it if it's static and doesn't exactly match.
        }

        return openTag + newInner + closeTag;
    });

    // 2. Add Button Style (blue + Plus icon)
    // Match buttons that contain a `Plus` icon and some text starting with "เพิ่ม" or "สร้าง"
    // e.g. <button onClick={handleAdd} className="btn btn-primary ..."><Plus /> เพิ่ม...</button>
    // Since JSX parsing with regex is hard, let's use a simpler approach.
    const addButtonRegex = /(<button[^>]*>\s*<Plus[^>]*>\s*.*?<\/button>)/g;
    content = content.replace(addButtonRegex, (match) => {
        // Only target buttons that don't already have accent-blue background 
        // to avoid double styling or overwriting already specialized buttons
        
        let newBtn = match;
        
        // Remove existing classNames that might conflict (like btn-primary which sets background)
        // Wait, keep classes because they might have 'btn btn-sm' but strip out existing `style={{...}}`
        // We will just inject or replace style.
        
        // Remove `className="btn btn-primary"` or similar
        // newBtn = newBtn.replace(/className=['"]([^'"]*)['"]/, (clsMatch, classes) => {
        //    let newClasses = classes.replace(/\bbtn-primary\b/g, '').replace(/\bbtn-secondary\b/g, '').trim();
        //    return `className="${newClasses}"`;
        //});
        
        if (newBtn.includes('style={{')) {
            newBtn = newBtn.replace(/style=\{\{.*?\}\}/s, addBtnStyle);
        } else {
            newBtn = newBtn.replace(/<button/, `<button ${addBtnStyle}`);
        }
        
        return newBtn;
    });

    // Also look for Add button without <Plus> ? Usually they all use <Plus>
    // Wait, let's check for <button ...><Plus ... /> <span>เพิ่ม...</span></button>
    // The previous regex might not catch `<Plus /> <span>...` if there are newlines.
    const addButtonMultiLineRegex = /<button[^>]*>[\s\S]*?<Plus[^>]*>[\s\S]*?<\/button>/g;
    content = content.replace(addButtonMultiLineRegex, (match) => {
        // If it's already styled with accent-blue, skip
        if (match.includes('var(--accent-blue)') && match.includes('border: \'none\'')) return match;
        if (match.includes('var(--accent-green)')) return match; // Save button fallback guard
        
        let newBtn = match;
        if (newBtn.includes('style={{')) {
            newBtn = newBtn.replace(/style=\{\{[\s\S]*?\}\}/, addBtnStyle);
        } else {
            newBtn = newBtn.replace(/<button/, `<button ${addBtnStyle}`);
        }
        return newBtn;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
});
