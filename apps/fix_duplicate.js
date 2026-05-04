const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it has the duplicate
    if (content.includes('configs?.pageRecordDefault || configs?.pageRecordDefault ||')) {
        content = content.replace(/configs\?\.pageRecordDefault \|\| configs\?\.pageRecordDefault \|\|/g, 'configs?.pageRecordDefault ||');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
        return 1;
    }
    
    return 0;
}

function walkDir(dir) {
    let patchedCount = 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            patchedCount += walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            patchedCount += processFile(fullPath);
        }
    }
    return patchedCount;
}

const total = walkDir(path.join(__dirname, 'nex-speed/src')) + 
              walkDir(path.join(__dirname, 'nex-force/src')) + 
              walkDir(path.join(__dirname, 'nex-stock/src')) +
              walkDir(path.join(__dirname, 'nex-core/src'));

console.log(`Total fixed: ${total}`);
