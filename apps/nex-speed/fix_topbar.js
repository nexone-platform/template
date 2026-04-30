import fs from 'fs';
let p = 'c:/Task/Nex Solution/nex-speed/frontend/src/components/Topbar.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/const \[showNotifications, setShowNotifications\] = useState\(false\);/, 
    'const [showNotifications, setShowNotifications] = useState(false);\n    const [showUserMenu, setShowUserMenu] = useState(false);\n    const userMenuRef = useRef<HTMLDivElement>(null);');

c = c.replace(/if \(notifRef\.current && !notifRef\.current\.contains\(e\.target as Node\)\) \{\n                setShowNotifications\(false\);\n            \}/, 
    'if (notifRef.current && !notifRef.current.contains(e.target as Node)) {\n                setShowNotifications(false);\n            }\n            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {\n                setShowUserMenu(false);\n            }');

// Replace topbar-left
let leftRegex = /<div className=\"topbar-left\">[\s\S]*?<\/div>\s*<\/div>/;
let newLeft = `<div className="topbar-left" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h1 className="topbar-title" style={{ margin: 0 }}>{pageTitle}</h1>
                    {pageSubtitle && (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>— {pageSubtitle}</span>
                    )}
                </div>
                {breadcrumb && breadcrumb.length > 0 && (
                    <div className="topbar-breadcrumb" style={{ marginTop: '4px', marginLeft: '0' }}>
                        {breadcrumb.map((item, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <span className="topbar-breadcrumb-sep">/</span>}
                                <span>{item}</span>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>`;
c = c.replace(leftRegex, newLeft);

// Remove search box
let searchRegex = /<div className=\"topbar-search\">[\s\S]*?<\/div>/;
c = c.replace(searchRegex, '');

// Replace user avatar and logout
let userRegex = /\{\/\* User Avatar \& Menu \*\/\}[\s\S]*?(?=<\/div>\s*<\/header>)/;
let newUser = `{/* User Avatar & Menu */}
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                    <div
                        className="topbar-avatar"
                        title={user?.name || 'ผู้ใช้งาน'}
                        style={{ cursor: 'pointer', fontSize: '14px', background: 'var(--accent-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%' }}
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        {user?.avatar || user?.name?.charAt(0) || 'U'}
                    </div>
                    {user && showUserMenu && (
                        <div className="user-dropdown" style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                            borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            minWidth: '150px', zIndex: 100, overflow: 'hidden'
                        }}>
                            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{user.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.role || 'ผู้ดูแลระบบ'}</div>
                            </div>
                            <div style={{ padding: '4px 0' }}>
                                <button style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13.5px', color: 'var(--text-primary)' }} onClick={() => {}}>
                                    ผู้ใช้งาน
                                </button>
                                <button style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13.5px', color: 'var(--text-primary)' }} onClick={() => {}}>
                                    เปลี่ยนรหัสผ่าน
                                </button>
                                <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
                                <button style={{ width: '100%', textAlign: 'left', padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13.5px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={onLogout}>
                                    <LogOut size={16} /> ออกจากระบบ
                                </button>
                            </div>
                        </div>
                    )}
                </div>`;
c = c.replace(userRegex, newUser);

fs.writeFileSync(p, c);
console.log('Fixed Topbar.tsx');
