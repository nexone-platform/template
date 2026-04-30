import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    setPageSize: React.Dispatch<React.SetStateAction<number>>;
}

export default function Pagination({ currentPage, pageSize, totalItems, setCurrentPage, setPageSize }: PaginationProps) {
    if (totalItems <= 0) return null;
    
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(currentPage, totalPages) || 1;

    const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({
        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        opacity: disabled ? 0.5 : 1,
        fontSize: '13px', fontFamily: 'inherit', transition: 'all 0.15s',
    });

    const pageNumbers = (current: number, total: number): (number | string)[] => {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const pages: (number | string)[] = [];
        if (current <= 4) {
            for (let i = 1; i <= 5; i++) pages.push(i);
            pages.push('...');
            pages.push(total);
        } else if (current >= total - 3) {
            pages.push(1);
            pages.push('...');
            for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            for (let i = current - 1; i <= current + 1; i++) pages.push(i);
            pages.push('...');
            pages.push(total);
        }
        return pages;
    };

    const getRangeStart = () => {
        if (totalItems <= 0) return 0;
        return (safePage - 1) * (pageSize || 10) + 1;
    };

    const getRangeEnd = () => {
        return Math.min(safePage * (pageSize || 10), totalItems);
    };

    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
            padding: '10px 16px', borderTop: '1px solid var(--border-color)', gap: '12px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>แสดง</span>
                <select value={pageSize || 10} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    style={{
                        padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '13px', fontFamily: 'inherit', outline: 'none'
                    }}>
                    {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span>รายการ / หน้า</span>
                <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>
                    ({getRangeStart()}–{getRangeEnd()} จาก {totalItems})
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button onClick={() => setCurrentPage(1)} disabled={safePage <= 1} style={pageBtnStyle(safePage <= 1)}>
                    <ChevronsLeft size={16} />
                </button>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage <= 1} style={pageBtnStyle(safePage <= 1)}>
                    <ChevronLeft size={16} />
                </button>
                {pageNumbers(safePage, totalPages).map((p, i) =>
                    p === '...' ? (
                        <span key={`dot${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>
                    ) : (
                        <button key={p} onClick={() => setCurrentPage(Number(p))}
                            style={{
                                ...pageBtnStyle(false),
                                background: Number(p) === safePage ? 'var(--accent-blue)' : 'transparent',
                                color: Number(p) === safePage ? 'white' : 'var(--text-secondary)',
                                fontWeight: Number(p) === safePage ? 700 : 500,
                                minWidth: '32px',
                            }}>
                            {p}
                        </button>
                    )
                )}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} style={pageBtnStyle(safePage >= totalPages)}>
                    <ChevronRight size={16} />
                </button>
                <button onClick={() => setCurrentPage(totalPages)} disabled={safePage >= totalPages} style={pageBtnStyle(safePage >= totalPages)}>
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
}
