/**
 * Reusable table export utility.
 * Centralises XLSX / CSV / PDF generation so every page
 * only needs to pass data + column definitions.
 */

import { downloadFile } from "@/lib/download-file";
import { format } from "date-fns";
import * as XLSX from "xlsx-js-style";

/* ───────────────────────── Types ───────────────────────── */

export interface ExportColumn {
    /** Header label shown in the exported file */
    header: string;
    /** Accessor key (dot path not supported — flat keys only) */
    key: string;
    /**
     * Optional formatter.
     * Receives the raw cell value + full row and returns the display string.
     */
    format?: (value: any, row: any) => string;
}

/* ───────────────────────── Helpers ─────────────────────── */

function timestamp() {
    return format(new Date(), "yyyyMMdd_HHmmss");
}

/**
 * Map raw data rows into a 2-D array of display values
 * (first element is the header row).
 */
function toMatrix(data: any[], columns: ExportColumn[]): string[][] {
    const header = columns.map((c) => c.header);
    const body = data.map((row) =>
        columns.map((col) => {
            const raw = row?.[col.key];
            if (col.format) return col.format(raw, row);
            if (raw === null || raw === undefined) return "";
            return String(raw);
        })
    );
    return [header, ...body];
}

/* ──────────────────────── XLSX ─────────────────────────── */

/** Header cell style — bold white text on indigo background */
const HEADER_STYLE = {
    font: { bold: true, color: { rgb: "FFFFFF" }, name: "Sarabun", sz: 11 },
    fill: { fgColor: { rgb: "6366F1" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
        top:    { style: "thin", color: { rgb: "4F46E5" } },
        bottom: { style: "thin", color: { rgb: "4F46E5" } },
        left:   { style: "thin", color: { rgb: "4F46E5" } },
        right:  { style: "thin", color: { rgb: "4F46E5" } },
    },
};

export async function exportXLSX(
    data: any[],
    columns: ExportColumn[],
    filenamePrefix: string
) {
    const matrix = toMatrix(data, columns);
    const ws = XLSX.utils.aoa_to_sheet(matrix);

    // ── Apply header styling (row 0) ──
    columns.forEach((_, ci) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: ci });
        if (ws[cellRef]) {
            ws[cellRef].s = HEADER_STYLE;
        }
    });

    // ── Auto-width ──
    ws["!cols"] = columns.map((_, ci) => ({
        wch: Math.max(
            ...matrix.map((r) => (r[ci] ? r[ci].length : 10)),
            14
        ),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    await downloadFile({
        data: buf,
        filename: `${filenamePrefix}_${timestamp()}.xlsx`,
        mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
}

/* ──────────────────────── CSV ──────────────────────────── */

export async function exportCSV(
    data: any[],
    columns: ExportColumn[],
    filenamePrefix: string
) {
    const matrix = toMatrix(data, columns);
    const csv = matrix
        .map((row) =>
            row
                .map((cell) => {
                    const escaped = cell.replace(/"/g, '""');
                    return `"${escaped}"`;
                })
                .join(",")
        )
        .join("\n");

    // Add BOM for Excel UTF-8 compatibility (Thai text)
    const bom = "\uFEFF";
    await downloadFile({
        data: bom + csv,
        filename: `${filenamePrefix}_${timestamp()}.csv`,
        mimeType: "text/csv;charset=utf-8",
    });
}

/* ──────────────────────── PDF ──────────────────────────── */

/**
 * Sarabun font cache — fetched once from Google Fonts CDN, then reused.
 * We need a TTF font that supports Thai glyphs because jsPDF's built-in
 * fonts (Helvetica, Courier, Times) only support Latin-1.
 */
let _sarabunRegularCache: string | null = null;
let _sarabunBoldCache: string | null = null;

const FONT_URLS = {
    regular: "https://fonts.gstatic.com/s/sarabun/v17/DtVjJx26TKEr37c9WBI.ttf",
    bold: "https://fonts.gstatic.com/s/sarabun/v17/DtVmJx26TKEr37c9YK5sik8s7g.ttf",
};

async function fetchFontBase64(url: string): Promise<string> {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to fetch font: ${resp.status}`);
    const buf = await resp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Register Sarabun (Regular + Bold) with a jsPDF document instance.
 * After this call the doc's default font is Sarabun.
 */
async function registerThaiFont(doc: any): Promise<void> {
    try {
        // Fetch both weights in parallel
        const [regular, bold] = await Promise.all([
            _sarabunRegularCache
                ? Promise.resolve(_sarabunRegularCache)
                : fetchFontBase64(FONT_URLS.regular).then((b) => { _sarabunRegularCache = b; return b; }),
            _sarabunBoldCache
                ? Promise.resolve(_sarabunBoldCache)
                : fetchFontBase64(FONT_URLS.bold).then((b) => { _sarabunBoldCache = b; return b; }),
        ]);

        doc.addFileToVFS("Sarabun-Regular.ttf", regular);
        doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");

        doc.addFileToVFS("Sarabun-Bold.ttf", bold);
        doc.addFont("Sarabun-Bold.ttf", "Sarabun", "bold");

        doc.setFont("Sarabun");
    } catch (err) {
        // If font fetch fails, fall back to default (Thai will be garbled but won't crash)
        console.warn("Could not load Thai font for PDF export, falling back to default:", err);
    }
}

export async function exportPDF(
    data: any[],
    columns: ExportColumn[],
    filenamePrefix: string,
    title?: string
) {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Register Thai-compatible font
    await registerThaiFont(doc);

    if (title) {
        doc.setFontSize(16);
        doc.text(title, 14, 15);
    }

    const head = [columns.map((c) => c.header)];
    const body = data.map((row) =>
        columns.map((col) => {
            const raw = row?.[col.key];
            if (col.format) return col.format(raw, row);
            if (raw === null || raw === undefined) return "";
            return String(raw);
        })
    );

    autoTable(doc, {
        startY: title ? 22 : 14,
        head,
        body,
        styles: { fontSize: 9, cellPadding: 2, font: "Sarabun", fontStyle: "normal" },
        headStyles: { fillColor: [99, 102, 241], font: "Sarabun", fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    const buf = doc.output("arraybuffer");
    await downloadFile({
        data: buf,
        filename: `${filenamePrefix}_${timestamp()}.pdf`,
        mimeType: "application/pdf",
    });
}
