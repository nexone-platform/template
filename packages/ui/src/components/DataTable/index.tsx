'use client';

import React from 'react';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight, Loader2, Filter } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────
export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T = any> {
  key: string;
  title: string;
  width?: string | number;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  rowKey?: string | ((row: T) => string);
  // Sorting
  sortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string, direction: SortDirection) => void;
  // Pagination
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  // Row events
  onRowClick?: (row: T, index: number) => void;
  // Selection
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  // Extra
  headerAction?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const cellAlignMap = { left: 'left', center: 'center', right: 'right' } as const;

// ── DataTable ──────────────────────────────────────────────────────────────────
export function DataTable<T = any>({
  columns,
  data,
  loading = false,
  emptyText = 'ไม่มีข้อมูล',
  rowKey = 'id',
  sortKey,
  sortDirection,
  onSort,
  page = 1,
  pageSize = 20,
  total,
  onPageChange,
  searchable,
  searchPlaceholder = 'ค้นหา...',
  onSearch,
  onRowClick,
  selectable,
  selectedKeys = [],
  onSelectionChange,
  headerAction,
  title,
  subtitle,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = React.useState('');
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

  const getKey = (row: T, idx: number): string => {
    if (typeof rowKey === 'function') return rowKey(row);
    return String((row as any)[rowKey] ?? idx);
  };

  const totalPages = total !== undefined ? Math.ceil(total / pageSize) : undefined;

  const handleSort = (col: Column<T>) => {
    if (!col.sortable || !onSort) return;
    if (sortKey !== col.key) return onSort(col.key, 'asc');
    if (sortDirection === 'asc') return onSort(col.key, 'desc');
    return onSort(col.key, null);
  };

  const handleSearchChange = (val: string) => {
    setLocalSearch(val);
    onSearch?.(val);
  };

  const toggleSelect = (key: string) => {
    if (!onSelectionChange) return;
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter(k => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (selectedKeys.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((row, i) => getKey(row, i)));
    }
  };

  return (
    <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 'var(--radius, 12px)', border: '1px solid var(--border-color, #e2e8f0)', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      {(title || searchable || headerAction) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-color, #f1f5f9)', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            {title && <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>{title}</h3>}
            {subtitle && <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {searchable && (
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={localSearch}
                  onChange={e => handleSearchChange(e.target.value)}
                  style={{
                    paddingLeft: '32px', paddingRight: '12px', paddingTop: '7px', paddingBottom: '7px',
                    border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none',
                    color: '#334155', background: '#f8fafc', width: '200px',
                  }}
                />
              </div>
            )}
            {headerAction}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {selectable && (
                <th style={{ width: '44px', padding: '12px 16px', borderBottom: '1px solid var(--border-color, #e2e8f0)', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedKeys.length === data.length}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color, #e2e8f0)',
                    textAlign: cellAlignMap[col.align ?? 'left'],
                    fontWeight: 600, color: '#64748b', fontSize: '11px',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none', whiteSpace: 'nowrap',
                    width: col.width,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {col.title}
                    {col.sortable && (
                      <span style={{ display: 'flex', flexDirection: 'column', marginLeft: '2px' }}>
                        <ChevronUp size={10} color={sortKey === col.key && sortDirection === 'asc' ? '#2563eb' : '#cbd5e1'} />
                        <ChevronDown size={10} color={sortKey === col.key && sortDirection === 'desc' ? '#2563eb' : '#cbd5e1'} style={{ marginTop: '-2px' }} />
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8' }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ textAlign: 'center', padding: '48px 16px', color: '#94a3b8', fontSize: '14px' }}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => {
                const key = getKey(row, rowIdx);
                const isSelected = selectedKeys.includes(key);
                const isHovered = hoveredRow === rowIdx;
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row, rowIdx)}
                    onMouseEnter={() => setHoveredRow(rowIdx)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      background: isSelected ? '#eff6ff' : isHovered ? '#f8fafc' : '#fff',
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background 0.12s',
                      borderBottom: '1px solid var(--border-color, #f1f5f9)',
                    }}
                  >
                    {selectable && (
                      <td
                        style={{ width: '44px', padding: '12px 16px', textAlign: 'center' }}
                        onClick={e => { e.stopPropagation(); toggleSelect(key); }}
                      >
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(key)} style={{ cursor: 'pointer' }} />
                      </td>
                    )}
                    {columns.map(col => (
                      <td
                        key={col.key}
                        style={{
                          padding: '12px 16px',
                          textAlign: cellAlignMap[col.align ?? 'left'],
                          color: '#334155',
                          verticalAlign: 'middle',
                        }}
                      >
                        {col.render
                          ? col.render((row as any)[col.key], row, rowIdx)
                          : ((row as any)[col.key] ?? '—')
                        }
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages !== undefined && totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderTop: '1px solid var(--border-color, #f1f5f9)', fontSize: '12px', color: '#64748b',
        }}>
          <span>แสดง {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total!)} จาก {total} รายการ</span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              style={{
                width: '30px', height: '30px', borderRadius: '6px',
                border: '1px solid #e2e8f0', background: page <= 1 ? '#f8fafc' : '#fff',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b',
              }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  style={{
                    width: '30px', height: '30px', borderRadius: '6px',
                    border: p === page ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    background: p === page ? '#2563eb' : '#fff',
                    color: p === page ? '#fff' : '#64748b',
                    cursor: 'pointer', fontSize: '12px', fontWeight: p === page ? 600 : 400,
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              style={{
                width: '30px', height: '30px', borderRadius: '6px',
                border: '1px solid #e2e8f0', background: page >= totalPages ? '#f8fafc' : '#fff',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
