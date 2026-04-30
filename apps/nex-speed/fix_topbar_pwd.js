import fs from 'fs';
let p = 'c:/Task/Nex Solution/nex-speed/frontend/src/components/Topbar.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/import \{.*?\} from 'lucide-react';/, 
    "import { Search, Bell, Moon, Sun, LogOut, X, Eye, EyeOff } from 'lucide-react';");

const stateInsert = `    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwdOld, setPwdOld] = useState('');
    const [pwdNew, setPwdNew] = useState('');
    const [pwdConfirm, setPwdConfirm] = useState('');
    const [showPwdOld, setShowPwdOld] = useState(false);
    const [showPwdNew, setShowPwdNew] = useState(false);
    const [showPwdConfirm, setShowPwdConfirm] = useState(false);`;
c = c.replace(/const \[showUserMenu, setShowUserMenu\] = useState\(false\);\n    const userMenuRef = useRef<HTMLDivElement>\(null\);/, stateInsert);

const onClickReplace = /<button style=\{\{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13\.5px', color: 'var\(--text-primary\)' \}\} onClick=\{[^}]+\}>\s*เปลี่ยนรหัสผ่าน\s*<\/button>/;
const newOnClick = `<button style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13.5px', color: 'var(--text-primary)' }} onClick={() => { setShowUserMenu(false); setShowPasswordModal(true); }}>
                                    เปลี่ยนรหัสผ่าน
                                </button>`;
c = c.replace(onClickReplace, newOnClick);

const modalInsert = `
            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content" style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '8px', minWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '18px' }}>เปลี่ยนรหัสผ่าน</h2>
                            <button onClick={() => setShowPasswordModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>รหัสผ่านปัจจุบัน</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPwdOld ? 'text' : 'password'} 
                                        value={pwdOld} onChange={e => setPwdOld(e.target.value)} 
                                        style={{ width: '100%', padding: '8px 12px', paddingRight: '40px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                                    />
                                    <button onClick={() => setShowPwdOld(!showPwdOld)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        {showPwdOld ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>รหัสผ่านใหม่</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPwdNew ? 'text' : 'password'} 
                                        value={pwdNew} onChange={e => setPwdNew(e.target.value)} 
                                        style={{ width: '100%', padding: '8px 12px', paddingRight: '40px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                                    />
                                    <button onClick={() => setShowPwdNew(!showPwdNew)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        {showPwdNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>ยืนยันรหัสผ่านใหม่</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPwdConfirm ? 'text' : 'password'} 
                                        value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} 
                                        style={{ width: '100%', padding: '8px 12px', paddingRight: '40px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                                    />
                                    <button onClick={() => setShowPwdConfirm(!showPwdConfirm)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        {showPwdConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                            <button onClick={() => setShowPasswordModal(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                ยกเลิก
                            </button>
                            <button onClick={() => { alert('จำลองการเปลี่ยนรหัสผ่านสำเร็จ'); setShowPasswordModal(false); }} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: 'var(--accent-blue)', color: '#fff', cursor: 'pointer' }}>
                                บันทึก
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
`;
c = c.replace(/<\/header>/, modalInsert);

fs.writeFileSync(p, c);
console.log('Fixed Topbar.tsx with Reset Password modal');
