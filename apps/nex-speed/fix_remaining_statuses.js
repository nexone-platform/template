import fs from 'fs';

let content = fs.readFileSync('c:/Task/Nex Solution/nex-speed/frontend/src/pages/StoragePage.tsx', 'utf8');
let tbodyMatch = content.match(/<tbody[\s\S]*?<\/tbody>/);
if (tbodyMatch) {
  let tbody = tbodyMatch[0];
  let pattern = /<span[^>]*className=\{[`']status-badge [^}]+\}[`']\}>[\s\S]*?<\/span>/g;
  let rep = `<select 
            className={\`status-badge \${statusColors[r.status] || 'green'}\`}
            value={r.status}
            onChange={async (e) => {
                const val = e.target.value;
                setData(prev => prev.map(x => x.id === r.id ? { ...x, status: val } : x));
            }}
            style={{ appearance: 'none', border: 'none', background: 'transparent', textAlign: 'center', cursor: 'pointer', outline: 'none', fontWeight: 600, padding: '4px 8px' }}
        >
            {Object.keys(statusLabels).map(k => (
                <option key={k} value={k}>{statusLabels[k]}</option>
            ))}
        </select>`;
  let newTb = tbody.replace(pattern, rep);
  content = content.replace(tbody, newTb);
  fs.writeFileSync('c:/Task/Nex Solution/nex-speed/frontend/src/pages/StoragePage.tsx', content);
  console.log('Fixed StoragePage.tsx');
}

content = fs.readFileSync('c:/Task/Nex Solution/nex-speed/frontend/src/pages/TransportTripsPage.tsx', 'utf8');
tbodyMatch = content.match(/<tbody[\s\S]*?<\/tbody>/);
if (tbodyMatch) {
  let tbody = tbodyMatch[0];
  let pattern = /<span[^>]*className=\{[`']status-badge [^}]+\}[`']\}>[\s\S]*?<\/span>/g;
  let rep = `<select 
            className={\`status-badge \${statusColors[trip.status] || 'inactive'}\`}
            value={trip.status}
            onChange={async (e) => {
                const val = e.target.value;
                setTrips(prev => prev.map(x => x.id === trip.id ? { ...x, status: val } : x));
            }}
            style={{ appearance: 'none', border: 'none', background: 'transparent', textAlign: 'center', cursor: 'pointer', outline: 'none', fontWeight: 600, padding: '4px 8px' }}
        >
            {Object.keys(statusLabels).map(k => (
                <option key={k} value={k}>{statusLabels[k]}</option>
            ))}
        </select>`;
  let newTb = tbody.replace(pattern, rep);
  content = content.replace(tbody, newTb);
  fs.writeFileSync('c:/Task/Nex Solution/nex-speed/frontend/src/pages/TransportTripsPage.tsx', content);
  console.log('Fixed TransportTripsPage.tsx');
}

// TripsPage.tsx
content = fs.readFileSync('c:/Task/Nex Solution/nex-speed/frontend/src/pages/TripsPage.tsx', 'utf8');
tbodyMatch = content.match(/<tbody[\s\S]*?<\/tbody>/);
if (tbodyMatch) {
  let tbody = tbodyMatch[0];
  let pattern = /<span[^>]*className=\{[`']status-badge [^}]+\}[`']\}>[\s\S]*?<\/span>/g;
  let rep = `<select 
            className={\`status-badge \${trip.status === 'completed' ? 'green' : trip.status === 'in_progress' ? 'yellow' : 'inactive'}\`}
            value={trip.status}
            onChange={async (e) => {
                const val = e.target.value;
                setTrips(prev => prev.map(x => x.id === trip.id ? { ...x, status: val } : x));
            }}
            style={{ appearance: 'none', border: 'none', background: 'transparent', textAlign: 'center', cursor: 'pointer', outline: 'none', fontWeight: 600, padding: '4px 8px' }}
        >
            <option value="pending">รอการอนุมัติ</option>
            <option value="in_progress">กำลังดำเนินการ</option>
            <option value="completed">เสร็จสิ้น</option>
            <option value="cancelled">ยกเลิก</option>
        </select>`;
  let newTb = tbody.replace(pattern, rep);
  content = content.replace(tbody, newTb);
  fs.writeFileSync('c:/Task/Nex Solution/nex-speed/frontend/src/pages/TripsPage.tsx', content);
  console.log('Fixed TripsPage.tsx');
}
