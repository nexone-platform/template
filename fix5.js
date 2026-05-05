const fs = require('fs');
const file = 'c:/Task/Template/apps/nex-core/src/components/template/TemplateMaster2Page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
    "{modalMode === 'view' && (\n                    <div>\n                        <label style={crudStyles.label}>สถานะการใช้งาน</label>",
    "<div>\n                        <label style={crudStyles.label}>สถานะการใช้งาน</label>"
);
content = content.replace(
    "{modalMode === 'view' && (\r\n                    <div>\r\n                        <label style={crudStyles.label}>สถานะการใช้งาน</label>",
    "<div>\r\n                        <label style={crudStyles.label}>สถานะการใช้งาน</label>"
);
fs.writeFileSync(file, content);
console.log('Fixed');
