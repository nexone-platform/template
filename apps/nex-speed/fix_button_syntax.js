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

    // The breakage is exactly: `onClick={() = style={{ ... }}> ...`
    // We want to turn it back to `onClick={() => ...}` and add style.
    // Example: `onClick={() = style={{...}}> setShowAddModal(false)}>ยกเลิก</button>`
    // Should be: `onClick={() => setShowAddModal(false)} style={{...}}>ยกเลิก</button>`

    // 1. Find the cancel button breakage
    let cancelPattern = new RegExp(`onClick=\\{\\(\\) = ${cancelStyle.replace(/([{}()[\]\\.*?+^$|])/g, '\\$1')}> ([^>]+)>([\\s\\S]*?)<\\/button>`, 'g');
    content = content.replace(cancelPattern, (match, onClickTarget, inner) => {
        return `onClick={() => ${onClickTarget}} ${cancelStyle}>${inner}</button>`;
    });

    // 2. Find the save button breakage
    let savePattern = new RegExp(`onClick=\\{\\(\\) = ${saveStyle.replace(/([{}()[\]\\.*?+^$|])/g, '\\$1')}> ([^>]+)>([\\s\\S]*?)<\\/button>`, 'g');
    content = content.replace(savePattern, (match, onClickTarget, inner) => {
        return `onClick={() => ${onClickTarget}} ${saveStyle}>${inner}</button>`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        count++;
        console.log('Fixed breakage in:', filePath);
    }
});
console.log('Fixed count:', count);
