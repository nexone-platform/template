const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it has pagination state
    if (!content.match(/const\s+\[pageSize,\s*setPageSize\]\s*=\s*(?:React\.)?useState\([^)]*\)/)) {
        return false;
    }
    
    // If it already uses configs.pageRecordDefault, skip
    if (content.includes('configs?.pageRecordDefault')) {
        return false;
    }

    console.log(`Patching ${filePath}`);

    // 1. Add import if needed
    if (!content.includes('useSystemConfig')) {
        if (content.includes(`from '@nexone/ui'`)) {
            content = content.replace(/import\s+{([^}]*)}\s+from\s+'@nexone\/ui';/, (match, p1) => {
                if (p1.includes('useSystemConfig')) return match;
                return `import { ${p1}, useSystemConfig } from '@nexone/ui';`;
            });
        } else {
            // Find last import
            const importMatches = [...content.matchAll(/^import.*?;?\r?\n/gm)];
            if (importMatches.length > 0) {
                const lastImport = importMatches[importMatches.length - 1];
                const insertIndex = lastImport.index + lastImport[0].length;
                content = content.slice(0, insertIndex) + `import { useSystemConfig } from '@nexone/ui';\n` + content.slice(insertIndex);
            } else {
                content = `import { useSystemConfig } from '@nexone/ui';\n` + content;
            }
        }
    }

    // 2. Find the component body start
    // We can usually find it by looking for `const [pageSize, setPageSize]`
    const pageSizeRegex = /(const\s+\[pageSize,\s*setPageSize\]\s*=\s*(?:React\.)?useState\()([^)]*)(\);)/;
    
    const pageSizeMatch = content.match(pageSizeRegex);
    if (!pageSizeMatch) return false;
    
    // Replace the pageSize useState
    content = content.replace(pageSizeRegex, `$1configs?.pageRecordDefault || $2$3`);
    
    // Inject useSystemConfig and useEffect right before the pageSize state
    const injection = `
    const { configs, loading: configLoading } = useSystemConfig();
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    React.useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);

`;
    
    // If React isn't imported as React, we should ensure it exists or use useEffect
    // The files usually have React.useEffect or useEffect
    let finalInjection = injection;
    if (content.includes('useEffect(') && !content.includes('React.useEffect')) {
        finalInjection = finalInjection.replace(/React\.useEffect/g, 'useEffect');
    }
    
    content = content.replace(pageSizeRegex, finalInjection.trim() + '\n    ' + `$1configs?.pageRecordDefault || $2$3`);

    fs.writeFileSync(filePath, content, 'utf8');
    return true;
}

function walkDir(dir) {
    let patchedCount = 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next') continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            patchedCount += walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            if (processFile(fullPath)) {
                patchedCount++;
            }
        }
    }
    return patchedCount;
}

const total = walkDir(path.join(__dirname, 'nex-speed/src')) + 
              walkDir(path.join(__dirname, 'nex-force/src')) + 
              walkDir(path.join(__dirname, 'nex-stock/src')) +
              walkDir(path.join(__dirname, 'nex-core/src'));

console.log(`Total patched: ${total}`);
