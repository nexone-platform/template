const fs = require('fs');

const apiMapping = {
    'FleetPage.tsx': ['updateVehicle', 'setVehicles'],
    'DriversPage.tsx': ['updateDriver', 'setDrivers'],
    'OrdersPage.tsx': ['updateOrder', 'setOrders'],
    'TripsPage.tsx': ['updateTrip', 'setTrips'],
    'TransportTripsPage.tsx': ['updateTrip', 'setTrips'],
    'FinancePage.tsx': ['updateInvoice', 'setInvoices'],
    'SubcontractorsPage.tsx': ['updateSubcontractor', 'setSubcontractors'],
    'MaintenancePage.tsx': ['updateMaintenanceRecord', 'setRecords'],
    'MechanicsPage.tsx': ['updateMechanic', 'setMechanics'],
    'ContainerMechanicsPage.tsx': ['updateContainerMechanic', 'setMechanics'],
    'PartsShopsPage.tsx': ['updatePartsShop', 'setShops'],
    'StockPartsPage.tsx': ['updateStockPart', 'setParts'],
    'StockOilPage.tsx': ['updateStockOil', 'setStock'],
    'StoragePage.tsx': ['updateStorageLocation', 'setLocations'],
    'ParkingPage.tsx': ['updateParkingLot', 'setParkingLots'],
    'PartGroupPage.tsx': ['updatePartGroup', 'setData'],
    'PartCategoryPage.tsx': ['updatePartCategory', 'setData'],
    'UnitTypePage.tsx': ['updateUnitType', 'setData'],
    'LiquidTypePage.tsx': ['updateLiquidType', 'setData'],
    'StorageTypePage.tsx': ['updateStorageType', 'setData'],
    'ProvincesPage.tsx': ['updateProvince', 'setData'],
    'LocationsPage.tsx': ['updateLocation', 'setLocations'],
    'SettingsPage.tsx': ['updateSystemUser', 'setUsers']
};

const dir = 'c:/Task/Nex Solution/nex-speed/frontend/src/pages/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const f of files) {
    let p = dir + f;
    let c = fs.readFileSync(p, 'utf8');
    let changed = false;

    // Pattern for spans: <span className={`status-badge ${statusColors[item.status]}`}>{statusLabels[item.status]}</span>
    // Sometimes it has || 'green'. Sometimes it has style={{ ... }}.
    const spanRegex = /<span[^>]*className=\{?[\`\"'](?:status-badge)[^\>]*\>[\s\S]*?<\/span>/g;
    
    c = c.replace(spanRegex, (match) => {
        // extract variable
        let varsMatch = match.match(/statusColors\[([a-zA-Z0-9_\.]+)\]/);
        if (!varsMatch && f === 'SettingsPage.tsx') varsMatch = match.match(/u\.isActive/);
        
        if (!varsMatch) {
            // maybe no statusColors map, try to extract from {statusLabels[var]}
            let labMatch = match.match(/statusLabels\[([a-zA-Z0-9_\.]+)\]/);
            if (labMatch) varsMatch = labMatch;
        }

        if (!varsMatch) return match; // skip

        let valVar = f === 'SettingsPage.tsx' && varsMatch[0] === 'u.isActive' ? "u.isActive ? 'active' : 'inactive'" : varsMatch[1];
        
        let loopVarMatch = valVar.match(/^([^.]+)\.status$/);
        let loopVar = loopVarMatch ? loopVarMatch[1] : (valVar.includes('.') ? valVar.split('.')[0] : 'item');

        if (f === 'SettingsPage.tsx' && valVar.includes('isActive')) {
           loopVar = 'u';
        }

        changed = true;
        
        let apiInfo = apiMapping[f];
        let apiCall = '';
        let setStateCall = '';
        if (apiInfo) {
            let apiFunc = apiInfo[0];
            let setter = apiInfo[1];
            if (f === 'SettingsPage.tsx') {
               setStateCall = `${setter}(prev => prev.map(x => x.id === ${loopVar}.id ? { ...x, isActive: newValue === 'active' } : x));`;
               apiCall = `try { await api.${apiFunc}(${loopVar}.id, { ...${loopVar}, isActive: newValue === 'active' } as any); } catch(err) { console.error(err); }`;
            } else {
               setStateCall = `${setter}(prev => prev.map(x => x.id === ${loopVar}.id ? { ...x, status: newValue } : x));`;
               apiCall = `try { await api.${apiFunc}(${loopVar}.id, { ...${loopVar}, status: newValue } as any); } catch(err) { console.error(err); }`;
            }
        }

        let optionsArr = `[
                        { value: 'active', label: 'ใช้งาน', color: 'green' },
                        { value: 'inactive', label: 'ปิดใช้งาน', color: 'red' }
                    ]`;
        
        if (match.includes('statusLabels') || c.includes('const statusLabels')) {
            optionsArr = `Object.keys(statusLabels).map(k => ({ 
                        value: k, 
                        label: statusLabels[k as keyof typeof statusLabels], 
                        color: (['active','completed','available', 'approved'].includes(k) ? 'green' : (['inactive','cancelled', 'rejected'].includes(k) ? 'red' : 'yellow')) as any
                    }))`;
        }

        return `<StatusDropdown 
                    value={${valVar}}
                    onChange={async (newValue) => {
                        ${setStateCall}
                        ${apiCall}
                    }}
                    options={${optionsArr}}
                />`;
    });

    if (changed) {
        if (!c.includes('import StatusDropdown')) {
            c = c.replace(/(import [^\n]+;\n)/, `$1import StatusDropdown from '@/components/StatusDropdown';\n`);
        }
        fs.writeFileSync(p, c);
        console.log('Upgraded to dropdown with API:', f);
    }
}
