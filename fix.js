const fs = require('fs');
const file = 'c:/Task/Template/apps/nex-core/src/components/template/TemplateMaster2Page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div style=\{\{ display: 'flex', flexDirection: 'column', gap: '16px' \}\}>([\s\S]*?)<\/div>\s*<\/BaseModal>\s*\{\/\* Delete Confirm \*\/\}/g;

const replacement = `<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>หัวข้อ <span style={{ color: '#ef4444' }}>*</span></label>
                        <input type="text" style={crudStyles.input} placeholder="ระบุชื่อหัวข้อ"
                            value={formData.template_name}
                            onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                            disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ ...crudStyles.label, marginBottom: 0 }}>หมวดหมู่ <span style={{ color: '#ef4444' }}>*</span></label>
                            {modalMode !== 'view' && (
                                <button type="button" onClick={() => setIsCategoryModalOpen(true)} style={{ color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                                    <Plus size={14} /> <span>เพิ่มหมวดหมู่</span>
                                </button>
                            )}
                        </div>
                        <select style={{ ...crudStyles.input, cursor: modalMode === 'view' ? 'default' : 'pointer' }}
                            value={formData.template_group}
                            onChange={(e) => setFormData({ ...formData, template_group: e.target.value })}
                            disabled={modalMode === 'view'}>
                            {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={crudStyles.label}>อธิบายการใช้งาน</label>
                        <textarea style={{ ...crudStyles.input, minHeight: '100px', resize: 'vertical' }}
                            placeholder="ระบุคำอธิบาย หรือหมายเหตุ"
                            value={formData.template_desc}
                            onChange={(e) => setFormData({ ...formData, template_desc: e.target.value })}
                            disabled={modalMode === 'view'} />
                    </div>
                    {modalMode === 'view' && (
                        <div>
                            <label style={crudStyles.label}>สถานะการใช้งาน</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <StatusDropdown status={formData.is_active}
                                    onChange={(val) => { if (modalMode !== 'view') setFormData({ ...formData, is_active: val }); }}
                                    disabled={modalMode === 'view'} />
                                {modalMode === 'view' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>*(ดูอย่างเดียว)</span>}
                            </div>
                        </div>
                    )}
                    {modalMode === 'view' && (
                        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                                <Info size={16} />
                                <span style={{ fontSize: '13px', fontWeight: 600 }}>ข้อมูลระบบ (System Logs)</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>สร้างโดย</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.create_by || '-'}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>วันที่สร้าง</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.create_date ? new Date(selectedItem.create_date).toLocaleString('th-TH') : '-'}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>แก้ไขล่าสุดโดย</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.update_by || '-'}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>วันที่แก้ไขล่าสุด</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.update_date ? new Date(selectedItem.update_date).toLocaleString('th-TH') : '-'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </BaseModal>

            {/* Delete Confirm */}`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
