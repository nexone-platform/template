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

walkDir(directoryPath, function(filePath) {
    if (!filePath.endsWith('.tsx')) return;
    let content = fs.readFileSync(filePath, 'utf8');

    const matches = content.match(/<button([^>]*)>([\s\S]*?)<\/button>/g);
    if (!matches) return;

    matches.forEach(m => {
        if (m.includes('บันทึก') || m.includes('ยกเลิก')) {
            if (!m.includes('var(--accent-green)') && !m.includes('#ef4444') && !m.includes('var(--accent-red)')) {
                // If it isn't green or red, it might be missed
                console.log(`WARN: Found potential mismatch in ${filePath}:`, m);
            }
        }
    });

});
