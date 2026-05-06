import { useSystemConfig, useLanguage } from '@nexone/ui';
import React, { useState, useEffect } from 'react';
import CrudLayout from '@/components/CrudLayout';
import { SearchInput, crudStyles, StatusDropdown, BaseModal, ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { Plus, Edit2, Trash2, Eye, Mail, Link, Globe2, Hash, Layers } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { useApiConfig } from '../contexts/ApiConfigContext';
import { usePagePermission } from '@/contexts/PermissionContext';


interface EmailTemplate {
  template_id: string;
  template_code: string;
  title: string;
  language_code: string;
  app_name: string[];
  email_content?: string;
  is_active: boolean;
}

// Badge color map per app name
const APP_BADGE_COLORS: Record<string, string> = {
  'ALL':         'bg-cyan-100 text-cyan-700 border-cyan-200',
  'All App':     'bg-cyan-100 text-cyan-700 border-cyan-200',
  'NexCore':     'bg-rose-100 text-rose-700 border-rose-200',
  'NexSite':     'bg-orange-100 text-orange-700 border-orange-200',
  'NexForce':    'bg-violet-100 text-violet-700 border-violet-200',
  'NexSpeed':    'bg-blue-100 text-blue-700 border-blue-200',
  'NexCost':     'bg-lime-100 text-lime-700 border-lime-200',
  'NexLess':     'bg-teal-100 text-teal-700 border-teal-200',
  'NexStock':    'bg-purple-100 text-purple-700 border-purple-200',
  'NexSales':    'bg-pink-100 text-pink-700 border-pink-200',
  'NexFinance':  'bg-amber-100 text-amber-700 border-amber-200',
  'NexProcure':  'bg-yellow-100 text-yellow-700 border-yellow-200',
  'NexProduce':  'bg-green-100 text-green-700 border-green-200',
  'NexBI':       'bg-indigo-100 text-indigo-700 border-indigo-200',
  'NexPOS':      'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  'NexPayroll':  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'NexAsset':    'bg-sky-100 text-sky-700 border-sky-200',
  'NexTax':      'bg-red-100 text-red-700 border-red-200',
  'NexApprove':  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'NexAudit':    'bg-slate-100 text-slate-600 border-slate-300',
  'NexConnect':  'bg-blue-50 text-blue-600 border-blue-200',
  'NexDelivery': 'bg-orange-50 text-orange-600 border-orange-200',
  'NexMaint':    'bg-stone-100 text-stone-600 border-stone-300',
  'NexLearn':    'bg-lime-50 text-lime-700 border-lime-200',
  'Central Auth':'bg-rose-100 text-rose-700 border-rose-200',
};

// Fallback static list (used when API is unavailable)
const FALLBACK_APPS = [
  'All App (ใช้กับทุกระบบ)',
  'NexCore', 'NexSite', 'NexForce', 'NexSpeed', 'NexCost', 'NexLess',
  'NexStock', 'NexSales', 'NexFinance', 'NexProcure', 'NexProduce',
  'NexBI', 'NexPOS', 'NexPayroll', 'NexAsset', 'NexTax', 'NexApprove',
  'NexAudit', 'NexConnect', 'NexDelivery', 'NexMaint', 'NexLearn', 'Central Auth',
];

const INITIAL_TEMPLATES: EmailTemplate[] = [
  { template_id: '24', template_code: 'PAYROLL_APPROVAL', title: 'Payroll Approval Request for {{PayrollMonth}}', language_code: 'อังกฤษ (EN)', app_name: ['NexForce'], is_active: true, email_content: 'Dear Approver,\n\nThe payroll for {{PayrollMonth}} is ready for your review and approval. Please check the system.' },
  { template_id: '25', template_code: 'PAYROLL_APPROVED', title: 'Payroll Round Approved for {{PayrollMonth}}', language_code: 'อังกฤษ (EN)', app_name: ['NexForce'], is_active: true, email_content: 'Dear HR Team,\n\nThe payroll round for {{PayrollMonth}} has been successfully approved.' },
  { template_id: '26', template_code: 'TERMINATION_NOTE', title: 'Employment Termination Notification', language_code: 'อังกฤษ (EN)', app_name: ['NexForce'], is_active: true, email_content: 'Dear {{EmployeeName}},\n\nWe regret to inform you that your employment with the company will be terminated effective {{TerminationDate}}.' },
  { template_id: '27', template_code: 'OVERTIME_APPROVED', title: 'Overtime Approved Notification', language_code: 'อังกฤษ (EN)', app_name: ['NexForce'], is_active: true, email_content: 'Dear {{EmployeeName}},\n\nYour overtime request on {{OvertimeDate}} from {{StartTime}} to {{EndTime}} has been approved.' },
  { template_id: '28', template_code: 'PROMOTION_REQ', title: 'Promotion and Salary Increase Approval Request for {{EmployeeName}}', language_code: 'อังกฤษ (EN)', app_name: ['NexForce'], is_active: true, email_content: 'Dear Approver,\n\nWe would like to request your approval for the promotion of {{EmployeeName}}.\nProposed Position: {{ProposedPosition}}' },
  { template_id: '29', template_code: 'VERIFY_MAIL', title: 'verify mail', language_code: 'อังกฤษ (EN)', app_name: ['Central Auth'], is_active: true, email_content: 'Please verify your email address by clicking the link below:\n\n{{VerificationLink}}' },
  { template_id: '30', template_code: 'OTP_EMAIL', title: 'Password Reset OTP', language_code: 'อังกฤษ (EN)', app_name: ['Central Auth'], is_active: true, email_content: 'Your OTP code is {{OTP}}. It will expire in 10 minutes.' },
  { template_id: '31', template_code: 'LEAVE_REQUEST', title: 'Leave Request Approval', language_code: 'อังกฤษ (EN)', app_name: ['NexForce'], is_active: true, email_content: 'Dear Manager,\n\n{{EmployeeName}} has submitted a leave request.\nLeave details: - Leave date(s): {{LeaveDates}}' },
  { template_id: '32', template_code: 'LEAVE_APPROVED', title: 'Leave Approved Notification', language_code: 'อังกฤษ (EN)', app_name: ['NexForce'], is_active: true, email_content: 'Dear {{EmployeeName}},\n\nYour leave request for {{LeaveDate}} has been approved.' },
  { template_id: '33', template_code: 'RESIGNATION_REQ', title: 'Resignation Request Approval', language_code: 'อังกฤษ (EN)', app_name: ['NexForce'], is_active: true, email_content: 'Dear Manager,\n\n{{EmployeeName}} has submitted a resignation request.\nEffective Date: {{ResignationDate}}' },
  { template_id: '34', template_code: 'RESIGNATION_APP', title: 'Resignation Approved Notification', language_code: 'อังกฤษ (EN)', app_name: ['NexForce'], is_active: true, email_content: 'Dear {{EmployeeName}},\n\nYour resignation, effective from {{ResignationDate}}, has been approved.' },
  { template_id: '35', template_code: 'PROMOTION_APP', title: 'Promotion and Salary Increase Approved for {{EmployeeName}}', language_code: 'อังกฤษ (EN)', app_name: ['NexForce'], is_active: true, email_content: 'Congratulations!\n\nYour promotion to {{ProposedPosition}} and salary increase have been approved.' },
  { template_id: '36', template_code: 'PROMOTION_APPROVED', title: 'แจ้งอนุมัติการเลื่อนตำแหน่ง', language_code: 'ไทย (TH)', app_name: ['NexForce'], is_active: true, email_content: 'เรียนคุณ {{EmployeeName}},\n\nขอแสดงความยินดี! คุณได้รับการอนุมัติให้เลื่อนตำแหน่งเป็น {{ProposedPosition}}' },
  { template_id: '37', template_code: 'PROMOTION_REQ', title: 'ขออนุมัติการเลื่อนตำแหน่งและขึ้นเงินเดือน', language_code: 'ไทย (TH)', app_name: ['NexForce'], is_active: true, email_content: 'เรียนผู้มีอำนาจอนุมัติ,\n\nมีคำขอให้พิจารณาอนุมัติการเลื่อนตำแหน่งและปรับเงินเดือนของ {{EmployeeName}}' },
  { template_id: '38', template_code: 'OVERTIME_APPROVED', title: 'แจ้งอนุมัติการทำงานล่วงเวลา', language_code: 'ไทย (TH)', app_name: ['NexForce'], is_active: true, email_content: 'เรียนคุณ {{EmployeeName}},\n\nคำขอทำงานล่วงเวลาของคุณในวันที่ {{OvertimeDate}} เวลา {{StartTime}} ถึง {{EndTime}} ได้รับการอนุมัติแล้ว' },
  { template_id: '39', template_code: 'OVERTIME_REQUEST', title: 'ขออนุมัติการทำงานล่วงเวลา', language_code: 'ไทย (TH)', app_name: ['NexForce'], is_active: true, email_content: 'เรียนผู้มีอำนาจอนุมัติ,\n\n{{EmployeeName}} ได้ยื่นคำขอทำงานล่วงเวลา รายละเอียด:\n- วันที่ทำ OT: {{OvertimeDate}}' },
  { template_id: '40', template_code: 'LEAVE_REQUEST', title: 'ขออนุมัติการลา', language_code: 'ไทย (TH)', app_name: ['NexForce'], is_active: true, email_content: 'เรียนผู้มีอำนาจอนุมัติ,\n\n{{EmployeeName}} ได้ยื่นคำขอลา\nประเภทการลา: {{LeaveType}}\nวันที่ลา: {{StartDate}} ถึง {{EndDate}}\nเหตุผล: {{Reason}}' },
  { template_id: '41', template_code: 'LEAVE_APPROVED', title: 'แจ้งอนุมัติการลา', language_code: 'ไทย (TH)', app_name: ['NexForce'], is_active: true, email_content: 'เรียนคุณ {{EmployeeName}},\n\nคำขอลาของคุณในวันที่ {{LeaveDate}} ได้รับการอนุมัติแล้ว' },
  { template_id: '42', template_code: 'RESIGNATION_APPROVED', title: 'แจ้งอนุมัติการลาออก', language_code: 'ไทย (TH)', app_name: ['NexForce'], is_active: true, email_content: 'เรียนคุณ {{EmployeeName}},\n\nคำขอลาออกของคุณมีผลในวันที่ {{ResignationDate}} ได้รับการอนุมัติเรียบร้อยแล้ว' },
];

export default function EmailTemplates() {
    const { lang } = useLanguage();
    const [t, setT] = useState<Record<string, string>>({});
    const perm = usePagePermission('EM_TEMPLATE');
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
    const [templates, setTemplates] = useState<EmailTemplate[]>(INITIAL_TEMPLATES);
    const [systemApps, setSystemApps] = useState<string[]>([]);
    const [languages, setLanguages] = useState<any[]>([]);

    // CRUD State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add'|'edit'|'view'|'delete'>('add');
    const [selectedItem, setSelectedItem] = useState<EmailTemplate | null>(null);
        const [formData, setFormData] = useState<Partial<EmailTemplate>>({ template_code: '', title: '', language_code: 'TH', app_name: [], email_content: '', is_active: true });


    // Add Language Form State
    const [isLangModalOpen, setIsLangModalOpen] = useState(false);
    const [langForm, setLangForm] = useState({ languageCode: '', languageName: '', description: '' });

    const { getEndpoint } = useApiConfig();
    const coreApi = getEndpoint('NexCore', '');
    const API_URL = `${coreApi}/email-templates`;

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
    const LANG_API_URL = `${coreApi}/translations/languages`;
    const SYSTEM_APPS_API_URL = `${coreApi}/v1/system-apps?all=true`;

    // ─── Fetch Functions ─────────────────────────────────────────────────────────

    const fetchTemplates = async () => {
        try {
            const res = await fetch(API_URL, { credentials: 'include' });
            const json = await res.json();
            if (json.data) setTemplates(json.data);
        } catch (error) {
            console.error('Error fetching email templates:', error);
        }
    };

    const fetchLanguages = async () => {
        try {
            const res = await fetch(LANG_API_URL, { credentials: 'include' });
            const data = await res.json();
            if (Array.isArray(data)) setLanguages(data);
        } catch (error) {
            console.error('Error fetching languages:', error);
        }
    };

    const fetchSystemApps = async () => {
        try {
            const res = await fetch(SYSTEM_APPS_API_URL, { credentials: 'include' });
            const json = await res.json();
            const apps: any[] = json.data ?? json;
            if (Array.isArray(apps) && apps.length > 0) {
                // "All App" option first, then apps from DB sorted by seq_no
                const names = [
                    'All App',
                    ...apps.map((a: any) => a.app_name as string),
                ];
                setSystemApps(names);
            } else {
                setSystemApps(FALLBACK_APPS);
            }
        } catch (error) {
            console.error('Error fetching system apps, using fallback:', error);
            setSystemApps(FALLBACK_APPS);
        }
    };

    useEffect(() => {
        fetchTemplates();
        fetchLanguages();
        fetchSystemApps();
    }, []);

    // ─── Action Handlers ─────────────────────────────────────────────────────────

    const handleAdd = () => {
        setFormData({ template_code: '', title: '', language_code: 'TH', app_name: [], email_content: '', is_active: true });
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleEdit = (item: EmailTemplate) => {
        setFormData({ ...item, app_name: Array.isArray(item.app_name) ? item.app_name : [] });
        setSelectedItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (item: EmailTemplate) => {
        setFormData({ ...item, app_name: Array.isArray(item.app_name) ? item.app_name : [] });
        setSelectedItem(item);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleDelete = (item: EmailTemplate) => {
        setSelectedItem(item);
        setModalMode('delete');
        setIsModalOpen(true);
    };

    const saveForm = async () => {
        if (!formData.title?.trim()) return;
        try {
            if (modalMode === 'add') {
                const res = await fetch(API_URL, { credentials: 'include', 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                if (res.ok) { await fetchTemplates(); setIsModalOpen(false); }
            } else if (modalMode === 'edit') {
                const res = await fetch(`${API_URL}/${selectedItem?.template_id}`, { credentials: 'include', 
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
                if (res.ok) { await fetchTemplates(); setIsModalOpen(false); }
            }
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    const handleSaveNewLanguage = async () => {
        if (!langForm.languageCode || !langForm.languageName) return;
        try {
            const res = await fetch(LANG_API_URL, { credentials: 'include', 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    languageCode: langForm.languageCode.toLowerCase(),
                    languageName: langForm.languageName,
                    description: langForm.description || langForm.languageName,
                }),
            });
            if (res.ok) {
                setIsLangModalOpen(false);
                fetchLanguages();
                const displayName = `${langForm.languageName} (${langForm.languageCode.toUpperCase()})`;
                setFormData(prev => ({ ...prev, language_code: displayName }));
                setLangForm({ languageCode: '', languageName: '', description: '' });
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to add language');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const confirmDelete = async () => {
        if (!selectedItem) return;
        try {
            const res = await fetch(`${API_URL}/${selectedItem.template_id}`, { credentials: 'include',  method: 'DELETE' });
            if (res.ok) { await fetchTemplates(); setIsModalOpen(false); }
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    const getAppBadgeColor = (appName: string): string => {
        if (!appName) return 'bg-slate-100 text-slate-400 border-slate-200';
        const normalized = appName.toUpperCase();
        if (normalized === 'ALL' || appName.startsWith('All App')) return APP_BADGE_COLORS['ALL'];
        if (APP_BADGE_COLORS[appName]) return APP_BADGE_COLORS[appName];
        const matchKey = Object.keys(APP_BADGE_COLORS).find(k => appName.includes(k) || k.includes(appName));
        return matchKey ? APP_BADGE_COLORS[matchKey] : 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const toggleApp = (val: string) => {
        let newApps = [...(formData.app_name || [])];
        if (newApps.includes(val)) newApps = newApps.filter(n => n !== val);
        else newApps.push(val);
        setFormData({ ...formData, app_name: newApps });
    };

    // ─── Filter & Pagination ─────────────────────────────────────────────────────

    const searchLower = search.toLowerCase();
    const filteredData = templates.filter(item =>
        !searchLower ||
        item.title?.toLowerCase().includes(searchLower) ||
        item.template_code?.toLowerCase().includes(searchLower) ||
        (Array.isArray(item.app_name) && item.app_name.join(',').toLowerCase().includes(searchLower))
    );
    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // ─── Render ──────────────────────────────────────────────────────────────────

    return (
        <CrudLayout
            toolbarLeft={
                <ExportButtons
                    onExportXLSX={() => exportToXLSX(filteredData, 'EmailTemplates', [
                        { key: 'template_code', label: 'Code' },
                        { key: 'title', label: 'Template Name' },
                        { key: 'language_code', label: 'Language' },
                        { key: 'app_name', label: 'App' },
                        { key: 'is_active', label: 'Status', format: (v: any) => v.is_active ? 'Active' : 'Inactive' },
                    ])}
                    onExportCSV={() => exportToCSV(filteredData, 'EmailTemplates', [
                        { key: 'template_code', label: 'Code' },
                        { key: 'title', label: 'Template Name' },
                        { key: 'language_code', label: 'Language' },
                        { key: 'app_name', label: 'App' },
                        { key: 'is_active', label: 'Status', format: (v: any) => v.is_active ? 'Active' : 'Inactive' },
                    ])}
                    onExportPDF={(orientation) => exportToPDF(filteredData, 'EmailTemplates', [
                        { key: 'template_code', label: 'Code' },
                        { key: 'title', label: 'Template Name' },
                        { key: 'language_code', label: 'Language' },
                        { key: 'app_name', label: 'App' },
                        { key: 'is_active', label: 'Status', format: (v: any) => v.is_active ? 'Active' : 'Inactive' },
                    ], 'Email Templates Report', orientation)}
                />
            }
            toolbarRight={
                <>
                                                                                <SearchInput value={search} onChange={setSearch} placeholder={t['search_placeholder'] || "Search Code, Subject..."} />

                                        {perm.canAdd && (
                        <button

                        onClick={handleAdd}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 500, cursor: 'pointer', fontSize: '14px' }}
                    >
                        <Plus size={16} /> <span>{t['add_template'] || 'Add Template'}</span>
                                            </button>
                    )}

                </>
            }
        >
            {/* ── Table ── */}
            <div style={{ height: '720px', overflowY: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                                                        <th>{t['template_code'] || 'Template Code'}</th>


                                                        <th>{t['subject_name'] || 'Subject Name'}</th>

                                                        <th>{t['language'] || 'Language'}</th>

                                                        <th>{t['link_app'] || 'Linked Apps'}</th>

                                                        <th className="text-center" style={{ width: '120px' }}>{t['status'] || 'Status'}</th>

                                                        <th className="text-center" style={{ width: '100px', paddingRight: '24px' }}>{t['manage'] || 'Manage'}</th>

                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item) => (
                            <tr key={item.template_id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                                        <Hash size={12} style={{ opacity: 0.7 }} /> {item.template_code}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ minWidth: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Mail size={16} />
                                        </div>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{item.title}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        <Globe2 size={14} color="var(--text-muted)" />
                                        {item.language_code}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        <Link size={14} color="var(--text-muted)" />
                                        {(!item.app_name || item.app_name.length === 0) ? (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>-</span>
                                        ) : (
                                            <>
                                                <span className={`px-2 py-0.5 border rounded-md text-[11px] font-bold tracking-wide uppercase ${getAppBadgeColor(item.app_name[0])}`}>
                                                    {item.app_name[0] === 'ALL' ? 'All App' : item.app_name[0]}
                                                </span>
                                                {item.app_name.length > 1 && (
                                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '1px 6px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                                        +{item.app_name.length - 1}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="text-center">
                                    <StatusDropdown
                                        status={item.is_active}
                                        onChange={perm.canEdit ? (val) => {
                                            try {
                                                fetch(`${API_URL}/${item.template_id}`, {
                                                    credentials: 'include',
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ is_active: val }),
                                                }).then(() => fetchTemplates());
                                            } catch (e) { console.error(e); }
                                        } : () => {}}

                                    />
                                </td>
                                <td className="text-center" style={{ paddingRight: '24px' }}>
                                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                        {perm.canView && <button onClick={() => handleView(item)} style={{ ...crudStyles.actionBtn, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }} title={t['view'] || "เรียกดู"}><Eye size={14} /></button>}

                                        {perm.canEdit && <button onClick={() => handleEdit(item)} style={{ ...crudStyles.actionBtn, color: '#f59e0b', background: '#fef3c7' }} title={t['edit'] || "แก้ไข"}><Edit2 size={14} /></button>}

                                        {perm.canDelete && <button onClick={() => handleDelete(item)} style={{ ...crudStyles.actionBtn, color: '#ef4444', background: '#fee2e2' }} title={t['delete'] || "ลบ"}><Trash2 size={14} /></button>}

                                    </div>
                                </td>
                            </tr>
                        ))}
                        {templates.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center" style={{ padding: '40px 0', color: 'var(--text-muted)' }}>
                                    {t['no_email_template_data'] || 'ไม่พบข้อมูลแม่แบบอีเมล'}

                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {filteredData.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalItems={filteredData.length}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
            )}

            {/* ── Add / Edit / View Modal ── */}
            <BaseModal
                isOpen={isModalOpen && modalMode !== 'delete'}
                onClose={() => setIsModalOpen(false)}
                                title={modalMode === 'add' ? (t['add_new_template'] || 'สร้างแม่แบบใหม่') : modalMode === 'edit' ? (t['edit_email_template'] || 'แก้ไขอีเมลแม่แบบ') : (t['template_details'] || 'รายละเอียดแม่แบบ')}

                width="700px"
                footer={
                    modalMode !== 'view' ? (
                        <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end', paddingTop: '16px' }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>{t['cancel'] || 'ยกเลิก'}</button>

                            <button onClick={saveForm} style={{ padding: '8px 24px', background: 'var(--accent-green)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px', opacity: formData.title?.trim() ? 1 : 0.5 }} disabled={!formData.title?.trim()}>
                                {modalMode === 'add' ? (t['create_template'] || 'สร้างแม่แบบ') : (t['save_changes'] || 'บันทึกการแก้ไข')}

                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t['close'] || 'ปิด'}</button>

                    )
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Row 1: Code + Title */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                        <div>
                            <label style={crudStyles.label}>{t['template_code'] || 'รหัสแม่แบบ (Code)'} <span style={{ color: '#ef4444' }}>*</span></label>

                            <input type="text" style={crudStyles.input} placeholder={t['example_code'] || "เช่น PAYROLL_APPRV"} value={formData.template_code || ''} onChange={(e) => setFormData({ ...formData, template_code: e.target.value })} disabled={modalMode === 'view'} />

                        </div>
                        <div>
                            <label style={crudStyles.label}>{t['subject'] || 'หัวข้อ (Subject)'} <span style={{ color: '#ef4444' }}>*</span></label>

                            <input type="text" style={crudStyles.input} placeholder={t['email_subject'] || "หัวข้ออีเมล"} value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} disabled={modalMode === 'view'} />

                        </div>
                    </div>

                    {/* Row 2: Language + Apps */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {/* Language */}
                        <div>
                            <label style={{ ...crudStyles.label, display: 'flex', justifyContent: 'space-between' }}>
                                                                {t['language'] || 'ภาษา (Language)'}

                                {modalMode !== 'view' && (
                                    <button type="button" onClick={() => setIsLangModalOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px', padding: 0 }}>
                                                                                + {t['add_language'] || 'เพิ่มภาษา'}

                                    </button>
                                )}
                            </label>
                            <select
                                style={{ ...crudStyles.input, appearance: 'auto', paddingRight: '12px' }}
                                value={formData.language_code || ''}
                                onChange={(e) => setFormData({ ...formData, language_code: e.target.value })}
                                disabled={modalMode === 'view'}
                            >
                                {languages.length > 0 ? (
                                    languages.map(l => (
                                        <option key={l.id} value={`${l.languageName} (${l.languageCode.toUpperCase()})`}>
                                            {l.languageName} ({l.languageCode.toUpperCase()})
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="ไทย (TH)">ไทย (TH)</option>
                                        <option value="อังกฤษ (EN)">อังกฤษ (EN)</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* System Apps — dynamic from API */}
                        <div>
                            <label style={{ ...crudStyles.label, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Layers size={13} style={{ opacity: 0.6 }} />
                                                                {t['link_app_system'] || 'เชื่อมโยงกับแอประบบ'}

                                {(formData.app_name?.length ?? 0) > 0 && (
                                    <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 600, color: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)', padding: '1px 8px', borderRadius: '12px' }}>
                                        {formData.app_name!.length} {t['apps'] || 'แอป'}

                                    </span>
                                )}
                            </label>
                            <div
                                style={{
                                    ...crudStyles.input,
                                    padding: '6px 8px',
                                    height: 'auto',
                                    maxHeight: '150px',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '3px',
                                }}
                            >
                                {systemApps.length === 0 ? (
                                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '4px' }}>{t['loading'] || 'กำลังโหลด...'}</span>

                                ) : systemApps.map(appName => {
                                    const val = appName === 'All App (ใช้กับทุกระบบ)' ? 'ALL' : appName;

                                    const isChecked = Array.isArray(formData.app_name) && formData.app_name.includes(val);
                                    const badgeColor = getAppBadgeColor(val);
                                    return (
                                        <label
                                            key={val}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                cursor: modalMode === 'view' ? 'default' : 'pointer',
                                                padding: '3px 6px', borderRadius: '6px',
                                                background: isChecked ? 'rgba(59,130,246,0.06)' : 'transparent',
                                                transition: 'background 0.15s',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                value={val}
                                                checked={isChecked}
                                                onChange={() => toggleApp(val)}
                                                disabled={modalMode === 'view'}
                                                style={{ accentColor: 'var(--accent-blue)', flexShrink: 0 }}
                                            />
                                            <span className={`px-2 py-0 border rounded text-[11px] font-semibold uppercase tracking-wide ${badgeColor}`}>
                                                {val === 'ALL' ? 'All App' : appName}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Email Content */}
                    <div>
                        <label style={{ ...crudStyles.label, display: 'block', marginBottom: '8px' }}>
                                                    
                            {t['email_content'] || 'ข้อความอีเมล (Email Content)'} <span style={{ color: '#ef4444' }}>*</span>
                        </label>

                        
                        <textarea
                            style={{ ...crudStyles.input, minHeight: '200px', resize: 'vertical', fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5' }}
                            placeholder={t['email_content_placeholder'] || "พิมพ์ข้อความ... รองรับการใช้ตัวแปรเช่น {{name}}"}

                            value={formData.email_content || ''}
                            onChange={(e) => setFormData({ ...formData, email_content: e.target.value })}
                            disabled={modalMode === 'view'}
                        />
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Supports HTML formatting. Use variables like {'{{name}}'} for dynamic content.
                        </div>
                    </div>


                </div>
            </BaseModal>

            {/* ── Delete Confirm Modal ── */}
            <BaseModal
                isOpen={isModalOpen && modalMode === 'delete'}
                onClose={() => setIsModalOpen(false)}
                title={t['confirm_delete_template'] || 'ยืนยันการลบแม่แบบ'}

                width="400px"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}>{t['cancel'] || 'ยกเลิก'}</button>

                        <button onClick={confirmDelete} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>{t['delete_data'] || 'ลบข้อมูล'}</button>

                    </>
                }
            >
                <div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>{t['confirm_delete_msg'] || 'คุณแน่ใจหรือไม่ว่าต้องการลบแม่แบบ'} <strong style={{ color: 'var(--text-primary)' }}>{selectedItem?.title}</strong> ?</p>

                    <p style={{ margin: 0, fontSize: '13px', color: '#ef4444' }}>{t['action_cannot_undone'] || 'การกระทำนี้จะไม่สามารถย้อนกลับได้'}</p>

                </div>
            </BaseModal>

            {/* ── Add Language Modal ── */}
            <BaseModal
                isOpen={isLangModalOpen}
                onClose={() => setIsLangModalOpen(false)}
                title={t['add_new_language'] || 'เพิ่มภาษาใหม่ (Add New Language)'}

                width="400px"
                footer={
                    <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
                        <button onClick={() => setIsLangModalOpen(false)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>{t['cancel'] || 'ยกเลิก'}</button>

                        <button onClick={handleSaveNewLanguage} style={{ padding: '8px 16px', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>{t['save_language'] || 'บันทึกภาษา'}</button>

                    </div>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={crudStyles.label}>{t['language_code'] || 'รหัสภาษา (Language Code)'} <span style={{ color: 'red' }}>*</span></label>

                        <input type="text" style={crudStyles.input} value={langForm.languageCode} onChange={e => setLangForm({ ...langForm, languageCode: e.target.value })} placeholder={t['example_lang_code'] || "เช่น: th, en, ja, cn"} />

                    </div>
                    <div>
                        <label style={crudStyles.label}>{t['language_name'] || 'ชื่อภาษา (Language Name)'} <span style={{ color: 'red' }}>*</span></label>

                        <input type="text" style={crudStyles.input} value={langForm.languageName} onChange={e => setLangForm({ ...langForm, languageName: e.target.value })} placeholder={t['example_lang_name'] || "เช่น: Thai, English"} />

                    </div>
                    <div>
                        <label style={crudStyles.label}>{t['description'] || 'คำอธิบาย (Description)'}</label>

                        <input type="text" style={crudStyles.input} value={langForm.description} onChange={e => setLangForm({ ...langForm, description: e.target.value })} placeholder={t['example_description'] || "เช่น: ภาษาไทย, ภาษาอังกฤษ"} />

                    </div>
                </div>
            </BaseModal>
        </CrudLayout>
    );
}
