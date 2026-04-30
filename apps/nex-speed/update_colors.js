import fs from 'fs';
const files = [
    'BrandsPage.tsx', 'PartGroupPage.tsx', 'UnitTypePage.tsx', 'LiquidTypePage.tsx', 
    'PartCategoryPage.tsx', 'StorageTypePage.tsx', 'ParkingTypePage.tsx', 'MechanicTypePage.tsx', 
    'ExpertisePage.tsx', 'ProvincesPage.tsx', 'LocationsPage.tsx', 'ContainerMechanicsPage.tsx', 
    'MechanicsPage.tsx', 'PartsShopsPage.tsx', 'SubcontractorsPage.tsx', 'DriversPage.tsx', 
    'FleetPage.tsx', 'OrdersPage.tsx', 'FinancePage.tsx', 'TransportTripsPage.tsx', 
    'StoragePage.tsx', 'ParkingPage.tsx', 'StockPartsPage.tsx', 'StockOilPage.tsx', 'MaintenancePage.tsx'
];
for(let x of files) {
  let file = 'src/pages/' + x;
  if(fs.existsSync(file)) {
      let c = fs.readFileSync(file, 'utf8');
      let m = c.match(/<tbody[\s\S]*?<\/tbody>/);
      if(m) {
        let inside = m[0];
        // Ensure we only replace fontWeight: 600 or 700 if it belongs to the Name column or key column
        let newInside = inside.replace(/fontWeight:\s*600( \}|,\s*maxWidth|\})/g, `fontWeight: 600, color: 'var(--accent-blue)'$1`);
        if(newInside !== inside) {
           c = c.replace(inside, newInside);
           fs.writeFileSync(file, c);
           console.log('Modified', x);
        }
      }
  }
}
