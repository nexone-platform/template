import fs from 'fs';
const dir = 'c:/Task/Nex Solution/nex-speed/frontend/src/pages/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const f of files) {
    let p = dir + f;
    let c = fs.readFileSync(p, 'utf8');
    
    if (c.includes('<StatusDropdown') && !c.includes('import StatusDropdown')) {
        // Insert right after the first line or right before the first import
        // Find the first line after `import React`
        let replaceMatched = false;
        c = c.replace(/import [^\n]+\n/, (match) => {
            replaceMatched = true;
            return match + "import StatusDropdown from '@/components/StatusDropdown';\n";
        });
        
        if (!replaceMatched) {
            c = "import StatusDropdown from '@/components/StatusDropdown';\n" + c;
        }

        fs.writeFileSync(p, c);
        console.log('Fixed import in', f);
    }
}
