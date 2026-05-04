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

        // Pattern to find: await fetch(URL)
        // We replace it with: await fetch(URL, { credentials: 'include' })
        content = content.replace(/await\s+fetch\(([^,]+?)\)/g, (match, url) => {
            if (url.includes('{') || url.includes('}')) return match; // skip complex
            modified = true;
            return `await fetch(${url}, { credentials: 'include' })`;
        });

        // Pattern to find: await fetch(URL, { ... })
        // We replace it with: await fetch(URL, { credentials: 'include', ... })
        content = content.replace(/await\s+fetch\(([^,]+?),\s*\{/g, (match, url) => {
            // Check if credentials: 'include' is already there
            modified = true;
            return `await fetch(${url}, { credentials: 'include', `;
        });
        
        // Remove duplicate credentials: 'include' just in case
        content = content.replace(/credentials:\s*'include',\s*credentials:\s*'include'/g, "credentials: 'include'");

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Modified:', filePath);
        }
    }
}

processFile(componentsDir);
console.log('Done.');
