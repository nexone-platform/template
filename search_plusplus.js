const fs = require('fs');
const path = require('path');

function searchInDir(dir, term) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      searchInDir(fullPath, term);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(term)) {
        console.log(`Found in: ${fullPath}`);
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes(term)) {
            console.log(`Line ${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchInDir('c:\\Task\\Template\\apps\\nex-core\\src', '++');
