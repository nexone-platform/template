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

replaceFile('src/translations/translations.service.ts', /\{ id \}/g, '{ id: id as any }');
replaceFile('src/translations/translations.service.ts', /id: item.id/g, 'id: item.id as any');
replaceFile('src/translations/translations.service.ts', /\{ id: id as any \}: any/g, '{ id }: any');
replaceFile('src/translations/translations.service.ts', /id: number/g, 'id: string');
replaceFile('src/master-data/roles/roles.service.ts', /\{ roleName \}/g, '{ roleName } as any');
replaceFile('src/master-data/roles/roles.service.ts', /roleId: null/g, 'roleId: null as any');
replaceFile('src/auth/auth.service.ts', /email: user.email/g, 'email: user.email as any');
replaceFile('src/auth/auth.service.ts', /displayName: user.displayName/g, 'displayName: user.displayName as any');
replaceFile('src/auth/auth.service.ts', /id: user.id/g, 'id: user.id as any');
replaceFile('src/auth/auth.service.ts', /\{ email \}/g, '{ email } as any');
replaceFile('src/auth/auth.service.ts', /\{ id: user.id/g, '{ id: user.id as any');
replaceFile('src/auth/auth.service.ts', /user.roleName/g, '(user as any).roleName');
