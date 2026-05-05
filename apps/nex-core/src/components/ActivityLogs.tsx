'use client';
import { useSystemConfig } from '@nexone/ui';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Eye, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Activity, ShieldAlert, Users, ShieldCheck, Database, LayoutTemplate, Info, User, Clock, Globe } from 'lucide-react';
import { ExportButtons } from '@/components/CrudComponents';
import { exportToCSV, exportToXLSX, exportToPDF } from '@/utils/exportUtils';
import { format } from 'date-fns';
import { usePagePermission } from '@/contexts/PermissionContext';

// Use same styles from TemplateMaster3
const actionBtnStyle = (color: string): React.CSSProperties => ({
    background: 'transparent', border: 'none', borderRadius: '8px',
    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color, transition: 'all 0.15s',
});

const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({
    background: disabled ? 'transparent' : 'var(--bg-primary)', border: '1px solid var(--border-color)',
    borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: disabled ? 'not-allowed' : 'pointer',
    color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)', opacity: disabled ? 0.4 : 1,
    transition: 'all 0.15s', fontFamily: 'inherit',
});

function ScoreCard({ icon, color, label, value, sub, bg, onClick, active }: { icon: React.ReactNode; color: string; label: string; value: string; sub: string; bg: string; onClick?: () => void; active?: boolean }) {
    return (
        <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '14px', background: bg, border: active ? `2px solid ${color}` : `1px solid ${color}30`, opacity: (active || !onClick) ? 1 : 0.7, transition: 'all 0.2s' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
            <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '2px' }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</span>
                    {sub && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</span>}
                </div>
            </div>
        </div>
    );
}

const Modal = ({ show, title, onClose, children, footer }: { show: boolean; title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) => {
    if (!show) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', width: '90%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto', border: '1px solid var(--border-color)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}><X size={20} /></button>
                </div>
                <div style={{ padding: '24px' }}>{children}</div>
                {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>{footer}</div>}
            </div>
        </div>
    );
};

export default function ActivityLogs() {
    const perm = usePagePermission('Activity Logs');
    const hasActions = perm.canView;

    const [orders, setOrders] = useState<any[]>([]);
    const [filter, setFilter] = useState('all');
    const [selectedModule, setSelectedModule] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

    const loadOrders = useCallback(async () => {
        setLoading(true);
        const CORE_API_URL = process.env.NEXT_PUBLIC_CORE_API_URL || '';
        try {
            const res = await fetch(`${CORE_API_URL}/audit-logs`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setOrders(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error("Failed to fetch audit logs", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const uniqueModules = Array.from(new Set(orders.map(l => l.module).filter(Boolean))).sort();

    const filtered = orders.filter(o => {
        const matchFilter = filter === 'all' || (o.status || '').toUpperCase() === filter.toUpperCase();
        const matchModule = selectedModule === 'All' || o.module === selectedModule;
        const q = search.toLowerCase();
        const matchSearch = !q || [o.action, o.title, o.description, o.user_name, o.module, o.ip_address].some(v => (v || '').toLowerCase().includes(q));
        return matchFilter && matchModule && matchSearch;
    });

    const counts = {
        all: orders.length,
        failed: orders.filter(o => ['FAILED', 'ERROR'].includes((o.status || '').toUpperCase())).length,
        warnings: orders.filter(o => (o.status || '').toUpperCase() === 'WARNING').length,
        success: orders.filter(o => (o.status || '').toUpperCase() === 'SUCCESS').length,
    };

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filtered.map(o => o.id)));
    };
    const getExportData = () => selectedIds.size > 0 ? filtered.filter(o => selectedIds.has(o.id)) : filtered;

    const exportColumns = [
        { key: 'id', label: 'Log ID' },
        { key: 'created_at', label: 'เมื่อไหร่ (When)', format: (v: any) => v ? format(new Date(v), 'yyyy-MM-dd HH:mm:ss') : '-' },
        { key: 'user_name', label: 'ใคร (User)' },
        { key: 'role_name', label: 'บทบาท (Role)' },
        { key: 'module', label: 'โมดูล (Module)' },
        { key: 'action', label: 'Action' },
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'รายละเอียด (Description)' },
        { key: 'ip_address', label: 'IP Address' },
        { key: 'endpoint', label: 'Endpoint' },
        { key: 'response_time_ms', label: 'เวลาตอบสนอง (ms)' },
        { key: 'status', label: 'สถานะ (Status)' },
        { key: 'error_message', label: 'Error' },
    ];

    const handleView = (o: any) => { setSelectedOrder(o); setShowViewModal(true); };

    const getStatusBadge = (status: string) => {
        const s = (status || '').toUpperCase();
        const map: Record<string, { bg: string; c: string; b: string; l: string }> = {
            SUCCESS: { bg: "#ecfdf5", c: "#10b981", b: "#a7f3d0", l: "สำเร็จ" },
            FAILED: { bg: "#fef2f2", c: "#ef4444", b: "#fecaca", l: "ล้มเหลว" },
            ERROR: { bg: "#fef2f2", c: "#ef4444", b: "#fecaca", l: "ล้มเหลว" },
            WARNING: { bg: "#fffbeb", c: "#f59e0b", b: "#fde68a", l: "เตือน" },
            INFO: { bg: "#eff6ff", c: "#3b82f6", b: "#bfdbfe", l: "ข้อมูล" },
        };
        const st = map[s] || { bg: "#f1f5f9", c: "#64748b", b: "#e2e8f0", l: status };
        return <span style={{ padding: "4px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: 600, background: st.bg, color: st.c, border: `1px solid ${st.b}`, whiteSpace: "nowrap" }}>{st.l}</span>;
    };

    const getModuleIcon = (mod: string) => {
        const m = (mod || '').toLowerCase();
        if (m.includes('auth') || m.includes('login')) return <ShieldCheck size={14} color="#10b981" />;
        if (m.includes('menu') || m.includes('template')) return <LayoutTemplate size={14} color="#8b5cf6" />;
        if (m.includes('role') || m.includes('user') || m.includes('permission')) return <Users size={14} color="#f59e0b" />;
        return <Activity size={14} color="#64748b" />;
    };

    const renderPagination = () => {
        if (filtered.length <= 0) return null;
        
        const getPageNumbers = () => {
            const pages = [];
            const maxVisible = 4;
            let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
            let end = Math.min(totalPages, start + maxVisible - 1);
            if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
            }
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            return pages;
        };

        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', padding: '10px', borderTop: '1px solid var(--border-color)', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <span>แสดง</span>
                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit' }}>
                        {[5, 10, 15, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>รายการ / หน้า</span>
                    <span style={{ marginLeft: '8px', color: 'var(--accent-blue)', fontWeight: 500 }}>
                        ({(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} จาก {filtered.length})
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => setCurrentPage(1)} disabled={safePage <= 1} style={pageBtnStyle(safePage <= 1)}><ChevronsLeft size={16} /></button>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage <= 1} style={pageBtnStyle(safePage <= 1)}><ChevronLeft size={16} /></button>
                    
                    {getPageNumbers().map(p => (
                        <button key={p} onClick={() => setCurrentPage(p)}
                            style={{
                                ...pageBtnStyle(false),
                                background: p === safePage ? '#3b82f6' : 'var(--bg-primary)',
                                color: p === safePage ? 'white' : 'var(--text-secondary)',
                                borderColor: p === safePage ? '#3b82f6' : 'var(--border-color)',
                                fontWeight: p === safePage ? 600 : 400
                            }}
                        >
                            {p}
                        </button>
                    ))}
                    
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} style={pageBtnStyle(safePage >= totalPages)}><ChevronRight size={16} /></button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={safePage >= totalPages} style={pageBtnStyle(safePage >= totalPages)}><ChevronsRight size={16} /></button>
                </div>
            </div>
        );
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><div className="loading-spinner" /></div>;

    return (
        <div className="animate-fade-in">


            {/* Score Cards from Template 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <ScoreCard icon={<Activity size={22} />} color="#3b82f6" label="รายการทั้งหมด" value={String(counts.all)} sub="Logs" bg="rgba(59,130,246,0.15)" onClick={() => { setFilter('all'); setCurrentPage(1); }} active={filter === 'all'} />
                <ScoreCard icon={<ShieldAlert size={22} />} color="#ef4444" label="การประมวลผลผิดพลาด" value={String(counts.failed)} sub="Errors" bg="rgba(239,68,68,0.15)" onClick={() => { setFilter('FAILED'); setCurrentPage(1); }} active={filter === 'FAILED'} />
                <ScoreCard icon={<Users size={22} />} color="#f59e0b" label="ความปลอดภัย" value={String(counts.warnings)} sub="Warnings" bg="rgba(245,158,11,0.15)" onClick={() => { setFilter('WARNING'); setCurrentPage(1); }} active={filter === 'WARNING'} />
                <ScoreCard icon={<ShieldCheck size={22} />} color="#10b981" label="รายการสำเร็จ" value={String(counts.success)} sub="Success" bg="rgba(16,185,129,0.15)" onClick={() => { setFilter('SUCCESS'); setCurrentPage(1); }} active={filter === 'SUCCESS'} />
            </div>

            {/* Toolbar from Template 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {perm.canExport && (
                    <ExportButtons
                        onExportXLSX={() => exportToXLSX(getExportData(), 'AuditLogs', exportColumns)}
                        onExportCSV={() => exportToCSV(getExportData(), 'AuditLogs', exportColumns)}
                        onExportPDF={(orientation) => exportToPDF(getExportData(), 'AuditLogs', exportColumns, 'Activity Logs Report - NexCore', orientation)}
                    />
                )}
                
                {selectedIds.size > 0 && (
                    <>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 600, padding: '5px 10px', borderRadius: '8px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                            ✓ {selectedIds.size} รายการ
                        </span>
                        <button onClick={() => setSelectedIds(new Set())} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '13px' }}>ยกเลิกการเลือก</button>
                    </>
                )}

                <div style={{ flex: 1 }} />

                {perm.canView && (
                    <div className="topbar-search" style={{ minWidth: '180px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                        <input placeholder="ค้นหากิจกรรม, ผู้ใช้งาน..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
                            style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px', outline: 'none' }} />
                    </div>
                )}

                <select value={selectedModule} onChange={e => { setSelectedModule(e.target.value); setCurrentPage(1); }}
                    style={{ padding: "8px 12px", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "8px", color: "var(--text-primary)", outline: "none", fontSize: "13px", fontWeight: 500 }}>
                    <option value="All">โมดูลทั้งหมด (All Modules)</option>
                    {uniqueModules.map((m: any) => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>

            {/* LIST VIEW (Using Template 3 Table Structure) */}
            <div className="card">
                <div className="data-table-wrapper" style={{ overflowY: 'auto', height: '550px' }}>
                    <table className="data-table" style={{ position: 'relative', width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                            <tr>
                                <th style={{ width: '40px', textAlign: 'center', padding: '8px 12px' }}>
                                    <input type="checkbox" checked={filtered.length > 0 && selectedIds.size === filtered.length} onChange={toggleSelectAll}
                                        style={{ accentColor: '#3b82f6', width: '16px', height: '16px', cursor: 'pointer' }} title="เลือกทั้งหมด" />
                                </th>
                                <th style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>วันเวลา (Timestamp)</th>
                                <th style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ผู้ใช้งาน (User / Role)</th>
                                <th style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>การกระทำ (Action)</th>
                                <th style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>IP Address</th>
                                <th style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>สถานะ (Status)</th>
                                {hasActions && <th style={{ textAlign: 'center', width: '80px', padding: '8px 12px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>จัดการ</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {paged.map((o, idx) => (
                                <tr key={o.id || idx} style={{ background: selectedIds.has(o.id) ? 'rgba(59,130,246,0.04)' : undefined, borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ textAlign: 'center', padding: '6px 12px' }}>
                                        <input type="checkbox" checked={selectedIds.has(o.id)} onChange={() => toggleSelect(o.id)}
                                            style={{ accentColor: '#3b82f6', width: '15px', height: '15px', cursor: 'pointer' }} />
                                    </td>
                                    <td style={{ padding: '6px 12px', verticalAlign: 'middle' }}>
                                        <div style={{ fontSize: "12px", color: "var(--text-primary)" }}>{o.created_at ? format(new Date(o.created_at), 'yyyy-MM-dd HH:mm:ss') : '-'}</div>
                                    </td>
                                    <td style={{ padding: '6px 12px', verticalAlign: 'middle' }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                                            <User size={14} color="var(--text-muted)" />
                                            <span>{o.user_name || 'System'} <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>({o.role_name || '-'})</span></span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '6px 12px', verticalAlign: 'middle' }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                                            {getModuleIcon(o.module)}
                                            <span style={{ fontWeight: 600, color: "var(--accent-blue)" }}>[{o.module || '-'}]</span>
                                            <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{o.action}</span>
                                            <span style={{ color: "var(--text-muted)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>- {o.title || '-'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '6px 12px', verticalAlign: 'middle' }}>
                                        <span style={{ fontSize: "11px", fontFamily: "monospace", background: "var(--bg-primary)", padding: "3px 6px", borderRadius: "4px", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}>
                                            {o.ip_address || '-'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '6px 12px', verticalAlign: 'middle' }}>
                                        {getStatusBadge(o.status)}
                                    </td>
                                    {hasActions && (
                                    <td style={{ textAlign: 'center', padding: '6px 12px', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                            {perm.canView && <button onClick={() => handleView(o)} title="ดูรายละเอียด" style={actionBtnStyle('var(--accent-blue)')}><Eye size={16} /></button>}
                                        </div>
                                    </td>
                                    )}
                                </tr>
                            ))}
                            {paged.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>ไม่พบข้อมูล</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {renderPagination()}
            </div>

            {/* VIEW MODAL from Template 3 */}
            <Modal show={showViewModal} title="รายละเอียด Log" onClose={() => setShowViewModal(false)}>
                {selectedOrder && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59,130,246,0.08)', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>{selectedOrder.response_time_ms != null ? `${selectedOrder.response_time_ms} ms` : '-'}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Response Time</div>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '10px', background: (selectedOrder.status || '').toUpperCase() === 'SUCCESS' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: (selectedOrder.status || '').toUpperCase() === 'SUCCESS' ? '#10b981' : '#ef4444' }}>{selectedOrder.status || '-'}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Status</div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ color: 'var(--accent-blue)' }}><Clock size={16} /></div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '100px' }}>เมื่อไหร่</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedOrder.created_at ? format(new Date(selectedOrder.created_at), 'yyyy-MM-dd HH:mm:ss') : '-'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ color: 'var(--accent-blue)' }}><User size={16} /></div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '100px' }}>ใคร</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{`${selectedOrder.user_name || 'System'} (${selectedOrder.role_name || '-'})`}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ color: 'var(--accent-blue)' }}><LayoutTemplate size={16} /></div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '100px' }}>โมดูล</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedOrder.module || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ color: 'var(--accent-blue)' }}><Activity size={16} /></div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '100px' }}>Action</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedOrder.action || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ color: 'var(--accent-blue)' }}><Info size={16} /></div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '100px' }}>รายละเอียด</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{selectedOrder.description || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ color: 'var(--accent-blue)' }}><Globe size={16} /></div>
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '100px' }}>IP Address</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedOrder.ip_address || '-'}</span>
                        </div>
                        
                        {selectedOrder.error_message && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ color: '#ef4444' }}><ShieldAlert size={16} /></div>
                                <span style={{ fontSize: '13px', color: '#ef4444', width: '100px', fontWeight: 600 }}>Error</span>
                                <span style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444', wordBreak: 'break-all' }}>{selectedOrder.error_message}</span>
                            </div>
                        )}
                        
                        {selectedOrder.payload && (
                            <div style={{ marginTop: '16px' }}>
                                <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>📦 Payload</span>
                                <pre style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', fontSize: '11px', overflow: 'auto', maxHeight: '200px', margin: 0, border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                    {JSON.stringify(selectedOrder.payload, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
