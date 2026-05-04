"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Upload,
    FileDown,
    FileSpreadsheet,
    ChevronDown,
    AlertTriangle,
    CheckCircle2,
    X,
    Loader2,
} from "lucide-react";
import type { ImportColumn, ImportResult, MasterDataTable } from "@/lib/excel-import";
import { BaseModal } from "@/components/CrudComponents";

/* ─────────────────────── Types ─────────────────────── */

interface ImportExcelButtonProps {
    /** Column definitions for the template & parser */
    columns: ImportColumn[];
    /** Filename prefix for the template download */
    filenamePrefix: string;
    /** Sample records to include in the downloaded template */
    sampleData?: Record<string, any>[];
    /** Master data tables to include as a reference sheet */
    masterData?: MasterDataTable[];
    /** Callback that receives the validated rows. Return a promise — loading state is managed automatically. */
    onImport: (rows: Record<string, any>[]) => Promise<{ success: number; failed: number }>;
    /** Called after a successful import (e.g. to invalidate queries) */
    onImportComplete?: () => void;
}

/* ─────────────────────── Component ─────────────────────── */

export default function ImportExcelButton({
    columns,
    filenamePrefix,
    sampleData,
    masterData,
    onImport,
    onImportComplete,
}: ImportExcelButtonProps) {
    const t = (en: string, th?: string) => th || en;
    const currentLang = 'th';
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [importing, setImporting] = useState(false);
    const [importDone, setImportDone] = useState(false);
    const [importSummary, setImportSummary] = useState<{ success: number; failed: number } | null>(null);
    const [fileName, setFileName] = useState("");

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    /* ── Download template ── */
    const handleDownloadTemplate = useCallback(async () => {
        const { downloadTemplate } = await import("@/lib/excel-import");
        downloadTemplate(columns, filenamePrefix, sampleData, masterData);
        setDropdownOpen(false);
    }, [columns, filenamePrefix, sampleData, masterData]);

    /* ── File picked ── */
    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            setFileName(file.name);
            setImportDone(false);
            setImportSummary(null);

            const { parseExcelFile } = await import("@/lib/excel-import");
            const result = await parseExcelFile(file, columns);
            setImportResult(result);
            setModalOpen(true);
            setDropdownOpen(false);

            // Reset the file input so re-selecting the same file still triggers onChange
            if (fileInputRef.current) fileInputRef.current.value = "";
        },
        [columns]
    );

    /* ── Confirm import ── */
    const handleConfirmImport = useCallback(async () => {
        if (!importResult || importResult.data.length === 0) return;

        // Filter to only valid rows (ones without errors)
        const errorRowNums = new Set(importResult.errors.map((e) => e.row));
        const validRows = importResult.data
            .filter((r) => !errorRowNums.has(r._rowNum))
            .map((row) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { _rowNum, ...rest } = row;
                    return rest;
                });

        if (validRows.length === 0) return;

        setImporting(true);
        try {
            const summary = await onImport(validRows);
            setImportSummary(summary);
            setImportDone(true);
            onImportComplete?.();
        } catch {
            setImportSummary({ success: 0, failed: validRows.length });
            setImportDone(true);
        } finally {
            setImporting(false);
        }
    }, [importResult, onImport, onImportComplete]);

    /* ── Close & reset ── */
    const handleClose = useCallback(() => {
        setModalOpen(false);
        setImportResult(null);
        setImportDone(false);
        setImportSummary(null);
        setFileName("");
    }, []);

    // Derived counts
    const errorRowNums = new Set(importResult?.errors.map((e) => e.row) ?? []);
    const validCount = importResult ? importResult.data.filter((r) => !errorRowNums.has(r._rowNum)).length : 0;
    const errorCount = errorRowNums.size;
    const totalCount = importResult?.totalRows ?? 0;

    return (
        <>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-nv-border rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-150"
                >
                    <Upload className="w-4 h-4" />
                    <span>{t("Import", currentLang === 'th' ? "นำเข้า" : "Import")}</span>
                    <ChevronDown
                        className={`w-3.5 h-3.5 text-emerald-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                </button>

                {dropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <button
                            onClick={handleDownloadTemplate}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                            <FileDown className="w-4 h-4" />
                            {t("Download Template", currentLang === 'th' ? "ดาวน์โหลดเทมเพลต" : "Download Template")}
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            {t("Upload Excel File", currentLang === 'th' ? "อัปโหลดไฟล์ Excel" : "Upload Excel File")}
                        </button>
                    </div>
                )}
            </div>

            {/* Preview / Confirm Modal */}
            <BaseModal
                isOpen={modalOpen}
                onClose={handleClose}
                title={t("Import Preview", currentLang === 'th' ? "ตรวจสอบข้อมูลก่อนนำเข้า" : "Import Preview")}
                width="768px"
                footer={
                    importDone ? (
                        <button onClick={handleClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                            {t("Close", currentLang === 'th' ? "ปิด" : "Close")}
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {t("Cancel", currentLang === 'th' ? "ยกเลิก" : "Cancel")}
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                disabled={importing || validCount === 0}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-150"
                            >
                                {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                                {importing
                                    ? t("Importing...", currentLang === 'th' ? "กำลังนำเข้า..." : "Importing...")
                                    : `${t("Import", currentLang === 'th' ? "นำเข้า" : "Import")} ${validCount} ${t("records", currentLang === 'th' ? "รายการ" : "records")}`}
                            </button>
                        </div>
                    )
                }
            >
                {importResult && (
                    <div className="space-y-4">
                        {/* File info */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                                <p className="text-xs text-gray-500">
                                    {totalCount} {t("rows found", currentLang === 'th' ? "แถวที่พบ" : "rows found")}
                                </p>
                            </div>
                        </div>

                        {/* Summary cards */}
                        {!importDone && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <div>
                                        <p className="text-lg font-bold text-emerald-700">{validCount}</p>
                                        <p className="text-xs text-emerald-600">{t("Valid rows", currentLang === 'th' ? "แถวที่ถูกต้อง" : "Valid rows")}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg border ${errorCount > 0 ? "bg-red-50 border-red-100" : "bg-gray-50 border-gray-100"}`}>
                                    <AlertTriangle className={`w-5 h-5 ${errorCount > 0 ? "text-red-500" : "text-gray-400"}`} />
                                    <div>
                                        <p className={`text-lg font-bold ${errorCount > 0 ? "text-red-600" : "text-gray-400"}`}>{errorCount}</p>
                                        <p className={`text-xs ${errorCount > 0 ? "text-red-500" : "text-gray-400"}`}>{t("Error rows", currentLang === 'th' ? "แถวที่มีข้อผิดพลาด" : "Error rows")}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Import result */}
                        {importDone && importSummary && (
                            <div className="space-y-3">
                                <div className={`p-4 rounded-lg border ${importSummary.success > 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {importSummary.success > 0 ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                        )}
                                        <span className={`text-sm font-semibold ${importSummary.success > 0 ? "text-emerald-700" : "text-red-700"}`}>
                                            {t("Import Complete", currentLang === 'th' ? "นำเข้าเสร็จสิ้น" : "Import Complete")}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {t("Success", currentLang === 'th' ? "สำเร็จ" : "Success")}: <span className="font-bold text-emerald-700">{importSummary.success}</span>
                                        {importSummary.failed > 0 && (
                                            <> · {t("Failed", currentLang === 'th' ? "ล้มเหลว" : "Failed")}: <span className="font-bold text-red-600">{importSummary.failed}</span></>
                                        )}
                                    </p>
                                </div>
                                
                                {importSummary.failed > 0 && (importSummary as any).errorDetails?.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-red-600">
                                            {t("Failure Details", currentLang === 'th' ? "รายละเอียดข้อผิดพลาด" : "Failure Details")}
                                        </p>
                                        <div className="max-h-32 overflow-y-auto space-y-1 bg-red-50/50 p-2 rounded-md">
                                            {(importSummary as any).errorDetails.map((err: string, i: number) => (
                                                <div key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                                                    <span className="mt-0.5">•</span>
                                                    <span>{err}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Error list */}
                        {importResult.errors.length > 0 && !importDone && (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4" />
                                    {t("Validation Errors", currentLang === 'th' ? "ข้อผิดพลาดในการตรวจสอบ" : "Validation Errors")}
                                </p>
                                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                                    {importResult.errors.slice(0, 20).map((err, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md">
                                            <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                            <span>{err.message}</span>
                                        </div>
                                    ))}
                                    {importResult.errors.length > 20 && (
                                        <p className="text-xs text-red-400 text-center py-1">
                                            ... {t("and", currentLang === 'th' ? "และ" : "and")} {importResult.errors.length - 20} {t("more errors", currentLang === 'th' ? "ข้อผิดพลาดอื่นอีก" : "more errors")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Data preview table */}
                        {!importDone && validCount > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-700">
                                    {t("Data Preview", currentLang === 'th' ? "ตัวอย่างข้อมูล" : "Data Preview")} ({Math.min(validCount, 10)} / {validCount})
                                </p>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="w-full text-xs">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">#</th>
                                                {columns.map((col) => (
                                                    <th key={col.key} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                        {col.header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {importResult.data
                                                .filter((r) => !errorRowNums.has(r._rowNum))
                                                .slice(0, 10)
                                                .map((row, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50">
                                                        <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                                                        {columns.map((col) => (
                                                            <td key={col.key} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                                                                {row[col.key] ?? ""}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </BaseModal>
        </>
    );
}
