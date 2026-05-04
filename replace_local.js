const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      const ext = path.extname(file);
      const basename = path.basename(file);
      if (ext === '.js' || ext === '.ts' || ext === '.md' || basename.startsWith('.env')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(rootDir);
let count = 0;

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('nexone_template')) {
      const newContent = content.replace(/nexone_template/g, 'nexone_template');
      fs.writeFileSync(file, newContent, 'utf8');
      console.log('Updated:', file);
      count++;
    }
  } catch (err) {
    // skip
  }
});

console.log(`Replaced nexone_template to nexone_template in ${count} files.`);
