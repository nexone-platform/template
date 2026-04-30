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

let count = 0;

walkDir(directoryPath, function(filePath) {
    if (!filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern to catch ANY button containing 'ยกเลิก' anywhere in it
    // Change background: 'var(--bg-card)' -> background: '#ef4444'
    // Change color: 'var(--text-primary)' -> color: 'white'
    content = content.replace(/<button([^>]*)>([\s\S]*?)<\/button>/g, (match, attrs, inner) => {
        if (inner.includes('ยกเลิก')) {
            // Found a cancel button
            let newAttrs = attrs
                .replace(/background:\s*'var\(--bg-card\)'/g, "background: '#ef4444'")
                .replace(/background:\s*'var\(--accent-blue\)'/g, "background: '#ef4444'")
                .replace(/color:\s*'var\(--text-primary\)'/g, "color: 'white'");
            return `<button${newAttrs}>${inner}</button>`;
        }
        if (inner.includes('บันทึกข้อมูล') || inner.includes('บันทึก')) {
            // Found a save button
            let newAttrs = attrs
                .replace(/background:\s*'var\(--accent-blue\)'/g, "background: 'var(--accent-green)'");
            return `<button${newAttrs}>${inner}</button>`;
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        count++;
        console.log('Updated Robust', filePath);
    }
});

console.log('Total files updated robustly:', count);
