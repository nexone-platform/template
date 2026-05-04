const fs = require('fs');
const path = require('path');

const appsDir = path.join('c:', 'Task', 'Template', 'apps');

const replacePatterns = [
  // 1. || 'http://localhost:xxxx/api' -> || ''
  {
    regex: /\|\|\s*['"`]http:\/\/localhost:\d+(?:\/[^'"`]*)?['"`]/g,
    replace: `|| ''`
  },
  // 2. getEndpoint('Name', 'http://localhost:xxxx/api') -> getEndpoint('Name', '')
  {
    regex: /(getEndpoint\([^,]+,\s*)['"`]http:\/\/localhost:\d+(?:\/[^'"`]*)?['"`]/g,
    replace: `$1''`
  },
  // 3. const API_BASE = 'http://localhost:xxxx/api/v1'; -> const API_BASE = process.env.NEXT_PUBLIC_API_URL || import.meta.env?.VITE_API_URL || '';
  {
    regex: /(const\s+[A-Za-z0-9_]+\s*=\s*)['"`]http:\/\/localhost:\d+(?:\/[^'"`]*)?['"`]\s*;/g,
    replace: `$1process.env.NEXT_PUBLIC_API_URL || (typeof import !== 'undefined' && import.meta && import.meta.env ? import.meta.env.VITE_API_URL : '') || '';`
  },
  // 4. menuApiUrl="http://localhost:xxxx/api" -> menuApiUrl={process.env.NEXT_PUBLIC_CORE_API_URL || ''}
  {
    regex: /menuApiUrl=['"`]http:\/\/localhost:\d+(?:\/[^'"`]*)?['"`]/g,
    replace: `menuApiUrl={process.env.NEXT_PUBLIC_CORE_API_URL || ''}`
  },
  // 5. : 'http://localhost:xxxx/api/v1'; (Ternary fallback)
  {
    regex: /:\s*['"`]http:\/\/localhost:\d+(?:\/[^'"`]*)?['"`]/g,
    replace: `: ''`
  }
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      // Skip node_modules and .next
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(appsDir);
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  replacePatterns.forEach(pattern => {
    content = content.replace(pattern.regex, pattern.replace);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
    changedCount++;
  }
});

console.log(`\nFinished! Modified ${changedCount} files.`);
