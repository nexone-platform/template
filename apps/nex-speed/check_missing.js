import fs from 'fs';
const files = fs.readdirSync('src/pages').filter(f => f.endsWith('.tsx'));
const missing = [];
for (const f of files) {
  const c = fs.readFileSync('src/pages/' + f, 'utf8');
  if (c.includes('setModal(\'delete\')') || c.includes('setModal("delete")')) {
    if (!c.includes("modal === 'delete'") && !c.includes('modal === "delete"')) {
      missing.push(f);
    }
  }
}
console.log('MISSING:', missing.join(', '));
