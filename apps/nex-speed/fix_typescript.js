import fs from 'fs';

function patch(scriptName, search, replace) {
    let c = fs.readFileSync(scriptName, 'utf-8');
    c = c.replace(search, replace);
    fs.writeFileSync(scriptName, c, 'utf-8');
    console.log('Patched ' + scriptName);
}

patch('src/utils/exportUtils.ts', 
      /export interface ColumnDef \{\s*key: string;\s*\/\/ eslint-disable-next-line @typescript-eslint\/no-explicit-any\s*format\?: \(val: any\) => string \| number;/,
      `export interface ColumnDef {\n    key: string;\n    label?: string;\n    // eslint-disable-next-line @typescript-eslint/no-explicit-any\n    format?: (val: any) => string | number;`);

patch('src/services/api.ts',
      /export interface LocationItem \{\s*id: number; name: string; type: string; address: string;\s*province: string; lat: number; lng: number;\s*createdAt: string; updatedAt: string;\s*\}/,
      `export interface LocationItem {\n    id: number; name: string; type: string; address: string;\n    province: string; lat: number; lng: number;\n    status?: string;\n    createdAt: string; updatedAt: string;\n}`);
