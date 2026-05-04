const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\Task\\Template\\services\\nex-core-api\\src';

function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (filePath.endsWith('.entity.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const entityFiles = getFiles(srcDir);
let changedCount = 0;

for (const file of entityFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Replace all type: 'timestamp' with type: 'timestamptz'
  content = content.replace(/type\s*:\s*['"]timestamp['"]/g, "type: 'timestamptz'");

  // 2. For @CreateDateColumn and @UpdateDateColumn that DON'T have type specified, add type: 'timestamptz'
  // Example: @CreateDateColumn({ name: 'create_date' }) -> @CreateDateColumn({ name: 'create_date', type: 'timestamptz' })
  // Example: @UpdateDateColumn({ name: 'update_date', nullable: true }) -> @UpdateDateColumn({ name: 'update_date', type: 'timestamptz', nullable: true })
  
  // We match @CreateDateColumn({ ... }) and check if it has type
  content = content.replace(/@(Create|Update)DateColumn\(\{\s*([^}]+)\s*\}\)/g, (match, typeName, innerProps) => {
    if (!innerProps.includes('type:')) {
      return `@${typeName}DateColumn({ ${innerProps.trim()}, type: 'timestamptz' })`;
    }
    return match;
  });

  // What about @CreateDateColumn() without any properties?
  content = content.replace(/@(Create|Update)DateColumn\(\s*\)/g, (match, typeName) => {
    return `@${typeName}DateColumn({ type: 'timestamptz' })`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
    changedCount++;
  }
}

console.log(`Done. Updated ${changedCount} files.`);
