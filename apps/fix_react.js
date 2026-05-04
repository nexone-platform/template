const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    let changed = false;

    // Check if React.useEffect is used but React is not imported
    if (content.includes('React.useEffect')) {
        // Change React.useEffect to useEffect
        content = content.replace(/React\.useEffect/g, 'useEffect');
        
        // Make sure useEffect is imported
        if (!content.includes('useEffect')) {
            // Find import { ... } from "react"
            const reactImportMatch = content.match(/import\s+{([^}]*)}\s+from\s+['"]react['"]/);
            if (reactImportMatch) {
                if (!reactImportMatch[1].includes('useEffect')) {
                    const newImport = reactImportMatch[0].replace('{', '{ useEffect, ');
                    content = content.replace(reactImportMatch[0], newImport);
                }
            } else {
                // If there's no import { ... } from "react", look for import React
                if (!content.includes('import React')) {
                    content = `import { useEffect } from 'react';\n` + content;
                }
            }
        } else {
             // useEffect is used in the text (now because we replaced it), but is it imported?
             const reactImportMatch = content.match(/import\s+[^;]*from\s+['"]react['"]/);
             if (reactImportMatch && !reactImportMatch[0].includes('useEffect')) {
                 if (reactImportMatch[0].includes('{')) {
                     content = content.replace(reactImportMatch[0], reactImportMatch[0].replace('{', '{ useEffect, '));
                 } else {
                     content = content.replace(reactImportMatch[0], reactImportMatch[0] + `\nimport { useEffect } from 'react';`);
                 }
             } else if (!reactImportMatch) {
                 content = `import { useEffect } from 'react';\n` + content;
             }
        }
        changed = true;
    }

    if (changed) {
        console.log(`Fixed React.useEffect in ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'nex-force/src'));
walkDir(path.join(__dirname, 'nex-speed/src'));
walkDir(path.join(__dirname, 'nex-stock/src'));
walkDir(path.join(__dirname, 'nex-core/src'));

