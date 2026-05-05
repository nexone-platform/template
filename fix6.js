const fs = require('fs');
const file = 'c:/Task/Template/apps/nex-core/src/components/template/TemplateMaster2Page.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
// We want to delete line index 341 (which is line 342) 
// The line says "{modalMode === 'view' && ("
lines.splice(341, 1);
fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed');
