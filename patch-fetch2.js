const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'apps/nex-core/src/components');

function processFile(filePath) {
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
        fs.readdirSync(filePath).forEach(file => processFile(path.join(filePath, file)));
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Pattern to find: await fetch(...) with only 1 argument
        content = content.replace(/await\s+fetch\((`[^`]+`|'[^']+'|"[^"]+"|[^,()]+)\)/g, (match, url) => {
            modified = true;
            return `await fetch(${url}, { credentials: 'include' })`;
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Modified 1-arg fetch:', filePath);
        }
    }
}

processFile(componentsDir);
console.log('Done.');
