const fs = require('fs');
const glob = require('glob');

const files = glob.sync('apps/nex-core/src/components/**/*.tsx');

files.forEach(file => {
    if (file.includes('Pagination.tsx') || file.includes('SystemApps.tsx')) return;

    let content = fs.readFileSync(file, 'utf8');

    // Skip if already has useSystemConfig
    if (content.includes('useSystemConfig')) return;
    if (!content.includes('const [pageSize, setPageSize] = useState')) return;

    // 1. Add import
    if (content.includes('import React')) {
        // Find first import and insert after it, or just add it at the top
        content = content.replace(/import React(.*?)\n/, "import React$1\nimport { useSystemConfig } from '@nexone/ui';\n");
    }

    // 2. Add hook and effect
    content = content.replace(/const \[pageSize, setPageSize\] = useState\(.*?\);/, 
`const { configs, loading: configLoading } = useSystemConfig();
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    React.useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);`);

    fs.writeFileSync(file, content);
    console.log('Updated', file);
});
