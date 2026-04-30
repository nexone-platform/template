import fs from 'fs';
import path from 'path';

const directoryPath = path.join(__dirname, 'src/pages');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const cancelStyle = `style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}`;
const saveStyle = `style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}`;

let count = 0;

walkDir(directoryPath, function(filePath) {
    if (!filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/<button([^>]*)>([\s\S]*?)<\/button>/g, (match, attrs, inner) => {
        // Only target buttons that don't already have our colors
        if (!attrs.includes('#ef4444') && !attrs.includes('var(--accent-green)')) {
            
            // Exclude the 'select all cancel' link which uses background: 'none' and underline
            if (inner.includes('ยกเลิก') && !attrs.includes("background: 'none'")) {
                // If it has existing style, we try to avoid breaking it, but since we know these are missing styles, we can just inject or replace
                if (!attrs.includes("style={{")) {
                    return `<button${attrs} ${cancelStyle}>${inner}</button>`;
                }
            }
            if (inner.includes('บันทึก')) {
                if (!attrs.includes("style={{")) {
                    return `<button${attrs} ${saveStyle}>${inner}</button>`;
                }
            }
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        count++;
        console.log('Fixed:', filePath);
    }
});
console.log('Done', count);
