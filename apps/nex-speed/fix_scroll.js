import fs from 'fs';
const files = ['BrandsPage.tsx', 'ProvincesPage.tsx', 'LocationsPage.tsx', 'ExpertisePage.tsx', 'ParkingTypePage.tsx', 'StorageTypePage.tsx', 'LiquidTypePage.tsx', 'PartCategoryPage.tsx', 'UnitTypePage.tsx', 'MechanicTypePage.tsx'];

files.forEach(f => {
    const p = 'src/pages/' + f;
    if (!fs.existsSync(p)) return;
    let c = fs.readFileSync(p, 'utf8');
    if (!c.includes('620px')) {
        c = c.replace('<div className="data-table-wrapper">', '<div className="data-table-wrapper" style={{ maxHeight: \'620px\', overflowY: \'auto\' }}>');
        fs.writeFileSync(p, c);
        console.log('Fixed scroll in', f);
    }
});
