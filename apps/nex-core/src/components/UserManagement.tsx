import React, { useState, useEffect, useCallback } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, AdvancedSearchModal, AdvancedSearchField, crudStyles, StatusDropdown, BaseModal, ExportButtons } from '@/components/CrudComponents';
import ImportExcelButton from '@/components/ImportExcelButton';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Info, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, ChevronsUpDown, Settings, Key } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { coreUserApi, coreRoleApi } from '@/services/api';
import { usePagePermission } from '@/contexts/PermissionContext';
import { useSystemConfig, useLanguage } from '@nexone/ui';
import { useApiConfig } from '@/contexts/ApiConfigContext';
import { format } from 'date-fns';

export default function UserManagement() {
    const perm = usePagePermission('users');
    const { lang } = useLanguage();
    const { getEndpoint } = useApiConfig();
    const { configs, loading: configLoading } = useSystemConfig();
    const coreApi = getEndpoint('NexCore', '');
    const [t, setT] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const res = await fetch(`${coreApi}/translations/map?lang=${lang}`, { credentials: 'include' });
                const data = await res.json();
                if (data && typeof data === 'object') {
                    setT(data);
                }
            } catch (err) {
                console.error('Failed to load translations:', err);
            }
        };
        if (coreApi && lang) {
            fetchTranslations();
        }
    }, [coreApi, lang]);

    const [data, setData] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({ key: '', direction: null });

    // Column Settings State
    const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        id: true,
        employeeId: true,
        displayName: true,
        email: true,
        roleName: true,
        language: true,
        mfaEnabled: true,
        changePassword: true,
        isActive: true
    });

    const [isChangePwdModalOpen, setIsChangePwdModalOpen] = useState(false);
    const [changePwdItem, setChangePwdItem] = useState<any>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Advanced Search State
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [advSearchValues, setAdvSearchValues] = useState<Record<string, string>>({ displayName: '', email: '', status: 'all' });

    const advancedSearchFields: AdvancedSearchField[] = [
        { key: 'displayName', label: t['name'] || 'ชื่อพนักงาน', type: 'text', placeholder: t['name'] || 'พิมพ์ชื่อพนักงาน...' },
        { key: 'email', label: t['email'] || 'อีเมล์', type: 'text', placeholder: t['email'] || 'พิมพ์อีเมล์...' },
        {
            key: 'status', label: t['status'] || 'สถานะ', type: 'select', options: [
                { value: 'all', label: t['all'] || 'ทั้งหมด' },
                { value: 'active', label: t['active'] || 'ใช้งาน' },
                { value: 'inactive', label: t['inactive'] || 'ยกเลิก' },
            ]
        },
    ];

    const handleAdvSearchChange = (key: string, value: string) => {
        setAdvSearchValues(prev => ({ ...prev, [key]: value }));
    };
    const handleAdvSearchClear = () => {
        setAdvSearchValues({ displayName: '', email: '', status: 'all' });
    };
    const handleAdvSearchSubmit = () => {
        setCurrentPage(1);
        setShowAdvancedSearch(false);
    };

    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view' | 'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [formData, setFormData] = useState({ displayName: '', email: '', roleId: '', password: '', isActive: true, language: 'TH', mfaEnabled: false, employeeId: '' });
    const [saving, setSaving] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, message: string, isError: boolean}>({isOpen: false, message: '', isError: false});
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email: string) => {
        if (!email) {
            setEmailError('');
            return true;
        }
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) {
            setEmailError(t['invalid_email'] || 'รูปแบบอีเมล์ไม่ถูกต้อง');
            return false;
        }
        setEmailError('');
        return true;
    };

    const [languages, setLanguages] = useState<any[]>([]);

    const loadData = useCallback(() => {
        setLoading(true);
        coreUserApi.getAll(1, 1000, '') // Fetch all for local pagination/filtering to match Master template behaviors
            .then(res => { setData(res || []); })
            .catch(err => { console.error('Failed to load users:', err); setData([]); })
            .finally(() => setLoading(false));
    }, []);

    const loadRoles = useCallback(() => {
        coreRoleApi.getAll()
            .then(res => { 
                const sortedRoles = (res || []).sort((a: any, b: any) => 
                    (a.roleName || '').localeCompare(b.roleName || '')
                );
                setRoles(sortedRoles); 
            })
            .catch(err => console.error('Failed to load roles', err));
    }, []);

    const fetchLanguages = useCallback(async () => {
        if (!coreApi) return;
        try {
            const res = await fetch(`${coreApi}/translations/languages`, { credentials: 'include' });
            const json = await res.json();
            const items = Array.isArray(json) ? json : (json?.data || []);
            setLanguages(items.sort((a: any, b: any) => 
                (a.languageName || '').localeCompare(b.languageName || '')
            ));
        } catch (err) {
            console.error('Failed to load languages:', err);
        }
    }, [coreApi]);

    useEffect(() => { 
        loadData(); 
        loadRoles(); 
        fetchLanguages();
    }, [loadData, loadRoles, fetchLanguages]);

    // Action Handlers
    const handleAdd = () => {
        setFormData({ displayName: '', email: '', roleId: '', password: '', isActive: true, language: 'TH', mfaEnabled: false, employeeId: '' });
        setEmailError('');
        setModalMode('add');
        setIsModalOpen(true);
    };
    const handleEdit = (item: any) => {
        setFormData({ 
            displayName: item.displayName || '', 
            email: item.email || '', 
            roleId: item.roleId || '', 
            password: '', 
            isActive: item.isActive,
            language: item.language || 'TH',
            mfaEnabled: item.mfaEnabled || false,
            employeeId: item.employeeId || ''
        });
        setSelectedItem(item);
        setEmailError('');
        setModalMode('edit');
        setIsModalOpen(true);
    };
    const handleView = (item: any) => {
        setFormData({ 
            displayName: item.displayName || '', 
            email: item.email || '', 
            roleId: item.roleId || '', 
            password: '', 
            isActive: item.isActive,
            language: item.language || 'TH',
            mfaEnabled: item.mfaEnabled || false,
            employeeId: item.employeeId || ''
        });
        setSelectedItem(item);
        setEmailError('');
        setModalMode('view');
        setIsModalOpen(true);
    };
    const handleDelete = (item: any) => {
        setSelectedItem(item);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const handleChangePassword = (item: any) => {
        setChangePwdItem(item);
        setNewPassword('');
        setConfirmPassword('');
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setIsChangePwdModalOpen(true);
    };

    const saveForm = async () => {
        if (!formData.displayName?.trim()) {
            setAlertConfig({isOpen: true, message: t['require_name'] || 'กรุณาระบุชื่อพนักงาน', isError: true});
            return;
        }
        if (formData.email && !validateEmail(formData.email)) {
            setAlertConfig({isOpen: true, message: t['require_valid_email'] || 'รูปแบบอีเมล์ไม่ถูกต้อง', isError: true});
            return;
        }

        setSaving(true);
        try {
            const payload: any = {
                displayName: formData.displayName,
                email: formData.email,
                roleId: formData.roleId || null,
                isActive: formData.isActive,
                language: formData.language,
                mfaEnabled: formData.mfaEnabled,
                employeeId: formData.employeeId || null
            };
            if (formData.password) payload.password = formData.password;

            if (modalMode === 'add') {
                await coreUserApi.create(payload);
                setAlertConfig({isOpen: true, message: t['save_success'] || 'บันทึกข้อมูลเรียบร้อยแล้ว', isError: false});
            } else if (modalMode === 'edit' && selectedItem) {
                await coreUserApi.update(selectedItem.id, payload);
                setAlertConfig({isOpen: true, message: t['save_success'] || 'บันทึกข้อมูลเรียบร้อยแล้ว', isError: false});
            }
            setIsModalOpen(false);
            loadData();
        } catch (err: any) { 
            console.error(err);
            setAlertConfig({isOpen: true, message: err.message || t['error_saving'] || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', isError: true});
        }
        setSaving(false);
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        setSaving(true);
        try {
            await coreUserApi.remove(selectedItem.id);
            setAlertConfig({isOpen: true, message: t['delete_success'] || 'ลบข้อมูลเรียบร้อยแล้ว', isError: false});
            setIsModalOpen(false);
            loadData();
        } catch (err: any) { 
            console.error(err); 
            setAlertConfig({isOpen: true, message: err.message || t['error_deleting'] || 'ลบข้อมูลไม่สำเร็จ', isError: true});
        }
        setSaving(false);
    };

    const saveNewPassword = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            setAlertConfig({isOpen: true, message: t['password_mismatch'] || 'รหัสผ่านไม่ตรงกัน หรือไม่ได้กรอก', isError: true});
            return;
        }
        setSaving(true);
        try {
            await coreUserApi.update(changePwdItem.id, { password: newPassword });
            setAlertConfig({isOpen: true, message: t['password_change_success'] || 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว', isError: false});
            setIsChangePwdModalOpen(false);
        } catch (err: any) {
            console.error(err);
            setAlertConfig({isOpen: true, message: err.message || t['error_saving'] || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', isError: true});
        }
        setSaving(false);
    };

    const handleToggleStatus = async (item: any, val: boolean) => {
        try {
            await coreUserApi.update(item.id, { isActive: val });
            setData(prev => prev.map(d => d.id === item.id ? { ...d, isActive: val } : d));
        } catch (err: any) { 
            console.error(err); 
            setAlertConfig({isOpen: true, message: err.message || t['error_saving'] || 'เปลี่ยนสถานะไม่สำเร็จ', isError: true});
        }
    };

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' | null = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') direction = null;
            else direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const searchLower = search.toLowerCase();
    const filteredData = Array.isArray(data) ? data.filter(item => {
        // Quick search
        const matchQuickSearch = !searchLower ||
            (item.displayName || '').toLowerCase().includes(searchLower) ||
            (item.email || '').toLowerCase().includes(searchLower);

        // Advanced search filters
        const matchName = !advSearchValues.displayName || (item.displayName || '').toLowerCase().includes(advSearchValues.displayName.toLowerCase());
        const matchEmail = !advSearchValues.email || (item.email || '').toLowerCase().includes(advSearchValues.email.toLowerCase());
        const matchStatus = advSearchValues.status === 'all' || advSearchValues.status === '' ||
            (advSearchValues.status === 'active' && item.isActive) ||
            (advSearchValues.status === 'inactive' && !item.isActive);
        const matchEmpId = !advSearchValues.employeeId || (item.employeeId || '').toLowerCase().includes(advSearchValues.employeeId.toLowerCase());

        return matchQuickSearch && matchName && matchEmail && matchStatus && matchEmpId;
    }) : [];

    let sortedData = [...filteredData];
    if (sortConfig.key && sortConfig.direction !== null) {
        sortedData.sort((a, b) => {
            const aVal = (a as any)[sortConfig.key];
            const bVal = (b as any)[sortConfig.key];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const renderSortIcon = (columnKey: string) => {
        if (sortConfig.key !== columnKey || sortConfig.direction === null) {
            return <ChevronsUpDown size={14} style={{ opacity: 0.3 }} />;
        }
        if (sortConfig.direction === 'asc') {
            return <ArrowDown size={14} />;
        }
        return <ArrowUp size={14} />;
    };

    const renderTh = (label: string, columnKey: string, width?: string) => (
        <th
            style={{ width, cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}
            onClick={() => handleSort(columnKey)}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <span>{label}</span>
                {renderSortIcon(columnKey)}
            </div>
        </th>
    );

    const handleImport = async (importData: any[]) => {
        let success = 0;
        let failed = 0;
        try {
            for (const item of importData) {
                if (item.displayName && item.email) {
                    await coreUserApi.create({
                        displayName: item.displayName,
                        email: item.email,
                        isActive: true
                    });
                    success++;
                } else {
                    failed++;
                }
            }
        } catch (err) {
            console.error('Import failed:', err);
        }
        return { success, failed };
    };

    const getRoleName = (item: any) => {
        if (item.role?.roleName) return item.role.roleName;
        const role = roles.find((r: any) => (r.roleId || r.id) === item.roleId);
        return role ? role.roleName : '-';
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <CrudLayout
            toolbarLeft={
                <div style={{ display: 'flex', gap: '8px' }}>
                    {perm.canExport && (
                        <ExportButtons
                            t={t}
                            onExportXLSX={() => exportToXLSX(filteredData, 'Users', [
                                { key: 'id', label: t['id'] || 'ID' },
                                { key: 'displayName', label: t['name'] || 'ชื่อพนักงาน' },
                                { key: 'email', label: t['email'] || 'อีเมล์' },
                                { key: 'roleId', label: t['role'] || 'สิทธิ์', format: (v: any) => getRoleName(v.roleId) },
                                { key: 'language', label: t['language'] || 'ภาษา' },
                                { key: 'mfaEnabled', label: 'MFA', format: (v: any) => v.mfaEnabled ? 'Enabled' : 'Disabled' },
                                { key: 'isActive', label: t['is_active'] || 'สถานะ', format: (v: any) => v.isActive ? (t['active'] || 'ใช้งาน') : (t['inactive'] || 'ยกเลิก') }
                            ])}
                            onExportCSV={() => exportToCSV(filteredData, 'Users', [
                                { key: 'id', label: t['id'] || 'ID' },
                                { key: 'displayName', label: t['name'] || 'ชื่อพนักงาน' },
                                { key: 'email', label: t['email'] || 'อีเมล์' },
                                { key: 'roleId', label: t['role'] || 'สิทธิ์', format: (v: any) => getRoleName(v.roleId) },
                                { key: 'language', label: t['language'] || 'ภาษา' },
                                { key: 'mfaEnabled', label: 'MFA', format: (v: any) => v.mfaEnabled ? 'Enabled' : 'Disabled' },
                                { key: 'isActive', label: t['is_active'] || 'สถานะ', format: (v: any) => v.isActive ? (t['active'] || 'ใช้งาน') : (t['inactive'] || 'ยกเลิก') }
                            ])}
                            onExportPDF={(orientation) => exportToPDF(filteredData, 'Users', [
                                { key: 'id', label: t['id'] || 'ID' },
                                { key: 'displayName', label: t['name'] || 'ชื่อพนักงาน' },
                                { key: 'email', label: t['email'] || 'อีเมล์' },
                                { key: 'roleId', label: t['role'] || 'สิทธิ์', format: (v: any) => getRoleName(v.roleId) },
                                { key: 'language', label: t['language'] || 'ภาษา' },
                                { key: 'mfaEnabled', label: 'MFA', format: (v: any) => v.mfaEnabled ? 'Enabled' : 'Disabled' },
                                { key: 'isActive', label: t['is_active'] || 'สถานะ', format: (v: any) => v.isActive ? (t['active'] || 'ใช้งาน') : (t['inactive'] || 'ยกเลิก') }
                            ], 'User Account Report', orientation)}
                        />
                    )}
                    {perm.canImport && (
                        <ImportExcelButton

                            columns={[
                                { header: t['name'] || 'ชื่อพนักงาน', key: 'displayName', required: true },
                                { header: t['email'] || 'อีเมล์', key: 'email', required: true }
                            ]}
                            filenamePrefix="Users_Import"
                            onImport={handleImport}
                            onImportComplete={() => loadData()}
                        />
                    )}
                </div>
            }
            toolbarRight={
                <>
                    {perm.canView && <SearchInput
                        value={search}
                        onChange={(val) => { setSearch(val); setCurrentPage(1); }}
                        onClear={() => { setSearch(''); setCurrentPage(1); handleAdvSearchClear(); }}
                        placeholder={t['search_placeholder_user'] || 'ค้นหาชื่อ, อีเมล์...'}
                        onAdvancedSearch={() => setShowAdvancedSearch(true)}
                        advancedSearchValues={advSearchValues}
                        onAdvancedSearchClear={handleAdvSearchClear}
                        t={t}
                    />}
                    {perm.canAdd && <button onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', height: '38.39px', fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> <span>{t['add_user_button'] || 'เพิ่มผู้ใช้งาน'}</span></button>}
                </>
            }
        >
            {(() => {
                const hasActions = perm.canView || perm.canEdit || perm.canDelete;
                return (
                    <div style={{ height: '720px', overflowY: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {visibleColumns.employeeId && renderTh(t['employee_id'] || 'รหัสพนักงาน', 'employeeId', '130px')}
                                    {visibleColumns.displayName && renderTh(t['name'] || 'ชื่อพนักงาน', 'displayName')}
                                    {visibleColumns.email && renderTh(t['email'] || 'อีเมล์', 'email')}
                                    {visibleColumns.roleName && renderTh(t['role'] || 'สิทธิ์การใช้งาน', 'roleId')}
                                    {visibleColumns.language && renderTh(t['language'] || 'ภาษา', 'language', '100px')}
                                    {visibleColumns.mfaEnabled && renderTh('MFA', 'mfaEnabled', '80px')}
                                    {visibleColumns.changePassword && <th className="text-center" style={{ width: '120px' }}>{t['change_password'] || 'เปลี่ยนรหัสผ่าน'}</th>}
                                    {visibleColumns.isActive && renderTh(t['is_active'] || 'สถานะ', 'isActive', '100px')}
                                    {hasActions && <th className="text-center" style={{ width: '100px', paddingRight: '16px', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                            <span>{t['action'] || 'จัดการ'}</span>
                                            {perm.canView && (
                                                <span title={t['column_settings'] || 'ตั้งค่าคอลัมน์'} style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Settings size={16} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setIsColumnSettingsOpen(true)} />
                                                </span>
                                            )}
                                        </div>
                                    </th>}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((item) => (
                                    <tr key={item.id}>
                                        {visibleColumns.employeeId && <td className="text-medium font-medium" style={{ color: 'var(--accent-blue)', fontSize: '12px' }}>{item.employee?.employeeCode || item.employeeId || '-'}</td>}
                                        {visibleColumns.displayName && <td><span className="font-medium" style={{ color: 'var(--accent-blue)' }}>{item.displayName}</span></td>}
                                        {visibleColumns.email && <td className="text-muted">{item.email}</td>}
                                        {visibleColumns.roleName && <td className="text-muted">{getRoleName(item)}</td>}
                                        {visibleColumns.language && <td className="text-center text-muted">{item.language || '-'}</td>}
                                        {visibleColumns.mfaEnabled && <td className="text-center">
                                            <span style={{ 
                                                padding: '2px 8px', 
                                                borderRadius: '12px', 
                                                fontSize: '11px', 
                                                fontWeight: 600,
                                                background: item.mfaEnabled ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                                                color: item.mfaEnabled ? '#10b981' : '#64748b',
                                                border: `1px solid ${item.mfaEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)'}`
                                            }}>
                                                {item.mfaEnabled ? 'ON' : 'OFF'}
                                            </span>
                                        </td>}
                                        {visibleColumns.changePassword && <td className="text-center">
                                            {perm.canEdit && (
                                                <button onClick={() => handleChangePassword(item)} style={{ ...crudStyles.actionBtn, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', margin: '0 auto' }} title={t['change_password'] || "เปลี่ยนรหัสผ่าน"}>
                                                    <Key size={14} />
                                                </button>
                                            )}
                                        </td>}
                                        {visibleColumns.isActive && <td className="text-center">
                                            <StatusDropdown status={item.isActive} onChange={(val) => handleToggleStatus(item, val)} disabled={!perm.canEdit} t={t} />
                                        </td>}
                                        {hasActions && (
                                            <td className="text-center" style={{ paddingRight: '24px' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                    {perm.canView && <button onClick={() => handleView(item)} style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title={t['view_tooltip'] || "เรียกดู"}><Eye size={14} /></button>}
                                                    {perm.canEdit && <button onClick={() => handleEdit(item)} style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title={t['edit_tooltip'] || "แก้ไข"}><Edit2 size={14} /></button>}
                                                    {perm.canDelete && <button onClick={() => handleDelete(item)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title={t['delete_tooltip'] || "ลบ"}><Trash2 size={14} /></button>}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr><td colSpan={Object.values(visibleColumns).filter(Boolean).length + (hasActions ? 1 : 0)} className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>{t['no_data'] || 'ไม่พบข้อมูล'}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                );
            })()}

            {filteredData.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={filteredData.length}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                    t={t}
                />
            )}

            {/* Modal Add/Edit/View */}
            <BaseModal
                isOpen={isModalOpen && modalMode !== 'delete'}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === 'add' ? (t['modal_add_user_title'] || 'เพิ่มผู้ใช้งานใหม่') : modalMode === 'edit' ? (t['modal_edit_user_title'] || 'แก้ไขบัญชีผู้ใช้งาน') : (t['modal_view_user_title'] || 'รายละเอียดผู้ใช้งาน')}
                footer={
                    modalMode !== 'view' ? (
                        <>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>{t['cancel'] || 'ยกเลิก'}</button>
                            <button onClick={saveForm} disabled={saving}
                                style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: saving ? 0.5 : 1 }}>
                                {saving ? (t['saving'] || 'กำลังบันทึก...') : modalMode === 'add' ? (t['add_button'] || 'เพิ่มข้อมูล') : (t['save_button'] || 'บันทึกข้อมูล')}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t['close'] || 'ปิด'}</button>
                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={crudStyles.label}>{t['employee_id'] || 'รหัสพนักงาน'}</label>
                            <input type="text" style={crudStyles.input} placeholder={t['employee_id_placeholder'] || "ระบุรหัสพนักงาน"}
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                disabled={modalMode === 'view' || modalMode === 'edit'} />
                        </div>
                        <div>
                            <label style={crudStyles.label}>{t['name'] || 'ชื่อพนักงาน'} <span style={{ color: '#ef4444' }}>*</span></label>
                            <input type="text" style={crudStyles.input} placeholder={t['name_placeholder'] || "ระบุชื่อจริง-นามสกุล"}
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                disabled={modalMode === 'view'} />
                        </div>
                    </div>
                    <div>
                        <label style={crudStyles.label}>{t['email'] || 'อีเมล์'}</label>
                        <input type="email" style={{ ...crudStyles.input, borderColor: emailError ? '#ef4444' : 'var(--border-color)' }}
                            placeholder="user@nexone.co.th"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (emailError) validateEmail(e.target.value);
                            }}
                            onBlur={(e) => validateEmail(e.target.value)}
                            disabled={modalMode === 'view'} />
                        {emailError && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{emailError}</span>}
                    </div>
                    <div>
                        <label style={crudStyles.label}>{t['password'] || 'รหัสผ่าน'}</label>
                        <input type="password" style={crudStyles.input} placeholder={modalMode === 'edit' ? (t['password_placeholder_edit'] || "เว้นว่างถ้าไม่ต้องการเปลี่ยน") : (t['password_placeholder'] || "กำหนดรหัสผ่าน")}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            disabled={modalMode === 'view'} />
                    </div>
                    <div>
                        <label style={crudStyles.label}>{t['role'] || 'สิทธิ์การใช้งาน (Role)'}</label>
                        <select style={crudStyles.input} value={formData.roleId} onChange={(e) => setFormData({ ...formData, roleId: e.target.value })} disabled={modalMode === 'view'}>
                            <option value="">{t['select_role'] || '-- เลือกสิทธิ์การใช้งาน --'}</option>
                            {roles.map((r: any) => (
                                <option key={r.roleId || r.id} value={r.roleId || r.id}>{r.roleName}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={crudStyles.label}>{t['language'] || 'ภาษา (Language)'}</label>
                            <select style={crudStyles.input} value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} disabled={modalMode === 'view'}>
                                <option value="TH">Thai (TH)</option>
                                <option value="EN">English (EN)</option>
                                {languages.filter(l => l.languageCode !== 'TH' && l.languageCode !== 'EN').map(l => (
                                    <option key={l.id} value={l.languageCode}>{l.languageName} ({l.languageCode})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={crudStyles.label}>MFA (Multi-Factor Auth)</label>
                            <div style={{ display: 'flex', alignItems: 'center', height: '38px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: modalMode === 'view' ? 'default' : 'pointer' }}>
                                    <input type="checkbox" 
                                        checked={formData.mfaEnabled} 
                                        onChange={(e) => setFormData({ ...formData, mfaEnabled: e.target.checked })} 
                                        disabled={modalMode === 'view'}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span style={{ fontSize: '14px', color: formData.mfaEnabled ? '#10b981' : 'var(--text-muted)', fontWeight: 500 }}>
                                        {formData.mfaEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    {modalMode === 'view' && (
                        <div>
                            <label style={crudStyles.label}>{t['usage_status'] || 'สถานะการใช้งาน'}</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <StatusDropdown status={formData.isActive}
                                    onChange={(val) => { if (modalMode !== 'view') setFormData({ ...formData, isActive: val }); }}
                                    disabled={modalMode === 'view'} t={t} />
                                {modalMode === 'view' && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t['view_only_remark'] || '*(ดูอย่างเดียว)'}</span>}
                            </div>
                        </div>
                    )}

                </div>
            </BaseModal>

            {/* Delete Confirm Modal */}
            <BaseModal
                isOpen={isModalOpen && modalMode === 'delete'}
                onClose={() => setIsModalOpen(false)}
                title={t['delete_confirm_title'] || 'ยืนยันการลบข้อมูล'}
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t['cancel'] || 'ยกเลิก'}</button>
                        <button onClick={confirmDelete} disabled={saving} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: saving ? 0.5 : 1 }}>{saving ? (t['deleting'] || 'กำลังลบ...') : (t['delete_button'] || 'ลบข้อมูล')}</button>
                    </>
                }
            >
                <div>
                    <p style={{ margin: '0 0 16px 0', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {t['delete_confirm_message'] || 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล'}
                        <br />
                        <strong style={{ color: 'var(--text-primary)', fontSize: '16px', display: 'block', marginTop: '8px' }}>
                            {selectedItem?.displayName}
                        </strong>
                    </p>
                </div>
            </BaseModal>

            {/* Change Password Modal */}
            <BaseModal
                isOpen={isChangePwdModalOpen}
                onClose={() => setIsChangePwdModalOpen(false)}
                title={(t['change_password'] || 'เปลี่ยนรหัสผ่าน') + ` - ${changePwdItem?.displayName || ''}`}
                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsChangePwdModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t['cancel'] || 'ยกเลิก'}</button>
                        <button onClick={saveNewPassword} disabled={saving} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, opacity: saving ? 0.5 : 1 }}>{saving ? (t['saving'] || 'กำลังบันทึก...') : (t['save_button'] || 'บันทึก')}</button>
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>{t['new_password'] || 'รหัสผ่านใหม่'} <span style={{ color: '#ef4444' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <input type={showNewPassword ? "text" : "password"} style={{ ...crudStyles.input, paddingRight: '40px' }} placeholder={t['new_password_placeholder'] || 'กำหนดรหัสผ่านใหม่'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)} />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}
                            >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label style={crudStyles.label}>{t['confirm_new_password'] || 'ยืนยันรหัสผ่านใหม่'} <span style={{ color: '#ef4444' }}>*</span></label>
                        <div style={{ position: 'relative' }}>
                            <input type={showConfirmPassword ? "text" : "password"} style={{ ...crudStyles.input, paddingRight: '40px' }} placeholder={t['confirm_new_password_placeholder'] || 'ยืนยันรหัสผ่านใหม่อีกครั้ง'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </BaseModal>

            {/* Custom Alert Modal */}
            <BaseModal 
                isOpen={alertConfig.isOpen} 
                onClose={() => setAlertConfig({...alertConfig, isOpen: false})}
                title={alertConfig.isError ? (t['error_title'] || "แจ้งเตือนข้อผิดพลาด") : (t['success_title'] || "สำเร็จ")}
                width="400px"
                footer={
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <button 
                            onClick={() => setAlertConfig({...alertConfig, isOpen: false})} 
                            style={{ 
                                padding: '10px 32px', 
                                background: alertConfig.isError ? '#ef4444' : 'var(--accent-green)', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontWeight: 600,
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.1s'
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {t['ok_button'] || 'ตกลง'}
                        </button>
                    </div>
                }
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%', 
                        background: alertConfig.isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 16px' 
                    }}>
                        {alertConfig.isError ? (
                            <Info size={32} style={{ color: '#ef4444' }} />
                        ) : (
                            <div style={{ color: '#10b981', fontSize: '32px', fontWeight: 'bold' }}>✓</div>
                        )}
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px', fontWeight: 500, lineHeight: '1.6' }}>
                        {alertConfig.message}
                    </p>
                </div>
            </BaseModal>

            {/* Column Settings Modal */}
            <BaseModal
                isOpen={isColumnSettingsOpen}
                onClose={() => setIsColumnSettingsOpen(false)}
                title={t['column_settings_title'] || 'ตั้งค่าการแสดงผลตาราง'}
                width="450px"
                footer={
                    <button onClick={() => setIsColumnSettingsOpen(false)} style={{ padding: '8px 16px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>{t['ok_button'] || 'ตกลง'}</button>
                }
            >
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{t['select_columns_to_show'] || 'เลือกคอลัมน์ที่ต้องการแสดง'}</h4>
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, width: '130px' }}>{t['sort_data'] || 'เรียงลำดับข้อมูล'}</h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* ID */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.employeeId} onChange={(e) => setVisibleColumns({ ...visibleColumns, employeeId: e.target.checked })} /> {t['employee_id'] || 'รหัสพนักงาน'}
                            </label>
                            <select
                                style={{ ...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0 }}
                                value={sortConfig.key === 'employeeId' && sortConfig.direction !== null ? sortConfig.direction : 'none'}
                                onChange={(e) => setSortConfig({ key: 'employeeId', direction: e.target.value === 'none' ? null : e.target.value as 'asc' | 'desc' })}
                            >
                                <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                                <option value="asc">{t['sort'] || 'เรียง'}</option>
                            </select>
                        </div>

                        {/* Name */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.displayName} onChange={(e) => setVisibleColumns({ ...visibleColumns, displayName: e.target.checked })} /> {t['name'] || 'ชื่อพนักงาน'}
                            </label>
                            <select
                                style={{ ...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0 }}
                                value={sortConfig.key === 'displayName' && sortConfig.direction !== null ? sortConfig.direction : 'none'}
                                onChange={(e) => setSortConfig({ key: 'displayName', direction: e.target.value === 'none' ? null : e.target.value as 'asc' | 'desc' })}
                            >
                                <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                                <option value="asc">{t['sort'] || 'เรียง'}</option>
                            </select>
                        </div>

                        {/* Email */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.email} onChange={(e) => setVisibleColumns({ ...visibleColumns, email: e.target.checked })} /> {t['email'] || 'อีเมล์'}
                            </label>
                            <select
                                style={{ ...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0 }}
                                value={sortConfig.key === 'email' && sortConfig.direction !== null ? sortConfig.direction : 'none'}
                                onChange={(e) => setSortConfig({ key: 'email', direction: e.target.value === 'none' ? null : e.target.value as 'asc' | 'desc' })}
                            >
                                <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                                <option value="asc">{t['sort'] || 'เรียง'}</option>
                            </select>
                        </div>

                        {/* Role */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.roleName} onChange={(e) => setVisibleColumns({ ...visibleColumns, roleName: e.target.checked })} /> {t['role'] || 'สิทธิ์การใช้งาน'}
                            </label>
                            <select disabled style={{ ...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0, opacity: 0.5 }}>
                                <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                            </select>
                        </div>

                        {/* Language */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.language} onChange={(e) => setVisibleColumns({ ...visibleColumns, language: e.target.checked })} /> {t['language'] || 'ภาษา'}
                            </label>
                            <select
                                style={{ ...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0 }}
                                value={sortConfig.key === 'language' && sortConfig.direction !== null ? sortConfig.direction : 'none'}
                                onChange={(e) => setSortConfig({ key: 'language', direction: e.target.value === 'none' ? null : e.target.value as 'asc' | 'desc' })}
                            >
                                <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                                <option value="asc">{t['sort'] || 'เรียง'}</option>
                            </select>
                        </div>

                        {/* MFA */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.mfaEnabled} onChange={(e) => setVisibleColumns({ ...visibleColumns, mfaEnabled: e.target.checked })} /> MFA
                            </label>
                            <select
                                style={{ ...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0 }}
                                value={sortConfig.key === 'mfaEnabled' && sortConfig.direction !== null ? sortConfig.direction : 'none'}
                                onChange={(e) => setSortConfig({ key: 'mfaEnabled', direction: e.target.value === 'none' ? null : e.target.value as 'asc' | 'desc' })}
                            >
                                <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                                <option value="asc">{t['sort'] || 'เรียง'}</option>
                            </select>
                        </div>

                        {/* Change Password */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.changePassword} onChange={(e) => setVisibleColumns({ ...visibleColumns, changePassword: e.target.checked })} /> {t['change_password'] || 'เปลี่ยนรหัสผ่าน'}
                            </label>
                            <select disabled style={{ ...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0, opacity: 0.5 }}>
                                <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', flex: 1 }}>
                                <input type="checkbox" checked={visibleColumns.isActive} onChange={(e) => setVisibleColumns({ ...visibleColumns, isActive: e.target.checked })} /> {t['is_active'] || 'สถานะ'}
                            </label>
                            <select
                                style={{ ...crudStyles.input, width: '130px', padding: '4px 8px', height: '32px', fontSize: '13px', margin: 0 }}
                                value={sortConfig.key === 'isActive' && sortConfig.direction !== null ? sortConfig.direction : 'none'}
                                onChange={(e) => setSortConfig({ key: 'isActive', direction: e.target.value === 'none' ? null : e.target.value as 'asc' | 'desc' })}
                            >
                                <option value="none">{t['no_sort'] || 'ไม่เรียง'}</option>
                                <option value="asc">{t['sort'] || 'เรียง'}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </BaseModal>

            {/* Advanced Search Modal */}
            <AdvancedSearchModal
                isOpen={showAdvancedSearch}
                onClose={() => setShowAdvancedSearch(false)}
                title={t['advanced_search_title'] || 'ค้นหาขั้นสูง'}
                fields={advancedSearchFields}
                values={advSearchValues}
                onChange={handleAdvSearchChange}
                onSearch={handleAdvSearchSubmit}
                onClear={handleAdvSearchClear}
                t={t}
            />
        </CrudLayout>
    );
}
