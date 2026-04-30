import fs from 'fs';

const filesToFix = [
  'ExpertisePage.tsx', 'LiquidTypePage.tsx'
];

const deleteModalCode = `                        {modal === 'delete' && selected && (
                            <>
                                <div className="modal-header">
                                    <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)' }}>
                                        <Trash2 size={20} /> ยืนยันการลบ
                                    </h3>
                                    <button style={closeBtn} onClick={() => setModal(null)}><X size={18} /></button>
                                </div>
                                <div className="modal-body">
                                    <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)' }}>
                                        คุณต้องการลบข้อมูล <strong>{selected.name || 'รายการนี้'}</strong> ใช่หรือไม่?
                                    </p>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--accent-red)', background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '8px' }}>
                                        * การกระทำนี้ไม่สามารถย้อนกลับได้ ข้อมูลจะถูกลบออกจากระบบอย่างถาวร
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary btn-sm" onClick={() => setModal(null)}>ยกเลิก</button>
                                    <button className="btn btn-sm" style={{ background: 'var(--accent-red)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleDelete}>
                                        <Trash2 size={16} /> ยืนยันการลบ
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>`;

for (const f of filesToFix) {
  const path = 'src/pages/' + f;
  let text = fs.readFileSync(path, 'utf8');
  if (text.includes("modal === 'delete'")) {
    console.log(f + ' already has delete');
    continue;
  }

  // Find the closing of the first modal.
  const regex = /\n\s*\)\}\r?\n\s*<\/div>\r?\n\s*<\/div>/;
  if(regex.test(text)) {
      text = text.replace(regex, '\n' + deleteModalCode);
      fs.writeFileSync(path, text, 'utf8');
      console.log('Fixed ' + f);
  } else {
      console.log('Could not find regex match in ' + f);
  }
}
