import fs from 'fs';

function applyDropdown(file, arrayData, loopItem, isThaiActive = false, apiMethod = null) {
  let p = 'c:/Task/Nex Solution/nex-speed/frontend/src/pages/' + file;
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');

  let modified = false;
  if (!c.includes('import StatusDropdown')) {
    c = c.replace(/(import [^\n]+;\n+)/, `$1import StatusDropdown from '@/components/StatusDropdown';\n`);
    modified = true;
  }

  let tbMatch = c.match(/<tbody[\s\S]*?<\/tbody>/);
  if (!tbMatch) return;
  let tb = tbMatch[0];

  let spanMatch = tb.match(/<td[^>]*>\s*<span[^>]*style=\{\{[\s\S]*?\}\}[^>]*>[\s\S]*?<\/span>\s*<\/td>/);
  if (spanMatch) {
    let rep = `<td style={{ textAlign: 'center' }}>
  <StatusDropdown 
      value={${loopItem}.status}
      onChange={async (val) => { 
          ${arrayData}(prev => prev.map(x => x.id === ${loopItem}.id ? { ...x, status: val } : x));
          ${apiMethod ? `try { await ${apiMethod}(${loopItem}.id, { ...${loopItem}, status: val } as any); } catch(err){}` : ''}
      }}
      options={[
          { value: '${isThaiActive ? 'ใช้งาน' : 'active'}', label: 'ใช้งาน', color: 'green' },
          { value: '${isThaiActive ? 'ระงับ' : 'inactive'}', label: 'ระงับ', color: 'red' }
      ]}
  />
</td>`;
    tb = tb.replace(spanMatch[0], rep);
    c = c.replace(tbMatch[0], tb);
    fs.writeFileSync(p, c);
    console.log('Fixed ' + file);
  }
}

applyDropdown('MechanicTypePage.tsx', 'setData', 'r', false, 'api.updateMechanicType');
applyDropdown('ParkingTypePage.tsx', 'setData', 'r', false, 'api.updateParkingType');
applyDropdown('ExpertisePage.tsx', 'setData', 'r', false, 'api.updateMechanicExpertise');
applyDropdown('MaintenancePlanPage.tsx', 'setPlans', 'p', true, null); // uses Thai string "ใช้งาน" "ระงับ" natively!

