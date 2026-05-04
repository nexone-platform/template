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
    const path = f;
    if (fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');
        if (!content.includes('import { useSystemConfig }')) {
            content = "import { useSystemConfig } from '@nexone/ui';\n" + content;
            fs.writeFileSync(path, content);
            console.log('Added to', path);
        }
    }
});
