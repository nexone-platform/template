const fs = require('fs');

const files = [
    'C:\\Task\\Template\\apps\\nex-core\\src\\components\\ActivityLogs.tsx',
    'C:\\Task\\Template\\apps\\nex-core\\src\\components\\BranchSettings.tsx',
    'C:\\Task\\Template\\apps\\nex-core\\src\\components\\EmailTemplates.tsx',
    'C:\\Task\\Template\\apps\\nex-core\\src\\components\\SystemLanguages.tsx',
    'C:\\Task\\Template\\apps\\nex-core\\src\\components\\SystemMenuLanguages.tsx',
    'C:\\Task\\Template\\apps\\nex-core\\src\\components\\SystemMenus.tsx',
    'C:\\Task\\Template\\apps\\nex-core\\src\\components\\UserManagement.tsx',
    'C:\\Task\\Template\\apps\\nex-core\\src\\components\\template\\TemplateMaster1Page.tsx',
    'C:\\Task\\Template\\apps\\nex-core\\src\\components\\template\\TemplateMaster2Page.tsx',
    'C:\\Task\\Template\\apps\\nex-core\\src\\components\\template\\TemplateMaster3Page.tsx'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let idx = content.indexOf('onExportPDF={() => exportToPDF(');
    if (idx === -1) {
        idx = content.indexOf('onExportPDF={() => \\nexportToPDF('); // just in case
        if (idx === -1) return;
    }
    
    // Replace 'onExportPDF={() =>' with 'onExportPDF={(orientation) =>'
    content = content.replace(/onExportPDF=\{\(\) =>\s*exportToPDF\(/, 'onExportPDF={(orientation) => exportToPDF(');
    
    // Now we need to find the matching ')}' for this block.
    // The easiest way is to find the next ')}' that is at the end of the exportToPDF call.
    // Since we know they all end with `)}` at the end of the line.
    content = content.replace(/(\]\s*,\s*['"][^'"]+['"]\s*)\)\}/, "$1, orientation)}");
    content = content.replace(/(exportColumns\s*,\s*['"][^'"]+['"]\s*)\)\}/, "$1, orientation)}");
    
    fs.writeFileSync(f, content, 'utf8');
});
