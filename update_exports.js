const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('C:\\Task\\Template\\apps\\nex-core\\src', function(filePath) {
    if (filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('onExportPDF={')) {
            content = content.replace(/onExportPDF=\{\(\) \=\>[\s\n]*exportToPDF\(([^)]+)\)\}/g, (match, p1) => {
                let args = p1.split(',').map(s => s.trim());
                if (args.length === 3) {
                    return `onExportPDF={(orientation) => exportToPDF(${p1}, 'Report', orientation)}`;
                } else if (args.length >= 4) {
                    return `onExportPDF={(orientation) => exportToPDF(${p1}, orientation)}`;
                }
                return match;
            });
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
});
