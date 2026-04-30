import fs from 'fs';
const files = [
  'ExpertisePage.tsx', 'LiquidTypePage.tsx', 'ParkingTypePage.tsx', 
  'PartCategoryPage.tsx', 'PartGroupPage.tsx', 'StorageTypePage.tsx', 'UnitTypePage.tsx'
];

for (const f of files) {
  const path = 'src/pages/' + f;
  let c = fs.readFileSync(path, 'utf8');
  
  // The error is that we have:
  //                            </>
  //                        {modal === 'delete'
  // It should be:
  //                            </>
  //                        )}
  //                        {modal === 'delete'
  
  if (c.includes('</>\n                        {modal === \'delete\'')) {
      c = c.replace('</>\n                        {modal === \'delete\'', '</>\n                        )}\n                        {modal === \'delete\'');
      fs.writeFileSync(path, c, 'utf8');
      console.log('Fixed ' + f);
  } else if (c.includes('</>\r\n                        {modal === \'delete\'')) {
      c = c.replace('</>\r\n                        {modal === \'delete\'', '</>\r\n                        )}\r\n                        {modal === \'delete\'');
      fs.writeFileSync(path, c, 'utf8');
      console.log('Fixed ' + f);
  } else {
      console.log('Could not find pattern in ' + f);
  }
}
