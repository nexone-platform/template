import fs from 'fs';
import path from 'path';

const dir = 'c:/Task/Nex Solution/nex-speed/frontend/src/pages/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    if (file === 'SettingsPage.tsx') continue;

    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let modified = false;

    // Check if we already imported StatusDropdown
    if (!content.includes('import StatusDropdown')) {
        // Add import
        content = content.replace(/(import [^\n]+;\n+)/, `$1import StatusDropdown from '@/components/StatusDropdown';\n`);
        modified = true;
    }

    let tbodyMatch = content.match(/<tbody[\s\S]*?<\/tbody>/);
    if (!tbodyMatch) continue;
    let tbody = tbodyMatch[0];

    let patternA = /<select[^>]*className=\{[`']status-badge \$\{statusColors\[([a-zA-Z0-9_]+)\.status\](?: \|\| 'green')?\}[`']\}[^>]*>[\s\S]*?<\/select>/g;
    if (patternA.test(tbody)) {
        // Get the loop variable from testing the pattern
        let m = [...tbody.matchAll(patternA)];
        for (let match of m) {
            let loopVar = match[1];

            // Need to figure out the setter and API for this specific match segment?
            // Actually, we can just extract the inner onChange body.
            let onChangeMatch = match[0].match(/onChange={async \([^)]+\) => \{([\s\S]*?)\}\}/);
            let onChangeContent = onChangeMatch ? onChangeMatch[1].trim() : '';
            // Change `const val = e.target.value` to `const val = e;` since the component yields the string value directly
            onChangeContent = onChangeContent.replace(/const val = e\.target\.value;/, 'const val = arguments[0];');

            // Generate options based on statusLabels mapping if possible, but actually we can generate them dynamically
            // Wait, we can pass options mapped from statusLabels object.
            // options={Object.keys(statusLabels).map(k => ({ value: k, label: statusLabels[k], color: k === 'active'||k==='completed' ? 'green' : (k==='pending'||k==='maintenance' ? 'yellow' : 'red') }))}
            
            let rep = `<StatusDropdown 
                value={${loopVar}.status}
                onChange={async (val) => { 
                    ${onChangeContent.replace('arguments[0]', 'val')} 
                }}
                options={Object.keys(statusLabels).map(k => {
                    const color = ['active','completed'].includes(k) ? 'green' : ['pending','maintenance','in_progress','on_trip','in-transit'].includes(k) ? 'yellow' : 'red';
                    return { value: k, label: statusLabels[k], color };
                })}
            />`;

            tbody = tbody.replace(match[0], rep);
        }
        modified = true;
    }

    let patternB = /<select[^>]*className=\{[`']status-badge \$\{([a-zA-Z0-9_]+)\.status === ['"]active['"] \? ['"]green['"] : ['"]inactive['"]\}[`']\}[^>]*>[\s\S]*?<\/select>/g;
    if (patternB.test(tbody)) {
        let m = [...tbody.matchAll(patternB)];
        for (let match of m) {
            let loopVar = match[1];
            let onChangeMatch = match[0].match(/onChange={async \([^)]+\) => \{([\s\S]*?)\}\}/);
            let onChangeContent = onChangeMatch ? onChangeMatch[1].trim() : '';

            let rep = `<StatusDropdown 
                value={${loopVar}.status}
                onChange={async (val) => { 
                    ${onChangeContent.replace(/const val = e\.target\.value;/, 'const val = val;')} 
                }}
            />`; // uses default options

            tbody = tbody.replace(match[0], rep);
        }
        modified = true;
    }

    // TripsPage specifically matches a separate style: 
    let patternC = /<select[^>]*className=\{[`']status-badge [^\}]+?\}[`']\}[^>]*>[\s\S]*?<\/select>/g;
    if (patternC.test(tbody) && file === 'TripsPage.tsx') {
        let m = [...tbody.matchAll(patternC)];
        for (let match of m) {
             let loopVar = 'trip';
             let onChangeMatch = match[0].match(/onChange={async \([^)]+\) => \{([\s\S]*?)\}\}/);
             let onChangeContent = onChangeMatch ? onChangeMatch[1].trim() : '';
             
             let rep = `<StatusDropdown 
                value={${loopVar}.status}
                onChange={async (val) => { 
                    ${onChangeContent.replace(/const val = e\.target\.value;/, 'const val = val;')} 
                }}
                options={[
                    { value: 'pending', label: 'รอการอนุมัติ', color: 'yellow' },
                    { value: 'in_progress', label: 'กำลังดำเนินการ', color: 'yellow' },
                    { value: 'completed', label: 'เสร็จสิ้น', color: 'green' },
                    { value: 'cancelled', label: 'ยกเลิก', color: 'red' },
                ]}
            />`;

            tbody = tbody.replace(match[0], rep);
        }
        modified = true;
    }

    if (modified) {
        content = content.replace(tbodyMatch[0], tbody);
        fs.writeFileSync(filePath, content);
        console.log('Applied StatusDropdown in', file);
    }
}
