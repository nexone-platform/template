"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { usePageTranslation } from "@/lib/language";

/* ─────────────────────────────────────────────────────────────────────────────
 * PageHeader – ใช้ร่วมกันทุกหน้า
 * ───────────────────────────────────────────────────────────────────────────── */
interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs?: BreadcrumbItem[];
    /** Primary action button */
    actionLabel?: string;
    onAction?: () => void;
    actionIcon?: React.ReactNode;
    /** Extra content slot (right side) */
    extra?: React.ReactNode;
    /** Fully custom actions slot — replaces the built-in button */
    actions?: React.ReactNode;
}

export function PageHeader({
    title,
    breadcrumbs,
    actionLabel,
    onAction,
    actionIcon,
    extra,
    actions,
}: PageHeaderProps) {
    return (
        <div className="flex flex-wrap justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{title}</h1>
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm text-gray-500 overflow-x-auto">
                        {breadcrumbs.map((crumb, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <span className="text-gray-400">/</span>}
                                {crumb.href ? (
                                    <Link href={crumb.href} className="text-nv-violet hover:text-nv-violet-dark hover:underline transition-colors whitespace-nowrap">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-gray-700 font-medium whitespace-nowrap">{crumb.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {extra}
                {actions}
                {actionLabel && onAction && (
                    <button
                        onClick={onAction}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-nv-violet text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-nv-violet-dark active:bg-nv-violet-dark shadow-sm shadow-nv-violet/25 hover:shadow-md hover:shadow-nv-violet/30 transition-all duration-150"
                    >
                        {actionIcon || <Plus className="w-4 h-4" />}
                        <span className="hidden xs:inline">{actionLabel}</span>
                        <span className="xs:hidden">{actionLabel}</span>
                    </button>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * StatusBadge – ใช้ร่วมกันทุกหน้าที่มี status
 * ───────────────────────────────────────────────────────────────────────────── */
type StatusVariant = "success" | "danger" | "warning" | "info" | "purple" | "default";

interface StatusBadgeProps {
    label?: string;
    /** Alias for label — pass status string directly */
    status?: string;
    variant?: StatusVariant;
    dot?: boolean;
}

const variantMap: Record<StatusVariant, string> = {
    success: "bg-nv-violet-light text-emerald-700 border-emerald-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    purple: "bg-violet-50 text-violet-700 border-violet-200",
    default: "bg-gray-50 text-gray-600 border-gray-200",
};

const dotColorMap: Record<StatusVariant, string> = {
    success: "bg-nv-violet",
    danger: "bg-red-500",
    warning: "bg-nv-warn",
    info: "bg-sky-500",
    purple: "bg-violet-500",
    default: "bg-gray-400",
};

/**
 * Auto-detect variant from common status labels
 */
function autoVariant(label: string): StatusVariant {
    const l = label.toLowerCase();
    if (["approved", "active", "open", "completed", "present"].includes(l)) return "success";
    if (["rejected", "declined", "cancelled", "terminated", "absent", "closed"].includes(l)) return "danger";
    if (["pending", "warning", "processing", "return"].includes(l)) return "warning";
    if (["new", "draft", "info"].includes(l)) return "purple";
    return "default";
}

export function StatusBadge({ label, status, variant, dot = true }: StatusBadgeProps) {
    const { t } = usePageTranslation();
    const text = label || status || "";
    const v = variant || autoVariant(text);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${variantMap[v]}`}>
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColorMap[v]}`} />}
            {t(text, text)}
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ActionButtons – ปุ่ม Edit / Delete / View มาตรฐาน
 * ───────────────────────────────────────────────────────────────────────────── */
import { Pencil, Trash2, Eye } from "lucide-react";

interface ActionButtonsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    editTitle?: string;
    deleteTitle?: string;
    viewTitle?: string;
}

export function ActionButtons({
    onEdit,
    onDelete,
    onView,
    editTitle,
    deleteTitle,
    viewTitle,
}: ActionButtonsProps) {
    const { t } = usePageTranslation();
    const _editTitle = editTitle || t('Edit', 'Edit');
    const _deleteTitle = deleteTitle || t('Delete', 'Delete');
    const _viewTitle = viewTitle || t('View', 'View');
    return (
        <div className="flex items-center justify-end gap-1">
            {onView && (
                <button
                    onClick={onView}
                    title={_viewTitle}
                    className="p-1.5 rounded-md text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light transition-colors"
                >
                    <Eye className="w-4 h-4" />
                </button>
            )}
            {onEdit && (
                <button
                    onClick={onEdit}
                    title={_editTitle}
                    className="p-1.5 rounded-md text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            )}
            {onDelete && (
                <button
                    onClick={onDelete}
                    title={_deleteTitle}
                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * EmptyState – ใช้เมื่อไม่มีข้อมูล
 * ───────────────────────────────────────────────────────────────────────────── */
import { Inbox } from "lucide-react";

interface EmptyStateProps {
    message?: string;
    /** ColSpan for when used inside a table */
    colSpan?: number;
}

export function EmptyState({ message, colSpan }: EmptyStateProps) {
    const { t } = usePageTranslation();
    const _message = message || t('No Data Found', 'No data found');
    const content = (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Inbox className="w-10 h-10 stroke-1 text-gray-300" />
            <p className="text-sm text-gray-400 font-medium">{_message}</p>
        </div>
    );
    if (colSpan) {
        return <tr><td colSpan={colSpan}>{content}</td></tr>;
    }
    return content;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * LoadingSpinner – loading state สำหรับตาราง
 * ───────────────────────────────────────────────────────────────────────────── */
interface LoadingSpinnerProps {
    colSpan?: number;
    message?: string;
}

export function LoadingSpinner({ colSpan, message }: LoadingSpinnerProps) {
    const { t } = usePageTranslation();
    const _message = message || t('Loading...', 'Loading...');
    const content = (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-[3px] border-nv-violet/20 rounded-full" />
                <div className="absolute inset-0 border-[3px] border-nv-violet border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-400 font-medium animate-pulse">{_message}</p>
        </div>
    );
    if (colSpan) {
        return <tr><td colSpan={colSpan}>{content}</td></tr>;
    }
    return content;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * TableSkeleton – Skeleton loading for tables (premium look)
 * ───────────────────────────────────────────────────────────────────────────── */
interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
    // Deterministic widths to avoid hydration mismatch (no Math.random)
    const widths = [75, 60, 85, 70, 90, 65, 80, 55, 72, 88];
    return (
        <div className="overflow-hidden">
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="flex items-center gap-4 px-4 py-4 border-b border-gray-50">
                    <div className="w-4 h-4 rounded bg-gray-100 animate-pulse" />
                    {Array.from({ length: columns }).map((_, c) => (
                        <div key={c} className="flex-1">
                            <div
                                className="h-3 bg-gray-100 rounded-full animate-pulse"
                                style={{
                                    width: `${widths[(r * columns + c) % widths.length]}%`,
                                    animationDelay: `${(r * columns + c) * 75}ms`
                                }}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * TableWrapper – Wrapper มาตรฐานสำหรับตาราง
 * ───────────────────────────────────────────────────────────────────────────── */
import { ArrowUpDown } from "lucide-react";

interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    align?: "left" | "center" | "right";
    className?: string;
    /** Width class e.g. 'w-14' */
    width?: string;
}

interface TableHeaderBarProps {
    pageSize: number;
    onPageSizeChange: (v: number) => void;
    searchText?: string;
    onSearchChange?: (v: string) => void;
    searchPlaceholder?: string;
    extra?: React.ReactNode;
    showLabel?: string;
    entriesLabel?: string;
}

export function TableHeaderBar({
    pageSize,
    onPageSizeChange,
    searchText,
    onSearchChange,
    searchPlaceholder,
    extra,
    showLabel,
    entriesLabel,
}: TableHeaderBarProps) {
    const { t } = usePageTranslation();
    const _showLabel = showLabel || t('Show', 'Show');
    const _entriesLabel = entriesLabel || t('Entries', 'entries');
    const _searchPlaceholder = searchPlaceholder || t('Search', 'Search') + '...';
    return (
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border-b [background-color:var(--nv-card,#fff)]">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{_showLabel}</span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="px-2.5 py-2 border border-nv-border rounded-lg [background-color:var(--nv-card,#fff)] text-sm focus:ring-2 focus:ring-nv-violet/20 focus:outline-none"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <span>{_entriesLabel}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
                {extra}
                {onSearchChange !== undefined && (
                    <input
                        type="text"
                        placeholder={_searchPlaceholder}
                        value={searchText || ""}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="px-3.5 py-2 border border-nv-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-nv-violet/20 focus:border-nv-violet w-full sm:w-52 transition-all [background-color:var(--nv-card,#fff)] placeholder:text-nv-text-dim"
                    />
                )}
            </div>
        </div>
    );
}

interface SortableThProps {
    column?: TableColumn;
    sortKey?: string | null;
    sortDir: "asc" | "desc";
    onSort: (key: string) => void;
    /** Flat-prop alternatives (legacy compat) */
    label?: string;
    currentSortKey?: string | null;
}

export function SortableTh(props: SortableThProps) {
    const { t } = usePageTranslation();
    // Support both `column` object pattern and flat-props pattern
    const column: TableColumn = props.column || {
        key: props.sortKey || "",
        label: props.label || "",
        sortable: true,
    };
    const { sortDir, onSort } = props;
    const sortKey = props.column ? (props.sortKey ?? null) : (props.currentSortKey ?? null);
    const align = column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left";
    const translatedLabel = t(column.label, column.label);
    if (!column.sortable) {
        return (
            <th className={`px-2.5 sm:px-4 py-2 sm:py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${align} ${column.width || ""} ${column.className || ""}`}>
                {translatedLabel}
            </th>
        );
    }
    return (
        <th
            className={`px-2.5 sm:px-4 py-2 sm:py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none group whitespace-nowrap ${align} ${column.width || ""} ${column.className || ""}`}
            onClick={() => onSort(column.key)}
        >
            <span className="inline-flex items-center gap-1 group-hover:text-gray-700 transition-colors">
                {translatedLabel}
                <ArrowUpDown className={`w-3 h-3 transition-colors ${sortKey === column.key ? "text-nv-violet" : "text-gray-300 group-hover:text-gray-400"}`} />

                {sortKey === column.key && (
                    <span className="text-[10px] text-nv-violet font-bold">{sortDir === "asc" ? "↑" : "↓"}</span>
                )}
            </span>
        </th>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * PaginationBar – Pagination มาตรฐาน
 * ───────────────────────────────────────────────────────────────────────────── */
interface PaginationBarProps {
    currentPage: number;
    totalPages: number;
    totalData: number;
    pageSize: number;
    onGoToPage: (page: number) => void;
    showingLabel?: string;
    toLabel?: string;
    ofLabel?: string;
    entriesLabel?: string;
    prevLabel?: string;
    nextLabel?: string;
}

export function PaginationBar({
    currentPage,
    totalPages,
    totalData,
    pageSize,
    onGoToPage,
    showingLabel,
    toLabel,
    ofLabel,
    entriesLabel,
    prevLabel,
    nextLabel,
}: PaginationBarProps) {
    const { t } = usePageTranslation();
    const _showingLabel = showingLabel || t('Showing', 'Showing');
    const _toLabel = toLabel || t('to', 'to');
    const _ofLabel = ofLabel || t('of', 'of');
    const _entriesLabel = entriesLabel || t('Entries', 'entries');
    const _prevLabel = prevLabel || t('Prev', 'Prev');
    const _nextLabel = nextLabel || t('Next', 'Next');
    if (totalData === 0) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalData);

    const getPages = () => {
        const pages: (number | "...")[] = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || Math.abs(currentPage - i) <= 2) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== "...") {
                pages.push("...");
            }
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-t bg-nv-bg text-xs sm:text-sm text-gray-500 gap-2 sm:gap-4">
            <span className="text-center sm:text-left">
                {_showingLabel} <span className="font-medium text-gray-700">{startItem}</span> {_toLabel}{" "}
                <span className="font-medium text-gray-700">{endItem}</span> {_ofLabel}{" "}
                <span className="font-medium text-gray-700">{totalData}</span> {_entriesLabel}
            </span>
            {totalPages > 1 && (
                <div className="flex items-center gap-1 flex-wrap justify-center">
                    <button
                        onClick={() => onGoToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-nv-border [background-color:var(--nv-card,#fff)] text-gray-600 hover:bg-nv-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    >
                        {_prevLabel}
                    </button>
                    {getPages().map((p, i) =>
                        p === "..." ? (
                            <span key={`dot-${i}`} className="px-1.5 sm:px-2 py-1 text-gray-400">…</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onGoToPage(p as number)}
                                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border text-xs font-medium transition-colors ${
                                    currentPage === p
                                        ? "bg-nv-violet text-white border-nv-violet shadow-sm shadow-nv-violet/25"
                                        : "border-nv-border [background-color:var(--nv-card,#fff)] text-gray-600 hover:bg-nv-bg"
                                }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                    <button
                        onClick={() => onGoToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-nv-border [background-color:var(--nv-card,#fff)] text-gray-600 hover:bg-nv-bg disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-medium"
                    >
                        {_nextLabel}
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ModalWrapper – Modal มาตรฐาน
 * ───────────────────────────────────────────────────────────────────────────── */
import { X as XIcon } from "lucide-react";

interface ModalWrapperProps {
    open: boolean;
    onClose: () => void;
    title: string;
    maxWidth?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function ModalWrapper({
    open,
    onClose,
    title,
    maxWidth = "max-w-2xl",
    children,
    footer,
}: ModalWrapperProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative [background-color:var(--nv-card,#fff)] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden`}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                {/* Body */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
                    {children}
                </div>
                {/* Footer */}
                {footer && (
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2 sm:gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * FormField – Form input มาตรฐาน
 * ───────────────────────────────────────────────────────────────────────────── */
interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}

export function FormField({ label, required, error, children }: FormFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * SelectAllCheckbox / RowCheckbox – Checkbox สำหรับเลือกแถว
 * ───────────────────────────────────────────────────────────────────────────── */
interface SelectAllCheckboxProps {
    checked: boolean;
    indeterminate: boolean;
    onChange: () => void;
}

export function SelectAllCheckbox({ checked, indeterminate, onChange }: SelectAllCheckboxProps) {
    return (
        <th className="w-10 px-2 sm:px-3 py-2 sm:py-3 text-center">
            <input
                type="checkbox"
                checked={checked}
                ref={(el) => { if (el) el.indeterminate = indeterminate; }}
                onChange={onChange}
                className="w-4 h-4 rounded border-gray-300 text-nv-violet focus:ring-nv-violet/30 cursor-pointer accent-[#6366F1]"
            />
        </th>
    );
}

interface RowCheckboxProps {
    checked: boolean;
    onChange: () => void;
}

export function RowCheckbox({ checked, onChange }: RowCheckboxProps) {
    return (
        <td className="w-10 px-2 sm:px-3 py-2.5 sm:py-3 text-center">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 rounded border-gray-300 text-nv-violet focus:ring-nv-violet/30 cursor-pointer accent-[#6366F1]"
            />
        </td>
    );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Standard CSS classes — export for direct use
 * ───────────────────────────────────────────────────────────────────────────── */
export const ui = {
    /** Standard table wrapper */
    tableWrapper: "rounded-xl shadow-sm border border-nv-border overflow-hidden [background-color:var(--nv-card,#fff)]",
    /** Table element */
    table: "w-full text-xs sm:text-[13px] md:text-sm",
    /** Table head row */
    thead: "bg-nv-bg border-b border-nv-border",
    /** Table body */
    tbody: "divide-y divide-nv-border-lt",
    /** Table row hover */
    tr: "hover:bg-nv-violet-light/40 transition-colors duration-100",
    /** Table row selected */
    trSelected: "bg-nv-violet/5 hover:bg-nv-violet/10 transition-colors duration-100",
    /** Standard cell */
    td: "px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-nv-text-sec",
    /** First column (index) */
    tdIndex: "px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-nv-text-dim text-center font-medium",
    /** Link cell */
    tdLink: "px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-medium text-nv-violet hover:text-nv-violet-dark cursor-pointer",
    /** Bold cell */
    tdBold: "px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 font-medium text-nv-text",
    /** Right-aligned cell (actions) */
    tdActions: "px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 text-right",
    /** Input */
    input: "w-full px-3.5 md:px-4 py-2 md:py-2.5 border border-nv-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-nv-violet/20 focus:border-nv-violet transition-all [background-color:var(--nv-card,#fff)] placeholder:text-nv-text-dim",
    /** Select */
    select: "w-full px-3.5 md:px-4 py-2 md:py-2.5 border border-nv-border rounded-lg [background-color:var(--nv-card,#fff)] text-sm outline-none focus:ring-2 focus:ring-nv-violet/20 focus:border-nv-violet transition-all",
    /** Textarea */
    textarea: "w-full px-3.5 md:px-4 py-2 md:py-2.5 border border-nv-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-nv-violet/20 focus:border-nv-violet transition-all resize-none [background-color:var(--nv-card,#fff)] placeholder:text-nv-text-dim",
    /** Disabled input */
    inputDisabled: "w-full px-3.5 md:px-4 py-2 md:py-2.5 border border-nv-border rounded-lg text-sm bg-nv-border-lt cursor-not-allowed outline-none text-nv-text-dim",
    /** Primary button */
    btnPrimary: "px-4 sm:px-5 py-2 md:py-2.5 bg-nv-violet text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-nv-violet-dark active:bg-nv-violet-dark disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-nv-violet/25 hover:shadow-md hover:shadow-nv-violet/30 transition-all duration-150 cursor-pointer",
    /** Secondary/Cancel button */
    btnSecondary: "px-4 sm:px-5 py-2 md:py-2.5 border border-nv-border text-nv-text text-xs sm:text-sm font-medium rounded-lg hover:bg-nv-border-lt active:bg-nv-border transition-colors cursor-pointer",
    /** Danger button */
    btnDanger: "px-4 sm:px-5 py-2 md:py-2.5 bg-nv-danger text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-nv-danger/90 active:bg-nv-danger/80 disabled:opacity-50 shadow-sm shadow-nv-danger/20 transition-all duration-150 cursor-pointer",
    /** Search/filter card */
    filterCard: "[background-color:var(--nv-card,#fff)] rounded-xl shadow-sm border border-nv-border p-3 sm:p-5 lg:p-6",
    /** Page container */
    pageContainer: "p-3 pt-14 sm:pt-4 sm:p-4 lg:p-6 xl:p-8 2xl:p-10 max-w-[1920px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8",
};;

