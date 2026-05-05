"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Upload,
    Download,
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
    /** Translation dictionary */
    translations?: Record<string, string>;
}

/* ─────────────────────── Component ─────────────────────── */

export default function ImportExcelButton({
    columns,
    filenamePrefix,
    sampleData,
    masterData,
    onImport,
    onImportComplete,
    translations
}: ImportExcelButtonProps) {
    const tLoc = (en: string, th?: string) => th || en;
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
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', background: '#059669', color: 'white', border: 'none',
                        borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500,
                        transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                >
                    <Upload size={16} />
                    <span>{translations?.['import_button'] || tLoc("Import", currentLang === 'th' ? "นำเข้า" : "Import")}</span>
                    <ChevronDown
                        size={14}
                        style={{
                            transition: 'transform 0.2s',
                            transform: dropdownOpen ? 'rotate(180deg)' : 'none'
                        }}
                    />
                </button>

                {dropdownOpen && (
                    <div style={{
                        position: 'absolute', top: '100%', left: 0, marginTop: '4px',
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 9999,
                        minWidth: '200px', padding: '4px', display: 'flex', flexDirection: 'column'
                    }}>
                        <button
                            onClick={handleDownloadTemplate}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '14px', whiteSpace: 'nowrap' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <Download size={14} color="#10b981" /> {translations?.['download_template'] || "Download Template"}
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '14px', whiteSpace: 'nowrap' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <Upload size={14} color="#10b981" /> {translations?.['upload_excel_file'] || "Upload Excel File"}
                        </button>
                    </div>
                )}
            </div>

            {/* Preview / Confirm Modal */}
            <BaseModal
                isOpen={modalOpen}
                onClose={handleClose}
                title={translations?.['import_preview'] || tLoc("Import Preview", currentLang === 'th' ? "ตรวจสอบข้อมูลก่อนนำเข้า" : "Import Preview")}
                width="768px"
                footer={
                    importDone ? (
                        <button onClick={handleClose} style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}>
                            {translations?.['close'] || tLoc("Close", currentLang === 'th' ? "ปิด" : "Close")}
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={handleClose}
                                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '14px' }}
                            >
                                {translations?.['cancel'] || tLoc("Cancel", currentLang === 'th' ? "ยกเลิก" : "Cancel")}
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                disabled={importing || validCount === 0}
                                style={{ padding: '8px 16px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: (importing || validCount === 0) ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', opacity: (importing || validCount === 0) ? 0.6 : 1 }}
                            >
                                {importing && <Loader2 className="w-4 h-4 animate-spin" />}
                                {importing
                                    ? translations?.['importing'] || tLoc("Importing...", currentLang === 'th' ? "กำลังนำเข้า..." : "Importing...")
                                    : `${translations?.['import_button'] || tLoc("Import", currentLang === 'th' ? "นำเข้า" : "Import")} ${validCount} ${translations?.['records'] || tLoc("records", currentLang === 'th' ? "รายการ" : "records")}`}
                            </button>
                        </div>
                    )
                }
            >
                {importResult && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* File info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <FileSpreadsheet size={20} color="#059669" style={{ flexShrink: 0 }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName}</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                                    {totalCount} {translations?.['rows_found'] || tLoc("rows found", currentLang === 'th' ? "แถวที่พบ" : "rows found")}
                                </p>
                            </div>
                        </div>

                        {/* Summary cards */}
                        {!importDone && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <CheckCircle2 size={20} color="#059669" />
                                    <div>
                                        <p style={{ fontSize: '18px', fontWeight: 700, color: '#059669', margin: 0 }}>{validCount}</p>
                                        <p style={{ fontSize: '12px', color: '#059669', margin: 0 }}>{translations?.['valid_rows'] || tLoc("Valid rows", currentLang === 'th' ? "แถวที่ถูกต้อง" : "Valid rows")}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', border: `1px solid ${errorCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-color)'}`, background: errorCount > 0 ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-secondary)' }}>
                                    <AlertTriangle size={20} color={errorCount > 0 ? "#ef4444" : "var(--text-muted)"} />
                                    <div>
                                        <p style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: errorCount > 0 ? "#ef4444" : "var(--text-muted)" }}>{errorCount}</p>
                                        <p style={{ fontSize: '12px', margin: 0, color: errorCount > 0 ? "#ef4444" : "var(--text-muted)" }}>{translations?.['error_rows'] || tLoc("Error rows", currentLang === 'th' ? "แถวที่มีข้อผิดพลาด" : "Error rows")}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Import result */}
                        {importDone && importSummary && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${importSummary.success > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, background: importSummary.success > 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        {importSummary.success > 0 ? (
                                            <CheckCircle2 size={20} color="#059669" />
                                        ) : (
                                            <AlertTriangle size={20} color="#ef4444" />
                                        )}
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: importSummary.success > 0 ? '#059669' : '#ef4444' }}>
                                            {translations?.['import_complete'] || tLoc("Import Complete", currentLang === 'th' ? "นำเข้าเสร็จสิ้น" : "Import Complete")}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                                        {translations?.['success'] || tLoc("Success", currentLang === 'th' ? "สำเร็จ" : "Success")}: <span style={{ fontWeight: 700, color: '#059669' }}>{importSummary.success}</span>
                                        {importSummary.failed > 0 && (
                                            <> &middot; {translations?.['failed'] || tLoc("Failed", currentLang === 'th' ? "ล้มเหลว" : "Failed")}: <span style={{ fontWeight: 700, color: '#ef4444' }}>{importSummary.failed}</span></>
                                        )}
                                    </p>
                                </div>
                                
                                {importSummary.failed > 0 && (importSummary as any).errorDetails?.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444', margin: 0 }}>
                                            {translations?.['failure_details'] || tLoc("Failure Details", currentLang === 'th' ? "รายละเอียดข้อผิดพลาด" : "Failure Details")}
                                        </p>
                                        <div style={{ maxHeight: '128px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '6px' }}>
                                            {(importSummary as any).errorDetails.map((err: string, i: number) => (
                                                <div key={i} style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                                    <span style={{ marginTop: '2px' }}>&bull;</span>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertTriangle size={16} />
                                    {translations?.['validation_errors'] || tLoc("Validation Errors", currentLang === 'th' ? "ข้อผิดพลาดในการตรวจสอบ" : "Validation Errors")}
                                </p>
                                <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '4px' }}>
                                    {importResult.errors.slice(0, 20).map((err, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)', padding: '8px 12px', borderRadius: '6px' }}>
                                            <X size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
                                            <span>{err.message}</span>
                                        </div>
                                    ))}
                                    {importResult.errors.length > 20 && (
                                        <p style={{ fontSize: '12px', color: 'rgba(239, 68, 68, 0.8)', textAlign: 'center', padding: '4px 0', margin: 0 }}>
                                            ... {translations?.['and'] || tLoc("and", currentLang === 'th' ? "และ" : "and")} {importResult.errors.length - 20} {translations?.['more_errors'] || tLoc("more errors", currentLang === 'th' ? "ข้อผิดพลาดอื่นอีก" : "more errors")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Data preview table */}
                        {!importDone && validCount > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                    {translations?.['data_preview'] || tLoc("Data Preview", currentLang === 'th' ? "ตัวอย่างข้อมูล" : "Data Preview")} ({Math.min(validCount, 10)} / {validCount})
                                </p>
                                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
                                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                            <tr>
                                                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                                                {columns.map((col) => (
                                                    <th key={col.key} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                                                        {col.header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody style={{ borderTop: '1px solid var(--border-color)' }}>
                                            {importResult.data
                                                .filter((r) => !errorRowNums.has(r._rowNum))
                                                .slice(0, 10)
                                                .map((row, i) => (
                                                    <tr key={i} style={{ borderBottom: i < 9 ? '1px solid var(--border-color)' : 'none' }}>
                                                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{i + 1}</td>
                                                        {columns.map((col) => (
                                                            <td key={col.key} style={{ padding: '8px 12px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
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
