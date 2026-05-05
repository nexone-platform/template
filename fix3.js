const fs = require('fs');
const file = 'c:/Task/Template/apps/nex-core/src/components/template/TemplateMaster2Page.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');
const startIdx = 342;
const endIdx = 384;
const before = lines.slice(0, startIdx);
const after = lines.slice(endIdx);
const insert = [
`                    <div>\r`,
`                        <label style={crudStyles.label}>สถานะการใช้งาน</label>\r`,
`                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>\r`,
`                            <StatusDropdown status={formData.is_active}\r`,
`                                onChange={(val) => { if (modalMode !== 'view') setFormData({ ...formData, is_active: val }); }}\r`,
`                                disabled={modalMode === 'view'} />\r`,
`                            {modalMode === 'view' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>*(ดูอย่างเดียว)</span>}\r`,
`                        </div>\r`,
`                    </div>\r`,
`                    {modalMode === 'view' && (\r`,
`                        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>\r`,
`                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)' }}>\r`,
`                                <Info size={16} />\r`,
`                                <span style={{ fontSize: '13px', fontWeight: 600 }}>ข้อมูลระบบ (System Logs)</span>\r`,
`                            </div>\r`,
`                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>\r`,
`                                <div>\r`,
`                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>สร้างโดย</span>\r`,
`                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.create_by || '-'}</span>\r`,
`                                </div>\r`,
`                                <div>\r`,
`                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>วันที่สร้าง</span>\r`,
`                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.create_date ? new Date(selectedItem.create_date).toLocaleString('th-TH') : '-'}</span>\r`,
`                                </div>\r`,
`                                <div>\r`,
`                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>แก้ไขล่าสุดโดย</span>\r`,
`                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.update_by || '-'}</span>\r`,
`                                </div>\r`,
`                                <div>\r`,
`                                    <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>วันที่แก้ไขล่าสุด</span>\r`,
`                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedItem?.update_date ? new Date(selectedItem.update_date).toLocaleString('th-TH') : '-'}</span>\r`,
`                                </div>\r`,
`                            </div>\r`,
`                        </div>\r`,
`                    )}\r`
];
const newContent = [...before, ...insert, ...after].join('\n');
fs.writeFileSync(file, newContent);
console.log('Done!');
