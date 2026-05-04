const fs = require('fs');
const path = require('path');

function replaceFile(file, regex, replaceWith) {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(regex, replaceWith);
    fs.writeFileSync(fullPath, content);
    console.log('Fixed', file);
  }
}

replaceFile('src/menus/menus.service.ts', /menu\.parent_id = \(\!menu\.parent_id \|\| menu\.parent_id === 'null'\) \? null as any : menu\.parent_id;/g, 'menu.parent_id = ((!menu.parent_id || menu.parent_id === \'null\') ? null : menu.parent_id) as any;');
replaceFile('src/menus/menus.service.ts', /menu\.create_by = \(\!menu\.create_by \|\| menu\.create_by === 'null'\) \? null as any : menu\.create_by;/g, 'menu.create_by = ((!menu.create_by || menu.create_by === \'null\') ? null : menu.create_by) as any;');
replaceFile('src/menus/menus.service.ts', /menu\.parent_id = \(\!menu\.parent_id \|\| menu\.parent_id === 'null'\) \? null : menu\.parent_id;/g, 'menu.parent_id = ((!menu.parent_id || menu.parent_id === \'null\') ? null : menu.parent_id) as any;');
replaceFile('src/menus/menus.service.ts', /menu\.create_by = null;/g, 'menu.create_by = null as any;');
replaceFile('src/translations/translations.controller.ts', /id: \+id/g, 'id: String(id) as any');
replaceFile('src/translations/translations.controller.ts', /@Param\('id'\) id: number/g, '@Param(\'id\') id: string');
replaceFile('src/translations/translations.controller.ts', /\{ id: number;/g, '{ id: string;');
replaceFile('src/translations/translations.service.ts', /const langData = \{/g, 'const langData: any = {');
replaceFile('src/master-data/roles/roles.service.ts', /roleId: null,/g, 'roleId: null as any,');
replaceFile('src/master-data/locations/locations.service.ts', /\{ locationCode \}/g, '{ locationCode } as any');
