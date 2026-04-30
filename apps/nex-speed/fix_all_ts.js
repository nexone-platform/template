import fs from 'fs';

// Fix api.ts
let c = fs.readFileSync('src/services/api.ts', 'utf-8');
c = c.replace(/icon_url: string; route_path: string; is_active: boolean/g, "icon_url?: string; route_path?: string; is_active?: boolean");
c = c.replace(/Promise<\{data: LiquidType\[\], meta\?: any\}>/g, 'Promise<LiquidType[]>');
c = c.replace(/Promise<\{data: MechanicType\[\], meta\?: any\}>/g, 'Promise<MechanicType[]>');
c = c.replace(/Promise<\{data: ParkingType\[\], meta\?: any\}>/g, 'Promise<ParkingType[]>');
c = c.replace(/Promise<\{data: PartCategory\[\], meta\?: any\}>/g, 'Promise<PartCategory[]>');
c = c.replace(/Promise<\{data: PartGroup\[\], meta\?: any\}>/g, 'Promise<PartGroup[]>');
c = c.replace(/Promise<\{data: StorageType\[\], meta\?: any\}>/g, 'Promise<StorageType[]>');
c = c.replace(/Promise<\{data: UnitType\[\], meta\?: any\}>/g, 'Promise<UnitType[]>');
c = c.replace(/Promise<\{data: VehicleType\[\], meta\?: any\}>/g, 'Promise<VehicleType[]>');
c = c.replace(/Promise<\{data: MechanicExpertise\[\], meta\?: any\}>/g, 'Promise<MechanicExpertise[]>');
c = c.replace(/Promise\.resolve\(\{ data: \[\] \}\)/g, 'Promise.resolve([])');
fs.writeFileSync('src/services/api.ts', c, 'utf-8');

// Fix pages
const pages = [
  'src/pages/basic/LiquidTypePage.tsx',
  'src/pages/basic/MechanicTypePage.tsx',
  'src/pages/basic/ParkingTypePage.tsx',
  'src/pages/basic/PartGroupPage.tsx',
  'src/pages/basic/StorageTypePage.tsx',
  'src/pages/basic/UnitTypePage.tsx',
  'src/pages/basic/VehicleTypePage.tsx'
];

for(let p of pages) {
  let content = fs.readFileSync(p, 'utf-8');
  content = content.replace(/value=\{item\.status\}/g, "value={item.status || 'active'}");
  fs.writeFileSync(p, content, 'utf-8');
}

// Fix Sidebar.tsx
let s = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');
s = s.replace(/a \=\> a\.app_name/g, "(a: any) => a.app_name");
fs.writeFileSync('src/components/Sidebar.tsx', s, 'utf-8');

// Fix MaintenancePlanPage.tsx (92, 187) - parseInt
let m = fs.readFileSync('src/pages/MaintenancePlanPage.tsx', 'utf-8');
m = m.replace(/parseInt\(p\.interval_months\)/g, "parseInt(p.interval_months as unknown as string)");
m = m.replace(/parseInt\(p\.interval_km\)/g, "parseInt(p.interval_km as unknown as string)");
fs.writeFileSync('src/pages/MaintenancePlanPage.tsx', m, 'utf-8');

// Fix ParkingPage.tsx
let p = fs.readFileSync('src/pages/ParkingPage.tsx', 'utf-8');
p = p.replace(/setLocations\(res\)\;/g, "setLocations(res as any);");
fs.writeFileSync('src/pages/ParkingPage.tsx', p, 'utf-8');

// Fix exportUtils.ts
let eu = fs.readFileSync('src/utils/exportUtils.ts', 'utf-8');
eu = eu.replace(/const ws = utils\.aoa_to_sheet\(\[headers, \.\.\.rows\]\);/g, "const ws = utils.aoa_to_sheet([headers, ...rows] as any[]);");
fs.writeFileSync('src/utils/exportUtils.ts', eu, 'utf-8');
