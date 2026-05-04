import { useSystemConfig } from '@nexone/ui';
import React, { useEffect,  useState } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, StatusDropdown, BaseModal, ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Trash2, Eye, Shield, Building2, Mail, Hash } from 'lucide-react';
import Pagination from '@/components/Pagination';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  branch: string;
  status: boolean; // Changed to boolean to fit StatusDropdown
}

const INITIAL_USERS: User[] = [
  { id: 'USR-001', name: 'สมชาย รักดี', email: 'somchai.r@nexone.co.th', role: 'Super Admin', department: 'IT', branch: 'สำนักงานใหญ่', status: true },
  { id: 'USR-002', name: 'สมหญิง จริงใจ', email: 'somying.j@nexone.co.th', role: 'Fleet Manager', department: 'Logistics', branch: 'คลังสินค้าบางนา', status: true },
  { id: 'USR-003', name: 'วิชัย มั่นคง', email: 'wichai.m@nexone.co.th', role: 'Warehouse Lead', department: 'Warehouse', branch: 'คลังสินค้าบางนา', status: true },
  { id: 'USR-004', name: 'นารี สวยสด', email: 'naree.s@nexone.co.th', role: 'Accountant', department: 'Finance', branch: 'สำนักงานใหญ่', status: false },
  { id: 'USR-005', name: 'เอกพงษ์ กล้าหาญ', email: 'ekapong.k@nexone.co.th', role: 'Dispatcher', department: 'Logistics', branch: 'ศูนย์กระจายสินค้าภาคเหนือ', status: false },
];

export default function UserManagement() {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const { configs, loading: configLoading } = useSystemConfig();
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
    const [users, setUsers] = useState<User[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    
    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add'|'edit'|'view'|'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({ name: '', email: '', role: '', branch: '', department: '', status: true });

    const [roles, setRoles] = useState<{id: string | number, roleName: string}[]>([]);
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email: string) => {
        if (!email) {
            setEmailError('');
            return true;
        }
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) {
            setEmailError('รูปแบบอีเมล์ไม่ถูกต้อง');
            return false;
        }
        setEmailError('');
        return true;
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8101/api'}/users?page=${currentPage}&limit=${pageSize}&search=${search}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                const mappedUsers = (data.data || []).map((u: any) => ({
                    id: u.id,
                    name: u.displayName || '-',
                    email: u.email,
                    role: u.roleName,
                    department: u.costCenterCode || '-',
                    branch: u.companyId || '-',
                    status: u.isActive
                }));
                setUsers(mappedUsers);
                setTotalItems(data.total || 0);
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8101/api'}/roles`, { credentials: 'include' });
                if (res.ok) {
                    const data = await res.json();
                    setRoles(Array.isArray(data) ? data : data?.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch roles', err);
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, pageSize, search]);

    // Action Handlers
    const handleAdd = () => {
        setFormData({ name: '', email: '', role: '', branch: '', department: '', status: true });
        setEmailError('');
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (item: User) => {
        setFormData({ ...item });
        setSelectedItem(item);
        setEmailError('');
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (item: User) => {
        setFormData({ ...item });
        setSelectedItem(item);
        setEmailError('');
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleDelete = (item: User) => {
        setSelectedItem(item);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const saveForm = async () => {
        if (!formData.name?.trim()) return;
        if (formData.email && !validateEmail(formData.email)) return;
        
        const payload = {
            displayName: formData.name,
            email: formData.email,
            roleName: formData.role,
            isActive: formData.status,
            // Assuming branch = companyId, department = costCenterCode for demo mapping
            companyId: formData.branch !== '-' ? formData.branch : null,
            costCenterCode: formData.department !== '-' ? formData.department : null
        };

        try {
            if (modalMode === 'add') {
                const res = await fetch(`${process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8101/api'}/users`, { credentials: 'include', 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    fetchUsers();
                    setIsModalOpen(false);
                } else {
                    const errData = await res.json();
                    alert(errData.message || 'Error saving user');
                }
            } else if (modalMode === 'edit') {
                const res = await fetch(`${process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8101/api'}/users/${selectedItem?.id}`, { credentials: 'include', 
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    fetchUsers();
                    setIsModalOpen(false);
                } else {
                    const errData = await res.json();
                    alert(errData.message || 'Error saving user');
                }
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Cannot connect to server');
        }
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8101/api'}/users/${selectedItem.id}`, { credentials: 'include', 
                method: 'DELETE'
            });
            if (res.ok) {
                fetchUsers();
                setIsModalOpen(false);
            } else {
                alert('Error deleting user');
            }
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    // Filter - local filtering removed since API handles it via search
    const filteredData = users;
    const paginatedData = users;

    return (
        <CrudLayout
            toolbarLeft={
                <ExportButtons 
                    onExportXLSX={() => exportToXLSX(filteredData, 'Users', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'พนักงาน' },
                        { key: 'email', label: 'อีเมล์' },
                        { key: 'role', label: 'สิทธิ์' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'ใช้งาน' : 'ยกเลิก' }
                    ])}
                    onExportCSV={() => exportToCSV(filteredData, 'Users', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'พนักงาน' },
                        { key: 'email', label: 'อีเมล์' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'ใช้งาน' : 'ยกเลิก' }
                    ])}
                    onExportPDF={() => exportToPDF(filteredData, 'Users', [
                        { key: 'id', label: 'ID' },
                        { key: 'name', label: 'พนักงาน' },
                        { key: 'email', label: 'อีเมล์' },
                        { key: 'role', label: 'สิทธิ์' },
                        { key: 'status', label: 'สถานะ', format: (v: any) => v.status ? 'ใช้งาน' : 'ยกเลิก' }
                    ], 'User Account Report')}
                />
            }
            toolbarRight={
                <>
                    <SearchInput value={search} onChange={setSearch} placeholder="ค้นหาชื่อ, อีเมล์พนักงาน..." />
                    <button onClick={handleAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>เพิ่มผู้ใช้งาน</span></button>
                </>
            }
        >
            <div style={{ height: '720px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                        <th style={{ width: '130px' }}>รหัสพนักงาน</th>
                        <th>พนักงาน (Employee)</th>
                        <th>สิทธิ์การใช้งาน (Role)</th>
                        <th>สาขา / แผนก</th>
                        <th className="text-center" style={{ width: '120px' }}>สถานะ</th>
                        <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                                    <Hash size={14} style={{ opacity: 0.7 }} /> {item.id}
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                                        {item.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{item.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                            <Mail size={10} /> {item.email}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                    <Shield size={12} color="var(--accent-blue)" style={{ opacity: 0.8 }} /> {item.role}
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-primary)' }}>
                                        <Building2 size={12} color="var(--text-muted)" /> {item.branch}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '18px' }}>
                                        ฝ่าย/แผนก: {item.department}
                                    </div>
                                </div>
                            </td>
                            <td className="text-center">
                                <StatusDropdown 
                                    status={item.status} 
                                    onChange={async (val) => {
                                        try {
                                            const res = await fetch(`${process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:8101/api'}/users/${item.id}`, { credentials: 'include', 
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ isActive: val })
                                            });
                                            if (res.ok) {
                                                setUsers(prev => prev.map(d => d.id === item.id ? { ...d, status: val } : d));
                                            } else {
                                                alert('Failed to update status');
                                            }
                                        } catch (e) {
                                            console.error(e);
                                            alert('Failed to connect to server');
                                        }
                                    }} 
                                />
                            </td>
                            <td className="text-center" style={{ paddingRight: '24px' }}>
                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                    <button onClick={() => handleView(item)} style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title="เรียกดู">
                                        <Eye size={14} />
                                    </button>
                                    <button onClick={() => handleEdit(item)} style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title="แก้ไข">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(item)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title="ลบ">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
                                ไม่พบข้อมูล
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>

            {totalItems > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
            )}

            <BaseModal 
                isOpen={isModalOpen && modalMode !== 'delete'} 
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? 'เพิ่มผู้ใช้งานใหม่' : modalMode === 'edit' ? 'แก้ไขบัญชีผู้ใช้งาน' : 'รายละเอียดผู้ใช้งาน'}
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                            <button onClick={saveForm} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: formData.name?.trim() ? 1 : 0.5 }} disabled={!formData.name?.trim()}>{modalMode === 'add' ? 'เพิ่มผู้ใช้งาน' : 'บันทึกข้อมูล'}</button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>ปิด</button>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>ชื่อพนักงาน <span style={{color: '#ef4444'}}>*</span></label>
                        <input type="text" style={crudStyles.input} placeholder="ระบุชื่อจริง-นามสกุล" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>อีเมล์</label>
                        <input 
                            type="email" 
                            style={{ ...crudStyles.input, borderColor: emailError ? '#ef4444' : 'var(--border-color)' }} 
                            placeholder="user@nexone.co.th" 
                            value={formData.email || ''} 
                            onChange={(e) => {
                                setFormData({...formData, email: e.target.value});
                                if (emailError) validateEmail(e.target.value);
                            }} 
                            onBlur={(e) => validateEmail(e.target.value)}
                            disabled={modalMode === 'view'} 
                        />
                        {emailError && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{emailError}</span>}
                    </div>
                    <div>
                        <label style={crudStyles.label}>สิทธิ์การใช้งาน (Role)</label>
                        <select style={crudStyles.input} value={formData.role || ''} onChange={(e) => setFormData({...formData, role: e.target.value})} disabled={modalMode === 'view'}>
                            <option value="">-- เลือกสิทธิ์การใช้งาน --</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.roleName}>{r.roleName}</option>
                            ))}
                            {/* Fallback if API fails to load roles */}
                            {roles.length === 0 && (
                                <>
                                    <option value="Super Admin">Super Admin</option>
                                    <option value="Fleet Manager">Fleet Manager</option>
                                    <option value="Warehouse Lead">Warehouse Lead</option>
                                    <option value="Accountant">Accountant</option>
                                    <option value="Dispatcher">Dispatcher</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>
            </BaseModal>

            <BaseModal 
                isOpen={isModalOpen && modalMode === 'delete'} 
                onClose={() => setIsModalOpen(false)}
                title="ยืนยันการลบข้อมูล"
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ยกเลิก</button>
                        <button onClick={confirmDelete} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>ลบข้อมูล</button>
                    </>
                }
            >
                <div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน <strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.name}</strong> ?</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>การกระทำนี้จะไม่สามารถย้อนกลับได้</p>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}
