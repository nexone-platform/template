import fs from 'fs';
const files = ['ExpertisePage.tsx', 'LiquidTypePage.tsx', 'MechanicTypePage.tsx', 'ParkingTypePage.tsx', 'PartCategoryPage.tsx', 'StorageTypePage.tsx', 'UnitTypePage.tsx'];

files.forEach(f => {
    const p = 'src/pages/' + f;
    if (!fs.existsSync(p)) return;
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace("{/* Modals */}\n                        {modal === 'view'", "{/* Modals */}\n            {modal && (\n                <div className=\"modal-overlay\" onClick={() => setModal(null)}>\n                    <div className=\"modal\" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>\n                        {modal === 'view'");
    fs.writeFileSync(p, c);
    console.log('Fixed', f);
});
