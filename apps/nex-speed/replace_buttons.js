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

const cancelRegex = /(<button[^>]*>\s*)ยกเลิก(\s*<\/button>)/g;
const saveRegex = /(<button[^>]*>\s*)บันทึกข้อมูล(\s*<\/button>)/g;
const saveShortRegex = /(<button[^>]*>\s*)บันทึก(\s*<\/button>)/g;

let count = 0;

walkDir(directoryPath, function(filePath) {
    if (!filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Pattern to fix standard cancel buttons:
    // Change background to #ef4444 and color to white.
    // Example: background: 'var(--bg-card)' -> background: '#ef4444'
    // color: 'var(--text-primary)' -> color: 'white'
    
    content = content.replace(/background:\s*'var\(--bg-card\)'([^>]*>)\s*ยกเลิก\s*<\/button>/g, function(match, inner) {
        return "background: '#ef4444'" + inner.replace(/color:\s*'var\(--text-primary\)'/, "color: 'white'") + ">ยกเลิก</button>";
    });

    // Also update var(--accent-blue) for cancel buttons if any
    content = content.replace(/background:\s*'var\(--accent-blue\)'([^>]*>)\s*ยกเลิก\s*<\/button>/g, function(match, inner) {
        return "background: '#ef4444'" + inner + ">ยกเลิก</button>";
    });
    
    // Pattern to fix standard save buttons:
    // Change background from var(--accent-blue) to var(--accent-green)
    content = content.replace(/background:\s*'var\(--accent-blue\)'([^>]*>)\s*บันทึกข้อมูล\s*<\/button>/g, function(match, inner) {
        return "background: 'var(--accent-green)'" + inner + ">บันทึกข้อมูล</button>";
    });

    content = content.replace(/background:\s*'var\(--accent-blue\)'([^>]*>)\s*บันทึก\s*<\/button>/g, function(match, inner) {
        return "background: 'var(--accent-green)'" + inner + ">บันทึก</button>";
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        count++;
        console.log('Updated', filePath);
    }
});

console.log('Total files updated:', count);
