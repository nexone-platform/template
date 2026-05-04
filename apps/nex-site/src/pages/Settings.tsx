import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import PrivacyPolicyEditor from '../components/PrivacyPolicyEditor';
import './Settings.css';

interface AdminUser {
    id: string;
    username: string;
    displayName: string;
    email: string;
    role: 'admin' | 'editor';
    isActive: boolean;
    allowedPages: string[];
    lastLoginAt: string | null;
    createdAt: string;
}

interface SharedUser {
    employeeId: string;
    email: string;
    isActive: boolean;
    alreadyImported: boolean;
}

interface UserFormData {
    username: string;
    password: string;
    displayName: string;
    email: string;
    role: 'admin' | 'editor';
    isActive: boolean;
    allowedPages: string[];
}

const ALL_BO_PAGES = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    { id: 'pages', label: 'Pages', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
    { id: 'builder', label: 'Page Builder', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> },
    { id: 'theme', label: 'Theme & Colors', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.8 1.7-1.7 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.8-1.7 1.7-1.7H17c3.1 0 5.6-2.5 5.6-5.6C22.6 5.7 18 2 12 2z"/></svg> },
    { id: 'translations', label: 'Language', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg> },
    { id: 'settings', label: 'Settings', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z"/></svg> },
];

const ALL_PAGE_IDS = ALL_BO_PAGES.map(p => p.id);

const emptyForm: UserFormData = {
    username: '',
    password: '',
    displayName: '',
    email: '',
    role: 'editor',
    isActive: true,
    allowedPages: [...ALL_PAGE_IDS],
};

export default function Settings() {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'system' | 'privacy'>('privacy');





    // ── User CRUD state ──
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [userForm, setUserForm] = useState<UserFormData>(emptyForm);
    const [userFormMsg, setUserFormMsg] = useState('');
    const [userFormLoading, setUserFormLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<AdminUser | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // ── Shared users state ──
    const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
    const [sharedSearch, setSharedSearch] = useState('');
    const [isFromShared, setIsFromShared] = useState(false);

    // ── Fetch users ──
    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/users`);
            const data = await res.json();
            setUsers(data);
        } catch { /* ignore */ }
        setUsersLoading(false);
    };

    // ── Fetch shared users ──
    const fetchSharedUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/shared-users`);
            const data = await res.json();
            setSharedUsers(data);
        } catch { /* ignore */ }
    };

    useEffect(() => { fetchUsers(); }, []);

    // ── Open modal for create ──
    const openCreateModal = () => {
        setEditingUser(null);
        setUserForm(emptyForm);
        setUserFormMsg('');
        setSharedSearch('');
        setIsFromShared(false);
        fetchSharedUsers();
        setShowUserModal(true);
    };

    // ── Select shared user ──
    const handleSelectSharedUser = (su: SharedUser) => {
        setUserForm({
            ...emptyForm,
            username: su.employeeId,
            displayName: su.employeeId,
            email: su.email,
        });
        setIsFromShared(true);
        setSharedSearch('');
    };

    // ── Open modal for edit ──
    const openEditModal = (user: AdminUser) => {
        setEditingUser(user);
        setUserForm({
            username: user.username,
            password: '', // leave blank to keep existing
            displayName: user.displayName,
            email: user.email || '',
            role: user.role,
            isActive: user.isActive,
            allowedPages: user.allowedPages || [...ALL_PAGE_IDS],
        });
        setUserFormMsg('');
        setShowUserModal(true);
    };

    // ── Save user (create or update) ──
    const handleSaveUser = async () => {
        setUserFormMsg('');

        // Validation
        if (!userForm.displayName.trim()) {
            setUserFormMsg('กรุณากรอกชื่อที่แสดง');
            return;
        }

        if (!editingUser) {
            // Creating new
            if (!userForm.username.trim()) {
                setUserFormMsg('กรุณากรอกชื่อผู้ใช้');
                return;
            }
            // Password required only if NOT imported from shared
            if (!isFromShared && (!userForm.password || userForm.password.length < 6)) {
                setUserFormMsg('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
                return;
            }
        }

        setUserFormLoading(true);

        try {
            if (editingUser) {
                // Update
                const body: Record<string, unknown> = {
                    displayName: userForm.displayName,
                    email: userForm.email,
                    role: userForm.role,
                    isActive: userForm.isActive,
                    allowedPages: userForm.role === 'admin' ? ALL_PAGE_IDS : userForm.allowedPages,
                };
                if (userForm.password) {
                    body.password = userForm.password;
                }

                const res = await fetch(`${API_BASE_URL}/auth/users/${editingUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                const data = await res.json();

                if (data.success) {
                    setShowUserModal(false);
                    await fetchUsers();
                } else {
                    setUserFormMsg(data.message || 'เกิดข้อผิดพลาด');
                }
            } else {
                // Create
                const createBody: Record<string, unknown> = {
                        username: userForm.username,
                        displayName: userForm.displayName,
                        email: userForm.email,
                        role: userForm.role,
                        allowedPages: userForm.role === 'admin' ? ALL_PAGE_IDS : userForm.allowedPages,
                    };
                    if (userForm.password) {
                        createBody.password = userForm.password;
                    }
                const res = await fetch(`${API_BASE_URL}/auth/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(createBody),
                });
                const data = await res.json();

                if (data.success) {
                    setShowUserModal(false);
                    await fetchUsers();
                } else {
                    setUserFormMsg(data.message || 'เกิดข้อผิดพลาด');
                }
            }
        } catch {
            setUserFormMsg('ไม่สามารถเชื่อมต่อ API ได้');
        }

        setUserFormLoading(false);
    };

    // ── Delete user ──
    const handleDeleteUser = async (user: AdminUser) => {
        setDeleteLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/users/${user.id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                setShowDeleteConfirm(null);
                await fetchUsers();
            } else {
                showToast(data.message || 'เกิดข้อผิดพลาด', 'error');
            }
        } catch {
            showToast('ไม่สามารถเชื่อมต่อ API ได้', 'error');
        }
        setDeleteLoading(false);
    };

    // ── Toggle active ──
    const handleToggleActive = async (user: AdminUser) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !user.isActive }),
            });
            const data = await res.json();
            if (data.success) {
                await fetchUsers();
            }
        } catch { /* ignore */ }
    };

    const tabs = [
        { id: 'privacy' as const, label: t('bo.settings.privacyPolicy', 'Privacy Policy') },
        { id: 'users' as const, label: t('bo.settings.userManagement', 'User Management') },
        { id: 'system' as const, label: t('bo.settings.systemInfo', 'System Info') },
    ];

    return (
        <div className="settings-page">

            <div className="settings-layout">
                {/* Tabs sidebar */}
                <div className="settings-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="settings-content">

                    {/* ── User Management ── */}
                    {activeTab === 'users' && (
                        <div className="card settings-card">
                            <div className="settings-card-header settings-card-header-flex">
                                <div>
                                    <h2>{t('bo.settings.userManagement', 'User Management')}</h2>
                                    <p className="text-gray">{t('bo.settings.userManagement', 'รายชื่อผู้ใช้ระบบ Backoffice ทั้งหมด')} ({users.length})</p>
                                </div>
                                <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                                    {t('bo.settings.addUser', '+ Add User')}
                                </button>
                            </div>
                            <div className="table-container">
                                {usersLoading ? (
                                    <div className="settings-loading">
                                        <div className="spinner" />
                                        <p>กำลังโหลด…</p>
                                    </div>
                                ) : users.length === 0 ? (
                                    <div className="settings-loading">
                                        <p>ยังไม่มีผู้ใช้</p>
                                    </div>
                                ) : (
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>ผู้ใช้</th>
                                                <th>อีเมล</th>
                                                <th>บทบาท</th>
                                                <th>หน้าที่เข้าถึงได้</th>
                                                <th>สถานะ</th>
                                                <th>เข้าสู่ระบบล่าสุด</th>
                                                <th>การจัดการ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id}>
                                                    <td>
                                                        <div className="user-cell">
                                                            <span className="user-cell-avatar">
                                                                {u.displayName.charAt(0).toUpperCase()}
                                                            </span>
                                                            <div>
                                                                <div className="user-cell-name">{u.displayName}</div>
                                                                <div className="user-cell-username">@{u.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-gray">{u.email || '-'}</td>
                                                    <td>
                                                        <span className={`role-badge role-${u.role}`}>
                                                            {u.role === 'admin' ? 'Admin' : 'Editor'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="page-access-badges">
                                                            {u.role === 'admin' ? (
                                                                <span className="access-badge access-all">All Pages</span>
                                                            ) : (u.allowedPages || []).length === ALL_PAGE_IDS.length ? (
                                                                <span className="access-badge access-all">All Pages</span>
                                                            ) : (u.allowedPages || []).length === 0 ? (
                                                                <span className="access-badge access-none">No Access</span>
                                                            ) : (
                                                                (u.allowedPages || []).map(p => {
                                                                    const page = ALL_BO_PAGES.find(bp => bp.id === p);
                                                                    return page ? (
                                                                        <span key={p} className="access-badge" title={page.label}>{page.icon}</span>
                                                                    ) : null;
                                                                })
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className={`status-toggle ${u.isActive ? 'status-toggle-active' : 'status-toggle-inactive'}`}
                                                            onClick={() => handleToggleActive(u)}
                                                            title={u.isActive ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                                                        >
                                                            {u.isActive ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className="text-gray text-sm">
                                                        {u.lastLoginAt
                                                            ? new Date(u.lastLoginAt).toLocaleString('th-TH')
                                                            : 'ยังไม่เคย'}
                                                    </td>
                                                    <td>
                                                        <div className="user-actions">
                                                            <button
                                                                className="btn-icon btn-icon-edit"
                                                                onClick={() => openEditModal(u)}
                                                                title="แก้ไข"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                            </button>
                                                            <button
                                                                className="btn-icon btn-icon-delete"
                                                                onClick={() => setShowDeleteConfirm(u)}
                                                                title="ลบ"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}


                    {/* ── System Info ── */}
                    {activeTab === 'system' && (
                        <div className="card settings-card">
                            <div className="settings-card-header">
                                <h2>{t('bo.settings.systemInfo', 'System Info')}</h2>
                                <p className="text-gray">{t('bo.settings.systemInfo', 'ข้อมูลเทคนิคของระบบ Backoffice')}</p>
                            </div>
                            <div className="system-info-grid">
                                <div className="system-info-item">
                                    <span className="system-info-label">Version</span>
                                    <span className="system-info-value">1.0.0</span>
                                </div>
                                <div className="system-info-item">
                                    <span className="system-info-label">Frontend</span>
                                    <span className="system-info-value">React + Vite</span>
                                </div>
                                <div className="system-info-item">
                                    <span className="system-info-label">Backend</span>
                                    <span className="system-info-value">NestJS + TypeORM</span>
                                </div>
                                <div className="system-info-item">
                                    <span className="system-info-label">Database</span>
                                    <span className="system-info-value">PostgreSQL</span>
                                </div>
                                <div className="system-info-item">
                                    <span className="system-info-label">API URL</span>
                                    <span className="system-info-value">{API_BASE_URL.replace('/api', '')}</span>
                                </div>
                                <div className="system-info-item">
                                    <span className="system-info-label">Frontend URL</span>
                                    <span className="system-info-value">{import.meta.env.VITE_FRONTEND_URL || ''}</span>
                                </div>
                                <div className="system-info-item">
                                    <span className="system-info-label">Backoffice URL</span>
                                    <span className="system-info-value">{window.location.origin}</span>
                                </div>
                                <div className="system-info-item">
                                    <span className="system-info-label">Server Time</span>
                                    <span className="system-info-value">{new Date().toLocaleString('th-TH')}</span>
                                </div>
                                <div className="system-info-item">
                                    <span className="system-info-label">Total Users</span>
                                    <span className="system-info-value">{users.length} คน</span>
                                </div>
                                <div className="system-info-item">
                                    <span className="system-info-label">Auth</span>
                                    <span className="system-info-value">Local + localStorage</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Privacy Policy Settings ── */}
                    {activeTab === 'privacy' && (
                        <PrivacyPolicyEditor />
                    )}
                </div>
            </div>

            {/* ════════ User Create/Edit Modal ════════ */}
            {showUserModal && (
                <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
                            <button className="modal-close" onClick={() => setShowUserModal(false)}>✕</button>
                        </div>

                        <div className="modal-body">
                            {userFormMsg && (
                                <div className="password-msg msg-error">{userFormMsg}</div>
                            )}

                            {/* Shared User Picker — only for create */}
                            {!editingUser && !isFromShared && (
                                <div className="settings-field">
                                    <label>เลือกผู้ใช้จากระบบกลาง</label>
                                    <div className="shared-user-picker">
                                        <input
                                            type="text"
                                            value={sharedSearch}
                                            onChange={e => setSharedSearch(e.target.value)}
                                            className="settings-input"
                                            placeholder="🔍 ค้นหา Employee ID หรืออีเมล..."
                                        />
                                        {sharedUsers.length > 0 && (
                                            <div className="shared-user-list">
                                                {sharedUsers
                                                    .filter(su => {
                                                        const q = sharedSearch.toLowerCase();
                                                        return !q || su.employeeId.toLowerCase().includes(q) || su.email.toLowerCase().includes(q);
                                                    })
                                                    .map(su => (
                                                        <button
                                                            key={su.employeeId}
                                                            className={`shared-user-item ${su.alreadyImported ? 'shared-user-imported' : ''}`}
                                                            onClick={() => !su.alreadyImported && handleSelectSharedUser(su)}
                                                            disabled={su.alreadyImported}
                                                        >
                                                            <span className="shared-user-avatar">{su.employeeId.charAt(0).toUpperCase()}</span>
                                                            <div className="shared-user-info">
                                                                <span className="shared-user-name">{su.employeeId}</span>
                                                                <span className="shared-user-email">{su.email || '-'}</span>
                                                            </div>
                                                            {su.alreadyImported && <span className="shared-user-badge">นำเข้าแล้ว</span>}
                                                            {!su.alreadyImported && <span className="shared-user-add">+ เพิ่ม</span>}
                                                        </button>
                                                    ))}
                                                {sharedUsers.filter(su => {
                                                    const q = sharedSearch.toLowerCase();
                                                    return !q || su.employeeId.toLowerCase().includes(q) || su.email.toLowerCase().includes(q);
                                                }).length === 0 && (
                                                    <div className="shared-user-empty">ไม่พบผู้ใช้ที่ตรงกับการค้นหา</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="shared-user-divider">
                                        <span>หรือ กรอกข้อมูลด้วยตนเอง</span>
                                    </div>
                                </div>
                            )}

                            {/* Selected shared user indicator */}
                            {!editingUser && isFromShared && (
                                <div className="settings-field">
                                    <div className="shared-user-selected">
                                        <span className="shared-user-avatar">{userForm.username.charAt(0).toUpperCase()}</span>
                                        <div>
                                            <strong>{userForm.username}</strong>
                                            <span className="text-gray"> — ผู้ใช้จากระบบกลาง</span>
                                        </div>
                                        <button className="btn-icon btn-icon-edit" onClick={() => { setIsFromShared(false); setUserForm(emptyForm); }} title="เปลี่ยน">
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Username — only for create (manual mode) */}
                            {!editingUser && !isFromShared && (
                                <div className="settings-field">
                                    <label>ชื่อผู้ใช้ (username) *</label>
                                    <input
                                        type="text"
                                        value={userForm.username}
                                        onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                                        className="settings-input"
                                        placeholder="เช่น johndoe"
                                    />
                                </div>
                            )}

                            <div className="settings-field">
                                <label>ชื่อที่แสดง (Display Name) *</label>
                                <input
                                    type="text"
                                    value={userForm.displayName}
                                    onChange={e => setUserForm({ ...userForm, displayName: e.target.value })}
                                    className="settings-input"
                                    placeholder="เช่น John Doe"
                                    autoFocus={!!editingUser}
                                />
                            </div>

                            <div className="settings-field">
                                <label>อีเมล</label>
                                <input
                                    type="email"
                                    value={userForm.email}
                                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                    className="settings-input"
                                    placeholder="example@techbiz.co.th"
                                />
                            </div>

                            <div className="settings-field-row">
                                <div className="settings-field">
                                    <label>{editingUser ? 'รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)' : isFromShared ? 'รหัสผ่าน (เว้นว่างใช้รหัสจากระบบกลาง)' : 'รหัสผ่าน *'}</label>
                                    <input
                                        type="password"
                                        value={userForm.password}
                                        onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                                        className="settings-input"
                                        placeholder={isFromShared ? 'เว้นว่างเพื่อใช้รหัสผ่านจากระบบกลาง' : 'อย่างน้อย 6 ตัวอักษร'}
                                    />
                                </div>
                                <div className="settings-field">
                                    <label>บทบาท</label>
                                    <select
                                        value={userForm.role}
                                        onChange={e => setUserForm({ ...userForm, role: e.target.value as 'admin' | 'editor' })}
                                        className="settings-input settings-select"
                                    >
                                        <option value="editor">Editor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            {editingUser && (
                                <div className="settings-field">
                                    <label>สถานะ</label>
                                    <div className="toggle-wrapper">
                                        <label className="toggle-label">
                                            <input
                                                type="checkbox"
                                                checked={userForm.isActive}
                                                onChange={e => setUserForm({ ...userForm, isActive: e.target.checked })}
                                            />
                                            <span className="toggle-slider" />
                                            <span className="toggle-text">{userForm.isActive ? 'Active' : 'Inactive'}</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Page Access Permissions */}
                            <div className="settings-field">
                                <label>หน้าที่เข้าถึงได้</label>
                                {userForm.role === 'admin' ? (
                                    <div className="permissions-note">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                        Admin สามารถเข้าถึงได้ทุกหน้า
                                    </div>
                                ) : (
                                    <div className="permissions-grid">
                                        <div className="permissions-select-all">
                                            <label className="permission-item">
                                                <input
                                                    type="checkbox"
                                                    checked={userForm.allowedPages.length === ALL_PAGE_IDS.length}
                                                    onChange={e => {
                                                        setUserForm({
                                                            ...userForm,
                                                            allowedPages: e.target.checked ? [...ALL_PAGE_IDS] : [],
                                                        });
                                                    }}
                                                />
                                                <span className="permission-label">เลือกทั้งหมด</span>
                                            </label>
                                        </div>
                                        {ALL_BO_PAGES.map(page => (
                                            <label key={page.id} className="permission-item">
                                                <input
                                                    type="checkbox"
                                                    checked={userForm.allowedPages.includes(page.id)}
                                                    onChange={e => {
                                                        const newPages = e.target.checked
                                                            ? [...userForm.allowedPages, page.id]
                                                            : userForm.allowedPages.filter(p => p !== page.id);
                                                        setUserForm({ ...userForm, allowedPages: newPages });
                                                    }}
                                                />
                                                <span className="permission-icon">{page.icon}</span>
                                                <span className="permission-label">{page.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowUserModal(false)}>
                                ยกเลิก
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveUser}
                                disabled={userFormLoading}
                            >
                                {userFormLoading ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════ Delete Confirmation Modal ════════ */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header modal-header-danger">
                            <h3>Confirm Delete</h3>
                            <button className="modal-close" onClick={() => setShowDeleteConfirm(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="delete-confirm-info">
                                <span className="user-cell-avatar" style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                                    {showDeleteConfirm.displayName.charAt(0).toUpperCase()}
                                </span>
                                <div>
                                    <div className="user-cell-name" style={{ fontSize: '1.05rem' }}>{showDeleteConfirm.displayName}</div>
                                    <div className="user-cell-username">@{showDeleteConfirm.username}</div>
                                </div>
                            </div>
                            <p className="delete-warning">
                                This action cannot be undone. Are you sure?
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>
                                ยกเลิก
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteUser(showDeleteConfirm)}
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
