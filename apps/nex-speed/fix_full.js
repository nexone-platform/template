import fs from 'fs';

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
    'PartGroupPage.tsx': 'updatePartGroup',
    'PartCategoryPage.tsx': 'updatePartCategory',
    'UnitTypePage.tsx': 'updateUnitType',
    'LiquidTypePage.tsx': 'updateLiquidType',
    'StorageTypePage.tsx': 'updateStorageType',
    'ProvincesPage.tsx': 'updateProvince',
    'LocationsPage.tsx': 'updateLocation',
    'SettingsPage.tsx': 'updateSystemUser'
};

const dir = 'c:/Task/Nex Solution/nex-speed/frontend/src/pages/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const f of files) {
    let changed = false;
    let p = dir + f;
    let c = fs.readFileSync(p, 'utf8');

    // Remove old select tags
    const selectRegex = /<select[\s\S]*?className=\{?[\`\"'](?:status-badge)[^\>]*\>[\s\S]*?(?:<\/select>)/g;
    c = c.replace(selectRegex, (match) => {
        let valueMatch = match.match(/value=\{([^\}]+)\}/);
        let valVar = valueMatch ? valueMatch[1] : 'null';
        
        // Skip filter dropdowns or unrelated statuses
        if (!valVar.includes('.') && f !== 'SettingsPage.tsx') {
            return match; // Skip this one!
        }
        
        changed = true;

        let loopVarMatch = valVar.match(/^([^.]+)\.status$/);
        let loopVar = loopVarMatch ? loopVarMatch[1] : (valVar.includes('.') ? valVar.split('.')[0] : 'item');

        let isSettings = f === 'SettingsPage.tsx';
        if (isSettings && valVar.includes('isActive')) {
           loopVar = valVar.split('.')[0];
        }

        let onChangeMatch = match.match(/onChange=\{async\s*\(e\)\s*=>\s*\{([\s\S]*?)\}\}/);
        let onChangeBody = '';
        if (onChangeMatch) {
            onChangeBody = onChangeMatch[1].replace(/const val = e.target.value;/g, '').replace(/val/g, 'newValue');
            // Check if it already has api.update
            if (!onChangeBody.includes('api.update')) {
               let apiFunc = apiMapping[f];
               if (apiFunc) {
                  if (isSettings) {
                      onChangeBody += `\n                            try { await api.${apiFunc}(${loopVar}.id, { ...${loopVar}, isActive: newValue === 'active' } as any); } catch(err) { console.error(err); }`;
                  } else {
                      onChangeBody += `\n                            try { await api.${apiFunc}(${loopVar}.id, { ...${loopVar}, status: newValue } as any); } catch(err) { console.error(err); }`;
                  }
               }
            }
        } else {
            let apiFunc = apiMapping[f];
            if (apiFunc) {
               onChangeBody = `\n                            try { await api.${apiFunc}(${loopVar}.id, { ...${loopVar}, status: newValue } as any); } catch(err) { console.error(err); }`;
            }
        }

        // We need to parse options 
        let optionsArr = `[
                        { value: 'active', label: 'ใช้งาน', color: 'green' },
                        { value: 'inactive', label: 'ปิดใช้งาน', color: 'red' }
                    ]`;
        
        if (match.includes('Object.keys(statusLabels)')) {
            // we have statusLabels somewhere
            optionsArr = `Object.keys(statusLabels).map(k => ({ 
                        value: k, 
                        label: statusLabels[k as keyof typeof statusLabels], 
                        color: (['active','completed','available', 'approved'].includes(k) ? 'green' : (['inactive','cancelled', 'rejected'].includes(k) ? 'red' : 'yellow')) as any
                    }))`;
        }

        return `<StatusDropdown 
                    value={${valVar}}
                    onChange={async (newValue) => {${onChangeBody}
                    }}
                    options={${optionsArr}}
                />`;
    });

    if (changed) {
        if (!c.includes('import StatusDropdown')) {
            c = c.replace(/(import [^\n]+;\n)/, `$1import StatusDropdown from '@/components/StatusDropdown';\n`);
        }
        fs.writeFileSync(p, c);
        console.log('Fixed full select for', f);
    }
}
