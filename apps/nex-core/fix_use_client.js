const fs = require('fs');
const files = [
    'src/components/ActivityLogs.tsx',
    'src/components/BranchSettings.tsx',
    'src/components/EmailTemplates.tsx',
    'src/components/ProvincesSettings.tsx',
    'src/components/SystemLanguages.tsx',
    'src/components/SystemMenuLanguages.tsx',
    'src/components/SystemMenus.tsx',
    'src/components/template/TemplateMaster2Page.tsx',
    'src/components/template/TemplateMaster3Page.tsx',
    'src/components/template/TemplateMasterGraph1Page.tsx',
    'src/components/UnitTypeSettings.tsx',
    'src/components/UserManagement.tsx'
];

files.forEach(f => {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        let lines = content.split('\n');
        
        // Find if 'use client'; is not at line 0
        const useClientIndex = lines.findIndex(line => line.includes("'use client'") || line.includes('"use client"'));
        
        if (useClientIndex > 0) {
            const useClientLine = lines.splice(useClientIndex, 1)[0];
            lines.unshift(useClientLine);
            fs.writeFileSync(f, lines.join('\n'));
            console.log('Fixed use client in', f);
        }
    }
});
