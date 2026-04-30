import fs from 'fs';

let c = fs.readFileSync('src/pages/LocationsPage.tsx', 'utf8');

c = c.replace(/form\.name ===/g, 'form.name?.trim() ===').replace(/!form\.name/g, '!form.name?.trim()');

c = c.replace('<div className="data-table-wrapper" style={{ maxHeight: \'calc(100vh - 340px)\', overflowY: \'auto\' }}>', '<div className="data-table-wrapper" style={{ maxHeight: \'620px\', overflowY: \'auto\' }}>');

c = c.replace('import { Search', 'import Pagination from \'@/components/Pagination\';\nimport { Search');

c = c.replace('const pageSize = 10;', 'const [pageSize, setPageSize] = useState(10);');
let pIdx = c.indexOf('[pageSize, setPageSize]');
if (!c.includes('currentPage')) {
    c = c.substring(0, pIdx) + "const [currentPage, setCurrentPage] = useState(1);\n    " + c.substring(pIdx);
}

// Slice logic
c = c.replace('const paged = filtered.slice(0, 50);', `const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);`);

c = c.replace(/filtered\.map\(/g, 'paged.map(');

let scoreCards = `
            {/* Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                {[
                    { key: 'all', label: 'ทั้งหมด', color: '#3b82f6', icon: <MapPin size={22} /> },
                    { key: 'origin', label: 'ต้นทาง', color: '#f59e0b', icon: <MapPin size={22} /> },
                    { key: 'destination', label: 'ปลายทาง', color: '#10b981', icon: <MapPin size={22} /> },
                    { key: 'both', label: 'ทั้งสอง', color: '#8b5cf6', icon: <MapPin size={22} /> },
                ].map(c => {
                    let count = locations.length;
                    if (c.key !== 'all') count = locations.filter(l => l.type === c.key).length;
                    return (
                        <div key={c.key} style={{
                            display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '14px',
                            background: \`\${c.color}12\`, border: '1px solid transparent',
                        }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: \`\${c.color}18\`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>{c.icon}</div>
                            <div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2px' }}>{c.label}</div>
                                <span style={{ fontSize: '22px', fontWeight: 800, color: c.color }}>{count}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>จุด</span>
                            </div>
                        </div>
                    );
                })}
            </div>
`;

if (!c.includes('Score Cards')) {
   c = c.replace('{/* Toolbar */}', scoreCards + '\n            {/* Toolbar */}');
}

let tableIdx = c.indexOf('</table>');
if (tableIdx > -1) {
    let divAfter = c.indexOf('</div>', tableIdx);
    if (!c.includes('<Pagination')) {
        let beforePag = c.substring(0, divAfter + 6);
        let afterPag = c.substring(divAfter + 6);
        c = beforePag + '\n                {/* Pagination */}\n                <Pagination \n                    currentPage={currentPage} pageSize={pageSize} totalItems={filtered.length}\n                    setCurrentPage={setCurrentPage} setPageSize={setPageSize}\n                />\n' + afterPag;
    }
}

fs.writeFileSync('src/pages/LocationsPage.tsx', c);
console.log('Fixed LocationsPage');
