const fs = require('fs');
const file = 'c:/Task/Template/apps/nex-core/src/components/template/TemplateMaster2Page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
    "{modalMode === 'view' && (\r\n                    <div>\r\n                        <label style={crudStyles.label}>สถานะการใช้งาน</label>",
    "<div>\n                        <label style={crudStyles.label}>สถานะการใช้งาน</label>"
);
content = content.replace(
    "                    )}\r\n            </BaseModal>",
    "                    )}\n                </div>\n            </BaseModal>"
);
fs.writeFileSync(file, content);
console.log('Fixed');
