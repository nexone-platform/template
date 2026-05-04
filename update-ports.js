const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const directoriesToScan = ['apps', 'services', 'docs'];

const replacements = [
    { from: /localhost:3100/g, to: 'localhost:3100' },
    { from: /localhost:3101/g, to: 'localhost:3101' },
    { from: /localhost:3102/g, to: 'localhost:3102' },
    { from: /localhost:3103/g, to: 'localhost:3103' },
    { from: /localhost:3104/g, to: 'localhost:3104' },
    { from: /localhost:3105/g, to: 'localhost:3105' },
    { from: /localhost:3106/g, to: 'localhost:3106' },
    { from: /localhost:3107/g, to: 'localhost:3107' },
    { from: /localhost:3108/g, to: 'localhost:3108' },
    { from: /localhost:3109/g, to: 'localhost:3109' },
    { from: /localhost:8101/g, to: 'localhost:8101' },
    { from: /localhost:8102/g, to: 'localhost:8102' },
    { from: /localhost:8103/g, to: 'localhost:8103' },
    { from: /localhost:8104/g, to: 'localhost:8104' },
    { from: /localhost:8105/g, to: 'localhost:8105' },
    { from: /localhost:8106/g, to: 'localhost:8106' },
    { from: /localhost:8107/g, to: 'localhost:8107' },
    { from: /localhost:8108/g, to: 'localhost:8108' },
    { from: /localhost:8109/g, to: 'localhost:8109' },
    { from: /localhost:8108/g, to: 'localhost:8108' }, // nex-speed-api fix
];

function scanAndReplace(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.next' || file === 'dist' || file.endsWith('.png') || file.endsWith('.jpg') || file === '.git') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanAndReplace(fullPath);
        } else {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            for (const r of replacements) {
                content = content.replace(r.from, r.to);
            }
            // Additional check for package.json or hardcoded port variables without localhost
            if (file === 'package.json') {
                content = content.replace(/-p 3000/g, '-p 3100');
                content = content.replace(/-p 3001/g, '-p 3101');
                content = content.replace(/-p 3002/g, '-p 3102');
                content = content.replace(/-p 3003/g, '-p 3103');
                content = content.replace(/-p 3004/g, '-p 3104');
                content = content.replace(/-p 3005/g, '-p 3105');
                content = content.replace(/-p 3006/g, '-p 3106');
                content = content.replace(/-p 3007/g, '-p 3107');
                content = content.replace(/-p 3008/g, '-p 3108');
                content = content.replace(/-p 3009/g, '-p 3109');
            }
            if (file === 'Dockerfile') {
                content = content.replace(/EXPOSE 3001/g, 'EXPOSE 8103'); // specific fix for nex-site-api
                content = content.replace(/EXPOSE 8001/g, 'EXPOSE 8101');
                content = content.replace(/EXPOSE 8002/g, 'EXPOSE 8102');
            }
            if (file === 'main.ts' || file === 'main.go') {
                content = content.replace(/listen\(3001\)/g, 'listen(8101)');
                content = content.replace(/listen\(8001\)/g, 'listen(8101)');
            }
            if (file === 'config.go' && fullPath.includes('nex-speed-api')) {
                content = content.replace(/"8081"/g, '"8108"');
            }
            if (file === 'dev-server.ps1' || file === 'dev-server.bat') {
                content = content.replace(/8001/g, '8102'); // force api
            }
            if (file === 'README.md') {
                content = content.replace(/\(:3000\)/g, '(:3100)');
                content = content.replace(/\(:3001\)/g, '(:3101)');
                content = content.replace(/\(:3002\)/g, '(:3102)');
                content = content.replace(/\(:3003\)/g, '(:3103)');
                content = content.replace(/\(:3004\)/g, '(:3104)');
                content = content.replace(/\(:3006\)/g, '(:3106)');
                content = content.replace(/\(:3008\)/g, '(:3108)');
                content = content.replace(/\(:8001\)/g, '(:8101)');
                content = content.replace(/\| 3000 \|/g, '| 3100 |');
                content = content.replace(/\| 3001 \|/g, '| 3101 |');
                content = content.replace(/\| 3002 \|/g, '| 3102 |');
                content = content.replace(/\| 3003 \|/g, '| 3103 |');
                content = content.replace(/\| 3006 \|/g, '| 3106 |');
                content = content.replace(/\| 3008 \|/g, '| 3108 |');
                content = content.replace(/\| 8001 \|/g, '| 8101 |');
            }
            
            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated', fullPath);
            }
        }
    }
}

directoriesToScan.forEach(d => scanAndReplace(path.join(baseDir, d)));

// Scan root README.md
scanAndReplace(__dirname);

console.log('Port adjustments +100 applied successfully!');
