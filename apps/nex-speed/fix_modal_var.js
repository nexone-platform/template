const fs = require('fs');
const path = require('path');
function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        let p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (p.endsWith('Page.tsx')) fix(p);
    });
}
function fix(p) {
    let c = fs.readFileSync(p, 'utf8');
    let o = c;
    
    // Find the state variables
    let isModalMode = c.includes('const [modalMode');
    let isModal = c.includes('const [modal, ') || c.includes('const [modal]');
    let isShowAddModal = c.includes('const [showAddModal');
    let isShowModal = c.includes('const [showModal'); 

    let cond = '';
    if (isModalMode) cond = "modalMode === 'add'";
    else if (isModal) cond = "modal === 'add'";
    else if (isShowAddModal) cond = "showAddModal";
    else if (isShowModal) cond = "showModal";
    else cond = "true";
    
    if (!isModal) {
        c = c.replace(/\{modal === 'add' \? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'\}/g, `{${cond} ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}`);
    }
    if (!isModalMode) {
        c = c.replace(/\{modalMode === 'add' \? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'\}/g, `{${cond} ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}`);
        c = c.replace(/\{modalMode === 'add' \|\| modal === 'add' \? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'\}/g, `{${cond} ? 'เพิ่มข้อมูล' : 'บันทึกข้อมูล'}`);
    }

    if (c !== o) {
        fs.writeFileSync(p, c);
        console.log('Fixed', p);
    }
}
walk('src/pages');
