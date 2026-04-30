import fs from 'fs';
const dir = 'c:/Task/Nex Solution/nex-speed/frontend/src/pages/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
for (const f of files) {
  let c = fs.readFileSync(dir + f, 'utf8');
  let original = c;
  c = c.replace(/color:\s*'var\(--accent-blue\)',\s*color:\s*'var\(--accent-blue\)'/g, "color: 'var(--accent-blue)'");
  if (c !== original) {
     fs.writeFileSync(dir + f, c);
     console.log('Fixed duplicate color in', f);
  }
}
