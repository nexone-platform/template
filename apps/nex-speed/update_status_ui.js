import fs from 'fs';
import path from 'path';

const dir = 'c:/Task/Nex Solution/nex-speed/frontend/src/pages/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    if (file === 'SettingsPage.tsx') continue; // Skip settings page as it uses isActive

    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Identify Main Setter (e.g., setBrands, setData, setDrivers)
    // We look for the common `useState<XXX[]>` line
    let setterMatch = content.match(/const \[([a-zA-Z0-9_]+),\s*(set[a-zA-Z0-9_]+)\]\s*=\s*useState<(?:[^>]+)\[\]>\(\[\]\)/);
    let setter = setterMatch ? setterMatch[2] : null;

    if (!setter && content.includes('setVehicles')) setter = 'setVehicles';
    if (!setter && content.includes('setDrivers')) setter = 'setDrivers';
    if (!setter && content.includes('setOrders')) setter = 'setOrders';

    // 2. Identify API Update Call
    let apiUpdateMatch = content.match(/api\.update([a-zA-Z0-9]+)\(/);
    let apiUpdate = apiUpdateMatch ? `api.update${apiUpdateMatch[1]}` : null;

    // 3. Find the loop variable in tbody
    let tbodyMatch = content.match(/<tbody[\s\S]*?<\/tbody>/);
    if (!tbodyMatch) continue;
    let tbody = tbodyMatch[0];

    // Find what loop variable is used before `.status`
    let statVarMatch = tbody.match(/([a-zA-Z0-9_]+)\.status/);
    if (!statVarMatch) continue;
    let loopVar = statVarMatch[1]; // e.g. 'r', 'inv', 'trip'

    let modified = false;

    // Pattern A Replacement: statusColors
    const patternA = new RegExp(`<span[^>]*className=\\{[\`']status-badge \\\\?\\$\\{statusColors\\[${loopVar}\\.status\\]\\}.*?<\\/span>`, 'g');
    if (patternA.test(tbody)) {
        let replacementA = `<select 
            className={\`status-badge \${statusColors[${loopVar}.status] || ''}\`}
            value={${loopVar}.status}
            onChange={async (e) => {
                const val = e.target.value;
                ${setter ? `${setter}(prev => prev.map(x => x.id === ${loopVar}.id ? { ...x, status: val } : x));` : ''}
                ${apiUpdate ? `try { await ${apiUpdate}(${loopVar}.id, { ...${loopVar}, status: val }); } catch(err){}` : ''}
            }}
            style={{ appearance: 'none', border: 'none', background: 'transparent', textAlign: 'center', cursor: 'pointer', outline: 'none', fontWeight: 600, padding: '4px 8px' }}
        >
            {Object.keys(statusLabels).map(k => (
                <option key={k} value={k}>{statusLabels[k]}</option>
            ))}
        </select>`;
        tbody = tbody.replace(patternA, replacementA);
        modified = true;
    }

    // Pattern B Replacement: active / inactive
    const patternB = new RegExp(`<span[^>]*className=\\{[\`']status-badge \\\\?\\$\\{${loopVar}\\.status === ['"]active['"] \\? ['"]green['"] : ['"]inactive['"]\\}[\`']\\}>[\\s\\S]*?<\\/span>`, 'g');
    if (patternB.test(tbody)) {
        let replacementB = `<select 
            className={\`status-badge \${${loopVar}.status === 'active' ? 'green' : 'inactive'}\`}
            value={${loopVar}.status}
            onChange={async (e) => {
                const val = e.target.value;
                ${setter ? `${setter}(prev => prev.map(x => x.id === ${loopVar}.id ? { ...x, status: val } : x));` : ''}
                ${apiUpdate ? `try { await ${apiUpdate}(${loopVar}.id, { ...${loopVar}, status: val }); } catch(err){}` : ''}
            }}
            style={{ appearance: 'none', border: 'none', background: 'transparent', textAlign: 'center', cursor: 'pointer', outline: 'none', fontWeight: 600, padding: '4px 8px' }}
        >
            <option value="active">✅ ใช้งาน</option>
            <option value="inactive">⛔ เลิกใช้งาน</option>
        </select>`;
        tbody = tbody.replace(patternB, replacementB);
        modified = true;
    }

    if (modified) {
        content = content.replace(tbodyMatch[0], tbody);
        fs.writeFileSync(filePath, content);
        console.log('Updated Status Dropdown in', file, '| Setter:', setter, '| API:', apiUpdate);
    }
}
