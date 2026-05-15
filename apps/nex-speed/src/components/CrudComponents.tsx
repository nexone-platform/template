import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle2, XCircle, X, Download } from 'lucide-react';

// ==================================
// Shared Styles
// ==================================

export const crudStyles = {
    actionBtn: { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' } as React.CSSProperties,
    viewBtn: { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', color: '#3b82f6', background: 'rgba(59,130,246,0.12)' } as React.CSSProperties,
    editBtn: { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', color: '#f59e0b', background: 'rgba(245,158,11,0.12)' } as React.CSSProperties,
    deleteBtn: { width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', color: '#ef4444', background: 'rgba(239,68,68,0.12)' } as React.CSSProperties,
    primaryBtn: { padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(59,130,246,0.2)' } as React.CSSProperties,
    closeBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex' } as React.CSSProperties,
    label: { display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' } as React.CSSProperties,
    input: { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', outline: 'none' } as React.CSSProperties,
    exportBtn: (color: string): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', background: 'transparent', border: `1.5px solid ${color}30`, borderRadius: '8px', color, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }),
};

// ==================================
// Summary Card Component
// ==================================

interface SummaryCardProps {
    title: string;
    count?: number | string;
    value?: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: string;
    iconBg?: string; // For backward compatibility with older pages
    isActive?: boolean;
    onClick?: () => void;
}

export function SummaryCard({ title, count, value, subtitle, icon, color, iconBg, isActive = false, onClick }: SummaryCardProps) {
    const cardColor = color || (iconBg ? iconBg.substring(0, 7) : 'var(--accent-blue)'); // Fallback
    const hasClick = !!onClick;
    
    return (
        <div 
            onClick={onClick}
            style={{ 
                display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '14px', 
                background: isActive ? `${cardColor}1A` : `${cardColor}0A`, 
                border: isActive ? `2px solid ${cardColor}` : `1px solid ${cardColor}30`, 
                cursor: hasClick ? 'pointer' : 'default', 
                transition: 'all 0.2s', 
                opacity: (isActive || !hasClick) ? 1 : 0.8 
            }}
        >
            <div style={{ 
                width: '44px', height: '44px', borderRadius: '12px', background: `${cardColor}1A`, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: cardColor, fontSize: '20px' 
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{title}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 700, color: cardColor }}>{value !== undefined ? value : count}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle || 'รายการ'}</span>
                </div>
            </div>
        </div>
    );
}

// ==================================
// Common UI Elements
// ==================================

export function StatusDropdown({ 
    status, 
    onChange 
}: { 
    status: boolean, 
    onChange: (val: boolean) => void 
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = status === true;
    const color = isActive ? 'var(--accent-green)' : 'var(--text-muted)';
    const bg = isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)';

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <button 
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '4px 10px', borderRadius: '100px', border: 'none',
                    background: bg, color: color, fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s'
                }}
            >
                {isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {isActive ? 'ใช้งาน' : 'ยกเลิก'}
                <ChevronDown size={14} style={{ opacity: 0.7 }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                    marginTop: '4px', background: 'var(--bg-card)', 
                    border: '1px solid var(--border-color)', borderRadius: '10px',
                    boxShadow: 'var(--shadow-card)', minWidth: '110px', zIndex: 10,
                    overflow: 'hidden', padding: '4px'
                }}>
                    <div 
                        onClick={() => { onChange(true); setOpen(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderRadius: '6px', color: 'var(--text-primary)', fontWeight: status ? 600 : 400, background: status ? 'var(--bg-secondary)' : 'transparent' }}
                    >
                        <CheckCircle2 size={14} color="var(--accent-green)" /> ใช้งาน
                    </div>
                    <div 
                        onClick={() => { onChange(false); setOpen(false); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px', borderRadius: '6px', color: 'var(--text-primary)', fontWeight: !status ? 600 : 400, background: !status ? 'var(--bg-secondary)' : 'transparent' }}
                    >
                        <XCircle size={14} color="var(--text-muted)" /> ยกเลิก
                    </div>
                </div>
            )}
        </div>
    );
}

export function SearchInput({ value, onChange, placeholder = "ค้นหา..." }: { value: string, onChange: (val: string) => void, placeholder?: string }) {
    return (
        <div className="topbar-search" style={{ minWidth: '100px', maxWidth: '538.97px', flex: '1 1 auto', width: '100%' }}>
            <Search size={16} />
            <input 
                placeholder={placeholder} 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                style={{ width: '100%' }}
            />
        </div>
    );
}

// ==================================
// Shared Components: Export Buttons
// ==================================
interface ExportButtonsProps {
    onExportXLSX?: () => void;
    onExportCSV?: () => void;
    onExportPDF?: () => void;
}

export function ExportButtons({ onExportXLSX, onExportCSV, onExportPDF }: ExportButtonsProps) {
    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button 
                onClick={onExportXLSX}
                style={crudStyles.exportBtn('#10b981')}
                title="ออกรายงาน Excel"
            >
                <Download size={14} /> XLSX
            </button>
            <button 
                onClick={onExportCSV}
                style={crudStyles.exportBtn('#f59e0b')}
                title="ออกรายงาน CSV"
            >
                <Download size={14} /> CSV
            </button>
            <button 
                onClick={onExportPDF}
                style={crudStyles.exportBtn('#ef4444')}
                title="ออกรายงาน PDF"
            >
                <Download size={14} /> PDF
            </button>
        </div>
    );
}

// ==================================
// Base Modal Component
// ==================================
export function BaseModal({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    footer,
    width = '500px'
}: { 
    isOpen: boolean; 
    onClose: () => void; 
    title: string; 
    children: React.ReactNode; 
    footer?: React.ReactNode;
    width?: string;
}) {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(2px)' }}>
            <div style={{ background: 'var(--bg-primary)', borderRadius: '16px', width, maxWidth: '100%', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', animation: 'scaleIn 0.2s ease-out' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
                    <button onClick={onClose} style={crudStyles.closeBtn}><X size={20} /></button>
                </div>
                <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
                    {children}
                </div>
                {footer && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--bg-secondary)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
