import fs from 'fs';
let p = 'c:/Task/Nex Solution/nex-speed/frontend/src/app/page.tsx';
let c = fs.readFileSync(p, 'utf8');

const missingCases = `
    case 'maintenance-plan': return <MaintenancePlanPage />;
    case 'maintenance-schedule': return <MaintenanceSchedulePage />;
    case 'mechanic-type': return <MechanicTypePage />;
    case 'expertise': return <ExpertisePage />;
    case 'parking-type': return <ParkingTypePage />;
    case 'part-category': return <PartCategoryPage />;
    case 'part-group': return <PartGroupPage />;
    case 'liquid-type': return <LiquidTypePage />;
    case 'unit-type': return <UnitTypePage />;
    case 'storage-type': return <StorageTypePage />;`;

if (!c.includes("case 'unit-type'")) {
    c = c.replace(/(case 'locations': return <LocationsPage \/>;)/, `$1${missingCases}`);
}

const missingImports = `
import MaintenancePlanPage from '@/pages/MaintenancePlanPage';
import MaintenanceSchedulePage from '@/pages/MaintenanceSchedulePage';
import MechanicTypePage from '@/pages/MechanicTypePage';
import ExpertisePage from '@/pages/ExpertisePage';
import ParkingTypePage from '@/pages/ParkingTypePage';
import PartCategoryPage from '@/pages/PartCategoryPage';
import PartGroupPage from '@/pages/PartGroupPage';
import LiquidTypePage from '@/pages/LiquidTypePage';
import UnitTypePage from '@/pages/UnitTypePage';
import StorageTypePage from '@/pages/StorageTypePage';
`;

if (!c.includes("import UnitTypePage")) {
    c = c.replace(/(import LocationsPage[^\n]+\n)/, `$1${missingImports}`);
}

fs.writeFileSync(p, c);
console.log('Fixed page.tsx');
