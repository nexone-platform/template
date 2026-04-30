import fs from 'fs';

let c = fs.readFileSync('src/pages/ProvincesPage.tsx', 'utf8');

c = c.replace('<div className="data-table-wrapper">', '<div className="data-table-wrapper" style={{ maxHeight: \'620px\', overflowY: \'auto\' }}>');

let oldPgStart = c.indexOf('{/* Pagination */}');
let oldPgEnd = c.indexOf('{/* Add/Edit Modal */}');

if (oldPgStart > -1 && oldPgEnd > -1) {
    let oldPg = c.substring(oldPgStart, oldPgEnd);
    c = c.replace(oldPg, '{/* Pagination */}\n                <Pagination \n                    currentPage={currentPage} pageSize={pageSize} totalItems={filtered.length}\n                    setCurrentPage={setCurrentPage} setPageSize={setPageSize}\n                />\n            </div>\n\n            ');
}

c = c.replace('import { Search', 'import Pagination from \'@/components/Pagination\';\nimport { Search');
c = c.replace('const pageSize = 15;', 'const [pageSize, setPageSize] = useState(15);');

fs.writeFileSync('src/pages/ProvincesPage.tsx', c);
console.log('Fixed ProvincesPage');
