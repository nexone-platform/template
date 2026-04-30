import fs from 'fs';

const filesToFix = [
  'MechanicTypePage.tsx', 'ParkingTypePage.tsx', 
  'PartCategoryPage.tsx', 'PartGroupPage.tsx', 'StorageTypePage.tsx', 
  'UnitTypePage.tsx'
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
                        )}\n`;

for (const f of filesToFix) {
  const path = 'src/pages/' + f;
  let text = fs.readFileSync(path, 'utf8');
  if (text.includes("modal === 'delete'")) {
    console.log(f + ' already has delete');
    continue;
  }

  let splitted = text.split('</div>\\n                </div>\\n            )}');
  if (splitted.length > 1) {
      let before = splitted.slice(0, -1).join('</div>\\n                </div>\\n            )}');
      let lastBracket = before.lastIndexOf(')}');
      if (lastBracket !== -1) {
         before = before.substring(0, lastBracket + 2) + '\\n' + deleteModalCode + before.substring(lastBracket + 2);
         text = before + '</div>\\n                </div>\\n            )}' + splitted[splitted.length - 1];
         fs.writeFileSync(path, text, 'utf8');
         console.log('Fixed ' + f);
         continue;
      }
  }
  
  let splittedR = text.split('</div>\r\n                </div>\r\n            )}');
  if (splittedR.length > 1) {
      let before = splittedR.slice(0, -1).join('</div>\r\n                </div>\r\n            )}');
      let lastBracket = before.lastIndexOf(')}');
      if (lastBracket !== -1) {
         before = before.substring(0, lastBracket + 2) + '\r\n' + deleteModalCode + before.substring(lastBracket + 2);
         text = before + '</div>\r\n                </div>\r\n            )}' + splittedR[splittedR.length - 1];
         fs.writeFileSync(path, text, 'utf8');
         console.log('Fixed ' + f);
      }
  } else {
      console.log('Could not split ' + f);
  }
}
