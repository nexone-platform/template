"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileSpreadsheet, FileText, CheckSquare, ChevronDown } from "lucide-react";
import type { ExportColumn } from "@/lib/table-export";
import { useLanguage } from "@/lib/language";

interface ExportButtonsProps {
    /** Full (filtered) data to export */
    data: any[];
    /** Column definitions for the exported file */
    columns: ExportColumn[];
    /** Filename prefix, e.g. "departments" */
    filenamePrefix: string;
    /** Title shown in PDF header (optional) */
    pdfTitle?: string;
    /** Total record count for the label (auto-translated) */
    totalCount?: number;
    /** Total record count for the "export ทั้งหมด X รายการ" label (legacy, kept for compatibility) */
    totalLabel?: string;
    /** Selected rows only — if provided AND non-empty, export these instead of `data` */
    selectedData?: any[];
    /** Number of selected rows (for display) */
    selectedCount?: number;
    /** Callback to clear selection after export */
    onClearSelection?: () => void;
}

export default function ExportButtons({
    data,
    columns,
    filenamePrefix,
    pdfTitle,
    totalCount,
    totalLabel,
    selectedData,
    selectedCount = 0,
    onClearSelection,
}: ExportButtonsProps) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // If there are selected rows, export only those; otherwise export all
    const exportData = selectedData && selectedData.length > 0 ? selectedData : data;

    const handleExport = async (type: "xlsx" | "csv" | "pdf") => {
        const { exportXLSX, exportCSV, exportPDF } = await import(
            "@/lib/table-export"
        );
        switch (type) {
            case "xlsx":
                await exportXLSX(exportData, columns, filenamePrefix);
                break;
            case "csv":
                await exportCSV(exportData, columns, filenamePrefix);
                break;
            case "pdf":
                await exportPDF(exportData, columns, filenamePrefix, pdfTitle);
                break;
        }
        setOpen(false);
    };

    // Selection badge
    const hasSelection = selectedCount > 0;

    // Auto-generate translated label from totalCount, fallback to totalLabel
    const displayLabel = hasSelection
        ? `${t('Selected', 'เลือกแล้ว')} ${selectedCount} ${t('records', 'รายการ')}`
        : totalCount !== undefined
            ? `${t('Total', 'ทั้งหมด')} ${totalCount} ${t('records', 'รายการ')}`
            : totalLabel;

    const exportItems = [
        { type: "xlsx" as const, label: "Excel (XLSX)", icon: <FileSpreadsheet className="w-4 h-4" /> },
        { type: "csv" as const, label: "CSV", icon: <FileText className="w-4 h-4" /> },
        { type: "pdf" as const, label: "PDF", icon: <FileText className="w-4 h-4" /> },
    ];

    return (
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Export Dropdown */}
            <div className="relative" ref={ref}>
                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-nv-border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 [background-color:var(--nv-card,#fff)]"
                >
                    <Download className="w-4 h-4 text-gray-500" />
                    <span>{t('Export', 'ส่งออก')}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        {exportItems.map((item) => (
                            <button
                                key={item.type}
                                onClick={() => handleExport(item.type)}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-nv-violet-light hover:text-nv-violet transition-colors"
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selection indicator + clear button */}
            {hasSelection ? (
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-nv-violet font-medium bg-nv-violet/10 px-2.5 py-1 rounded-full">
                        <CheckSquare className="w-3.5 h-3.5" />
                        {displayLabel}
                    </span>
                    {onClearSelection && (
                        <button
                            onClick={onClearSelection}
                            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
                        >
                            {t('Clear', 'ล้าง')}
                        </button>
                    )}
                </div>
            ) : displayLabel ? (
                <span className="text-xs sm:text-sm text-gray-400 ml-1">{displayLabel}</span>
            ) : null}
        </div>
    );
}
