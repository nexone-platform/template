import fs from 'fs';
import path from 'path';
const dir = 'c:/Task/Nex Solution/nex-speed/frontend/src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (let file of files) {
    let currPath = path.join(dir, file);
    let content = fs.readFileSync(currPath, 'utf8');
    let original = content;

    // RULE 1: Fix ID column
    // The typical structure is: paged.map(r => ... ) or paged.map((r, idx) => ...)
    // If it's paged.map(r => (
    if (content.match(/paged\.map\(\s*(\w+)\s*=>/)) {
        content = content.replace(/paged\.map\(\s*(\w+)\s*=>/g, 'paged.map(($1, i) =>');
    }
    
    // Now replace {r.id} or {b.id} or {v.id} in the first <td> with {(safePage - 1) * pageSize + i + 1}
    // Only if it's the <td> that is the ID column. Let's look for {X.id} right after <Hash .../>
    content = content.replace(/(<Hash[^>]*>)\s*\{([a-zA-Z0-9_]+)\.id\}/g, '$1{(safePage - 1) * pageSize + i + 1}');

    // If there's <td><span ...><Hash />{X.id}</span></td>, it gets caught.
    // What about plain <td>{b.id}</td> where the header is `#` or `ID`?
    // Let's manually review or replace simple ones.
    
    // RULE 2: Move search bar next to the Add button.
    // We look for a topbar-search div followed eventually by <div style={{ flex: 1 }} />
    // Basically we want to make sure <div style={{ flex: 1 }} /> is BEFORE <div className="topbar-search"
    // Also, handle the case where "ทั้งหมด X รายการ" is after the <div style={{ flex: 1 }} />
    // Let's just find:
    // <div className="topbar-search" ...> ... </div>
    // \n
    // <div style={{ flex: 1 }} />
    // \n
    // <span ...> ทั้งหมด {filtered...</span>
    
    // A more general regex:
    // Capture group 1: the search div
    // Capture group 2: the flex: 1 div and maybe span
    const searchRegex = /(<div[^>]*className=["']topbar-search["'][^>]*>[\s\S]*?<\/div>\s*)(<div[^>]*style=\{\{\s*flex:\s*1\s*\}\}\s*\/>)/;
    if (searchRegex.test(content)) {
        content = content.replace(searchRegex, '$2\n                $1');
    }

    // if `<div style={{ flex: 1 }} />` is between search and the count text:
    const searchRegex2 = /(<div[^>]*className=["']topbar-search["'][^>]*>[\s\S]*?<\/div>)\s*(<div[^>]*style=\{\{\s*flex:\s*1\s*\}\}\s*\/>)\s*(<span[^>]*>.*?<\/span>)/;
    if (searchRegex2.test(content)) {
        content = content.replace(searchRegex2, '$2\n                $3\n                $1');
    }

    // Try a bigger match if the above didn't catch the exact structure:
    const searchRegex3 = /(<div[^>]*className=["']topbar-search["'][^>]*>[\s\S]*?<\/div>)\s*(<div[^>]*style=\{\{\s*flex:\s*1\s*\}\}\s*\/>)/;
    if (searchRegex3.test(content)) {
        // Just swap them
        content = content.replace(searchRegex3, '$2\n                $1');
    }

    if (content !== original) {
        fs.writeFileSync(currPath, content);
        console.log('Modified ' + file);
    }
}
