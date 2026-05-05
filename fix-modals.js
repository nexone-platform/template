const fs = require('fs');
const file = 'c:/Task/Template/apps/nex-core/src/components/template/TemplateMaster2Page.tsx';
let content = fs.readFileSync(file, 'utf8');

const search = `                    <>
                        <button onClick={() => setIsCategoryModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ยกเลิก</button>
                        <button onClick={handleSaveCategory} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>เพิ่มหมวดหมู่</button>
                    </>
                }
            >
                <div>
                    <label style={crudStyles.label}>ชื่อหมวดหมู่</label>
                    <input type="text" style={crudStyles.input} placeholder="ระบุชื่อหมวดหมู่"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)} />
                </div>
            </BaseModal>`;

const replace = `            {/* Delete Confirm */}
            <BaseModal
                isOpen={isModalOpen && modalMode === 'delete'}
                onClose={() => setIsModalOpen(false)}
                title={t['confirm_delete_title'] || 'ยืนยันการลบข้อมูล'}
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t['cancel'] || 'ยกเลิก'}</button>
                        <button onClick={confirmDelete} disabled={saving} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: saving ? 0.5 : 1 }}>{saving ? (t['deleting'] || 'กำลังลบ...') : (t['delete_data'] || 'ลบข้อมูล')}</button>
                    </>
                }
            >
                <div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>{t['delete_confirm_msg'] || 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล'} <br /><strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.template_name}</strong> ?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>{t['cannot_undo'] || 'การกระทำนี้จะไม่สามารถย้อนกลับได้'}</p>
                </div>
            </BaseModal>

            {/* Add Category Modal */}
            <BaseModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                title={t['add_new_category'] || 'เพิ่มหมวดหมู่ใหม่'}
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsCategoryModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t['cancel'] || 'ยกเลิก'}</button>
                        <button onClick={handleSaveCategory} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>{t['add_category'] || 'เพิ่มหมวดหมู่'}</button>
                    </>
                }
            >
                <div>
                    <label style={crudStyles.label}>{t['category_name'] || 'ชื่อหมวดหมู่'}</label>
                    <input type="text" style={crudStyles.input} placeholder={t['enter_category_name'] || 'ระบุชื่อหมวดหมู่'}
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)} />
                </div>
            </BaseModal>`;

if(content.includes(search)) {
    fs.writeFileSync(file, content.replace(search, replace));
    console.log('Successfully replaced content.');
} else {
    console.log('Search string not found.');
}
