const fs = require('fs');
const file = 'c:/Task/Template/apps/nex-core/src/components/template/TemplateMaster2Page.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = "                />\r\n                ) : undefined";
const replacement1 = `                />
                <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }} />
                <ImportExcelButton columns={importColumns as any} filenamePrefix="Template2" onImport={handleImport} onImportComplete={loadData} />
                </div>
                ) : undefined`.replace(/\n/g, '\r\n');

const target1b = "                />\n                ) : undefined";
const replacement1b = `                />
                <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }} />
                <ImportExcelButton columns={importColumns as any} filenamePrefix="Template2" onImport={handleImport} onImportComplete={loadData} />
                </div>
                ) : undefined`;

if (content.includes(target1)) {
    content = content.replace(target1, replacement1);
} else if (content.includes(target1b)) {
    content = content.replace(target1b, replacement1b);
}

// Search clear
content = content.replace(
    '<SearchInput value={search} onChange={setSearch} placeholder="ค้นหาตัวอย่าง..." />',
    '<SearchInput value={search} onChange={setSearch} onClear={() => setSearch("")} placeholder="ค้นหาตัวอย่าง..." />'
);

// Add logs to View Modal
const modalViewTargetCRLF = `{modalMode === 'view' && (
                        <div>
                            <label style={crudStyles.label}>สถานะการใช้งาน</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <StatusDropdown status={formData.is_active}
                                    onChange={(val) => { if (modalMode !== 'view') setFormData({ ...formData, is_active: val }); }}
                                    disabled={modalMode === 'view'} />
                                {modalMode === 'view' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>*(ดูอย่างเดียว)</span>}
                            </div>
                        </div>
                    )}`;

const modalViewTargetLF = modalViewTargetCRLF.replace(/\r\n/g, '\n');

const viewStrNew = `{modalMode === 'view' && (
                        <>
                            <div>
                                <label style={crudStyles.label}>สถานะการใช้งาน</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <StatusDropdown status={formData.is_active}
                                        onChange={(val) => { if (modalMode !== 'view') setFormData({ ...formData, is_active: val }); }}
                                        disabled={modalMode === 'view'} />
                                    {modalMode === 'view' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>*(ดูอย่างเดียว)</span>}
                                </div>
                            </div>
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
                        </>
                    )}`;

if (content.includes(modalViewTargetCRLF)) {
    content = content.replace(modalViewTargetCRLF, viewStrNew.replace(/\n/g, '\r\n'));
} else if (content.includes(modalViewTargetLF)) {
    content = content.replace(modalViewTargetLF, viewStrNew);
}

fs.writeFileSync(file, content);
