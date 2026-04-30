import fs from 'fs';
let c = fs.readFileSync('c:/Task/Nex Solution/nex-speed/frontend/src/services/api.ts', 'utf8');

const items = [
   ['UnitType', 'unit-types', 'getUnitTypes', 'createUnitType', 'updateUnitType', 'deleteUnitType'],
   ['ParkingType', 'parking-types', 'getParkingTypes', 'createParkingType', 'updateParkingType', 'deleteParkingType'],
   ['StorageType', 'storage-types', 'getStorageTypes', 'createStorageType', 'updateStorageType', 'deleteStorageType'],
   ['PartGroup', 'part-groups', 'getPartGroups', 'createPartGroup', 'updatePartGroup', 'deletePartGroup'],
   ['PartCategory', 'part-categories', 'getPartCategories', 'createPartCategory', 'updatePartCategory', 'deletePartCategory'],
   ['LiquidType', 'liquid-types', 'getLiquidTypes', 'createLiquidType', 'updateLiquidType', 'deleteLiquidType'],
   ['MechanicExpertise', 'mechanic-expertise', 'getMechanicExpertises', 'createMechanicExpertise', 'updateMechanicExpertise', 'deleteMechanicExpertise'],
   ['MechanicType', 'mechanic-types', 'getMechanicTypes', 'createMechanicType', 'updateMechanicType', 'deleteMechanicType']
];

let added = [];
for (const [itype, path, getm, createm, updatem, deletem] of items) {
    if (!c.includes(getm + ':')) {
        added.push(`
    // ${itype}
    ${getm}: () => fetchAPI<any>('/${path}'),
    ${createm}: (r: any) => postAPI('/${path}', r),
    ${updatem}: (id: number, r: any) => putAPI(\`/${path}/\${id}\`, r),
    ${deletem}: (id: number) => deleteAPI(\`/${path}/\${id}\`),
`);
    }
}

if (added.length > 0) {
    c = c.replace(/(deleteSystemUser:[^\n]+\n)/, `$1\n${added.join('')}\n`);
    fs.writeFileSync('c:/Task/Nex Solution/nex-speed/frontend/src/services/api.ts', c);
    console.log('Fixed CRUD APIs');
} else {
    console.log('Already there');
}
