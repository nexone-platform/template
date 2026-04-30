import fs from 'fs';

const files = fs.readdirSync('c:/Task/Nex Solution/nex-speed/frontend/src/pages/').filter(f => f.endsWith('.tsx'));

const apiMapping = {
    'FleetPage.tsx': 'updateVehicle',
    'DriversPage.tsx': 'updateDriver',
    'OrdersPage.tsx': 'updateOrder',
    'TripsPage.tsx': 'updateTrip',
    'TransportTripsPage.tsx': 'updateTrip',
    'FinancePage.tsx': 'updateInvoice',
    'SubcontractorsPage.tsx': 'updateSubcontractor',
    'MaintenancePage.tsx': 'updateMaintenanceRecord',
    'MechanicsPage.tsx': 'updateMechanic',
    'ContainerMechanicsPage.tsx': 'updateContainerMechanic',
    'PartsShopsPage.tsx': 'updatePartsShop',
    'StockPartsPage.tsx': 'updateStockPart',
    'StockOilPage.tsx': 'updateStockOil',
    'StoragePage.tsx': 'updateStorageLocation',
    'ParkingPage.tsx': 'updateParkingLot',
    'MaintenancePlanPage.tsx': 'updateMaintenancePlan' // might not exist
};

let missingMethods = [];

for (const f of files) {
    let p = 'c:/Task/Nex Solution/nex-speed/frontend/src/pages/' + f;
    let c = fs.readFileSync(p, 'utf8');

    let apiName = apiMapping[f];
    if (apiName && c.includes('<StatusDropdown')) {
        let tbMatch = c.match(/<tbody[\s\S]*?<\/tbody>/);
        if(!tbMatch) continue;
        let tb = tbMatch[0];

        let loopVarMatch = tb.match(/value=\{([a-zA-Z0-9_]+)\.status\}/);
        if (!loopVarMatch) continue;
        let loopVar = loopVarMatch[1];

        let modified = false;

        let pattern = /(onChange=\{async \(val\) => \{)([\s\S]*?)(\}\})/g;
        tb = tb.replace(pattern, (match, p1, p2, p3) => {
           if (p2.includes('api.update')) return match; 
           let localP2 = p2.replace(/arguments\[0\]/g, 'val');
           let apiCall = `try { await api.${apiName}(${loopVar}.id, { ...${loopVar}, status: val } as any); } catch(e){ console.error(e); }`;
           modified = true;
           return p1 + '\n                ' + localP2.trim() + '\n                ' + apiCall + '\n            ' + p3;
        });

        if (modified) {
            c = c.replace(tbMatch[0], tb);
            fs.writeFileSync(p, c);
            console.log('Injected API update for', f);
        }
    }
}
