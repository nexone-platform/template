/**
 * Excel Import utility — parses .xlsx / .xls files on the client.
 */

import * as XLSX from "xlsx-js-style";
import { downloadFile } from "@/lib/download-file";

/* ─────────────────────── Types ─────────────────────── */

export interface ImportColumn {
    header: string;
    key: string;
    required?: boolean;
    type?: "string" | "number" | "date";
}

export interface MasterDataTable {
    title: string;
    headers: string[];
    rows: string[][];
}

export interface ParsedRow {
    _rowNum: number;
    [key: string]: any;
}

export interface ImportValidationError {
    row: number;
    column: string;
    message: string;
}

export interface ImportResult {
    data: ParsedRow[];
    errors: ImportValidationError[];
    totalRows: number;
}

/* ─────────────────── Template generation ─────────────────── */

export async function downloadTemplate(
    columns: ImportColumn[],
    filenamePrefix: string,
    sampleData?: Record<string, any>[],
    masterData?: MasterDataTable[]
) {
    const headers = columns.map((c) => c.header);
    const dataRows = (sampleData || []).map((row) => 
        columns.map((col) => row[col.key] ?? "")
    );

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    const HEADER_STYLE = {
        font: { bold: true, color: { rgb: "FFFFFF" }, name: "Sarabun", sz: 11 },
        fill: { fgColor: { rgb: "6366F1" } },
        alignment: { horizontal: "center" as const, vertical: "center" as const },
        border: {
            top: { style: "thin" as const, color: { rgb: "4F46E5" } },
            bottom: { style: "thin" as const, color: { rgb: "4F46E5" } },
            left: { style: "thin" as const, color: { rgb: "4F46E5" } },
            right: { style: "thin" as const, color: { rgb: "4F46E5" } },
        },
    };

    // Apply header styles
    columns.forEach((_, ci) => {
        const ref = XLSX.utils.encode_cell({ r: 0, c: ci });
        if (ws[ref]) ws[ref].s = HEADER_STYLE;
    });

    // Content cell styling (center numbers, Sarabun font)
    const CONTENT_STYLE = {
        font: { name: "Sarabun", sz: 10 },
        alignment: { vertical: "center" as const },
        border: {
            top: { style: "thin" as const, color: { rgb: "E5E7EB" } },
            bottom: { style: "thin" as const, color: { rgb: "E5E7EB" } },
            left: { style: "thin" as const, color: { rgb: "E5E7EB" } },
            right: { style: "thin" as const, color: { rgb: "E5E7EB" } },
        },
    };

    if (sampleData && sampleData.length > 0) {
        for (let ri = 1; ri <= sampleData.length; ri++) {
            columns.forEach((_, ci) => {
                const ref = XLSX.utils.encode_cell({ r: ri, c: ci });
                if (ws[ref]) ws[ref].s = CONTENT_STYLE;
            });
        }
    }

    ws["!cols"] = columns.map((c) => ({
        wch: Math.max(c.header.length + 4, 18),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // ── Build Master Data reference sheet ──
    if (masterData && masterData.length > 0) {
        const masterRows: any[][] = [];
        const masterMerges: XLSX.Range[] = [];
        const THIN_BORDER = {
            top: { style: "thin" as const, color: { rgb: "D1D5DB" } },
            bottom: { style: "thin" as const, color: { rgb: "D1D5DB" } },
            left: { style: "thin" as const, color: { rgb: "D1D5DB" } },
            right: { style: "thin" as const, color: { rgb: "D1D5DB" } },
        };
        const TITLE_STYLE = {
            font: { bold: true, color: { rgb: "FFFFFF" }, name: "Sarabun", sz: 11 },
            fill: { fgColor: { rgb: "1E40AF" } },
            alignment: { horizontal: "left" as const, vertical: "center" as const },
            border: THIN_BORDER,
        };
        const TH_STYLE = {
            font: { bold: true, color: { rgb: "FFFFFF" }, name: "Sarabun", sz: 10 },
            fill: { fgColor: { rgb: "3B82F6" } },
            alignment: { horizontal: "center" as const, vertical: "center" as const },
            border: THIN_BORDER,
        };
        const TD_STYLE = {
            font: { name: "Sarabun", sz: 10 },
            alignment: { vertical: "center" as const, wrapText: true },
            border: THIN_BORDER,
        };
        const TD_CODE_STYLE = {
            font: { bold: true, name: "Sarabun", sz: 10, color: { rgb: "1E40AF" } },
            alignment: { vertical: "center" as const },
            border: THIN_BORDER,
        };

        // Calculate max columns needed across all tables
        let maxCols = 1;
        for (const table of masterData) {
            maxCols = Math.max(maxCols, table.headers.length);
        }

        for (const table of masterData) {
            const titleRowIdx = masterRows.length;
            // Title row
            const titleRow = new Array(maxCols).fill("");
            titleRow[0] = `📋 ${table.title}`;
            masterRows.push(titleRow);
            // Merge title across all header columns
            if (table.headers.length > 1) {
                masterMerges.push({
                    s: { r: titleRowIdx, c: 0 },
                    e: { r: titleRowIdx, c: table.headers.length - 1 },
                });
            }

            // Header row
            const headerRow = new Array(maxCols).fill("");
            table.headers.forEach((h, i) => { headerRow[i] = h; });
            masterRows.push(headerRow);

            // Data rows
            for (const row of table.rows) {
                const dataRow = new Array(maxCols).fill("");
                row.forEach((v, i) => { dataRow[i] = v; });
                masterRows.push(dataRow);
            }

            // Blank separator row
            masterRows.push(new Array(maxCols).fill(""));
        }

        const wsMaster = XLSX.utils.aoa_to_sheet(masterRows);
        wsMaster["!merges"] = masterMerges;

        // Apply styles to master sheet
        let currentRow = 0;
        for (const table of masterData) {
            // Title row style
            for (let c = 0; c < maxCols; c++) {
                const ref = XLSX.utils.encode_cell({ r: currentRow, c });
                if (!wsMaster[ref]) wsMaster[ref] = { v: "", t: "s" };
                wsMaster[ref].s = TITLE_STYLE;
            }
            currentRow++;

            // Header row style
            for (let c = 0; c < table.headers.length; c++) {
                const ref = XLSX.utils.encode_cell({ r: currentRow, c });
                if (!wsMaster[ref]) wsMaster[ref] = { v: "", t: "s" };
                wsMaster[ref].s = TH_STYLE;
            }
            currentRow++;

            // Data rows style
            for (let ri = 0; ri < table.rows.length; ri++) {
                for (let c = 0; c < table.headers.length; c++) {
                    const ref = XLSX.utils.encode_cell({ r: currentRow, c });
                    if (!wsMaster[ref]) wsMaster[ref] = { v: "", t: "s" };
                    wsMaster[ref].s = c === 0 ? TD_CODE_STYLE : TD_STYLE;
                }
                currentRow++;
            }

            // Skip blank separator
            currentRow++;
        }

        // Column widths for master sheet
        const masterColWidths: { wch: number }[] = [];
        for (let c = 0; c < maxCols; c++) {
            let maxLen = 10;
            for (const table of masterData) {
                if (c < table.headers.length) maxLen = Math.max(maxLen, table.headers[c].length + 2);
                for (const row of table.rows) {
                    if (c < row.length) maxLen = Math.max(maxLen, (row[c] || "").length + 2);
                }
            }
            masterColWidths.push({ wch: Math.min(maxLen, 60) });
        }
        wsMaster["!cols"] = masterColWidths;

        XLSX.utils.book_append_sheet(wb, wsMaster, "Master Data");
    }

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    await downloadFile({
        data: buf,
        filename: `${filenamePrefix || 'timesheet'}_template.xlsx`,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
}

/* ─────────────────── Parse uploaded file ─────────────────── */

export async function parseExcelFile(
    file: File,
    columns: ImportColumn[]
): Promise<ImportResult> {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];

    if (!ws) {
        return { data: [], errors: [{ row: 0, column: "", message: "Empty workbook." }], totalRows: 0 };
    }

    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: "" } as any);
    const headerMap = new Map<string, ImportColumn>();
    for (const col of columns) {
        headerMap.set(col.header.trim().toLowerCase(), col);
    }

    const data: ParsedRow[] = [];
    const errors: ImportValidationError[] = [];

    rawRows.forEach((raw, idx) => {
        const rowNum = idx + 2;
        const parsed: ParsedRow = { _rowNum: rowNum };

        for (const [rawHeader, value] of Object.entries(raw)) {
            const col = headerMap.get(rawHeader.trim().toLowerCase());
            if (col) {
                let finalValue: any = typeof value === "string" ? value.trim() : value;
                
                // Handle different types
                if (col.type === "number") {
                    finalValue = Number(finalValue);
                    if (isNaN(finalValue)) finalValue = 0;
                } else if (col.type === "date" && finalValue) {
                    // Try to parse date
                    try {
                        let dateObj: Date | null = null;

                        if (typeof value === "number") {
                            // Excel serial date number — convert manually
                            // Excel epoch is 1900-01-01, but has a leap year bug (day 60 = Feb 29, 1900 which doesn't exist)
                            const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Dec 30, 1899
                            dateObj = new Date(excelEpoch.getTime() + value * 86400000);
                        } else if (value instanceof Date) {
                            dateObj = value;
                        } else if (typeof value === "string") {
                            const trimmed = value.trim();
                            // Try DD/MM/YYYY format
                            const slashParts = trimmed.split("/");
                            if (slashParts.length === 3) {
                                const day = parseInt(slashParts[0]);
                                const month = parseInt(slashParts[1]) - 1;
                                let year = parseInt(slashParts[2]);
                                if (slashParts[2].length === 2) year = 2000 + year;
                                // If year > 2400, assume Buddhist Era and convert to CE
                                if (year > 2400) year -= 543;
                                dateObj = new Date(year, month, day);
                            } else if (trimmed.includes("-")) {
                                // Try YYYY-MM-DD
                                const dashParts = trimmed.split("-");
                                if (dashParts.length === 3) {
                                    let year = parseInt(dashParts[0]);
                                    if (year > 2400) year -= 543;
                                    dateObj = new Date(year, parseInt(dashParts[1]) - 1, parseInt(dashParts[2]));
                                }
                            } else {
                                dateObj = new Date(trimmed);
                            }
                        }
                        
                        if (dateObj && !isNaN(dateObj.getTime())) {
                            // Ensure year is CE (not Buddhist Era)
                            let y = dateObj.getFullYear();
                            if (y > 2400) y -= 543;
                            const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                            const d = String(dateObj.getDate()).padStart(2, '0');
                            finalValue = `${y}-${m}-${d}`;
                        }
                    } catch {
                        // Keep original if parsing fails
                    }
                }
                
                parsed[col.key] = finalValue;
            }
        }

        for (const col of columns) {
            if (col.required && !parsed[col.key]) {
                errors.push({
                    row: rowNum,
                    column: col.header,
                    message: `Row ${rowNum}: "${col.header}" is required.`,
                });
            }
        }
        data.push(parsed);
    });

    return { data, errors, totalRows: rawRows.length };
}
