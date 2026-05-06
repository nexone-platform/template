export const dateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
};

export const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export interface ColumnDef {
    key: string;
    label?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    format?: (val: any) => string | number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exportToCSV = (data: any[], filenamePrefix: string, columns: ColumnDef[], allowEmpty = false) => {
    if (!data || (!data.length && !allowEmpty)) {
        alert('ไม่มีข้อมูลสำหรับ export');
        return;
    }
    const header = columns.map(c => `"${c.label}"`).join(',');
    const rows = data.map(item => {
        return columns.map(c => {
            // Support passing the whole item to format if it expects it
            let val = c.format ? c.format(item) : item[c.key];
            if (val === undefined || val === null) val = '';
            if (typeof val === 'string') {
                val = `"${val.replace(/"/g, '""')}"`; // Escape quotes
            }
            return val;
        }).join(',');
    });

    const blob = new Blob(['\uFEFF' + header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
    triggerDownload(blob, `${filenamePrefix}_${dateStr()}.csv`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exportToXLSX = async (data: any[], filenamePrefix: string, columns: ColumnDef[], allowEmpty = false) => {
    if (!data || (!data.length && !allowEmpty)) {
        alert('ไม่มีข้อมูลสำหรับ export');
        return;
    }
    const XLSX = await import('xlsx-js-style');

    const wsData = [
        columns.map(c => c.label),
        ...data.map(item => columns.map(c => {
            const val = c.format ? c.format(item) : item[c.key];
            return val;
        }))
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-size columns based on content
    ws['!cols'] = columns.map((c, colIdx) => {
        const headerLen = (c.label || '').length;
        let maxLen = headerLen;
        data.forEach(item => {
            const val = c.format ? c.format(item) : item[c.key];
            const strLen = val !== undefined && val !== null ? String(val).length : 0;
            if (strLen > maxLen) maxLen = strLen;
        });
        return { wch: Math.max(maxLen + 4, 10) }; // +4 padding, min 10
    });

    // Style header row with light gray background
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
        if (ws[cellAddr]) {
            ws[cellAddr].s = {
                fill: { fgColor: { rgb: 'E2E8F0' } },
                font: { bold: true, sz: 11 },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: 'CBD5E1' } },
                    bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
                    left: { style: 'thin', color: { rgb: 'CBD5E1' } },
                    right: { style: 'thin', color: { rgb: 'CBD5E1' } }
                }
            };
        }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerDownload(blob, `${filenamePrefix}_${dateStr()}.xlsx`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exportToPDF = async (data: any[], filenamePrefix: string, columns: ColumnDef[], title: string = 'Report', orientation: 'portrait' | 'landscape' = 'landscape') => {
    if (!data || !data.length) {
        alert('ไม่มีข้อมูลสำหรับ export');
        return;
    }
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const { SarabunRegular } = await import('./sarabunFont');

    const doc = new jsPDF({ orientation });

    // Register Thai font
    doc.addFileToVFS('Sarabun-Regular.ttf', SarabunRegular);
    doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
    doc.setFont('Sarabun');

    const pageWidth = doc.internal.pageSize.getWidth();

    const lang = typeof window !== 'undefined' ? localStorage.getItem('nexone_lang')?.toLowerCase() || 'th' : 'th';
    const datePrefix = lang === 'en' ? 'Created Date :' : 'วันที่สร้างรายงาน :';
    const pagePrefix = lang === 'en' ? 'Page' : 'หน้า';

    // Fetch dateTimeFormat from system config
    let dateTimeFormat = 'dd/MM/yyyy HH:mm:ss';
    try {
        const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
            ? `http://${window.location.hostname}:8101/api/system-configs/key/DATETIME_FORMAT` 
            : `http://localhost:8101/api/system-configs/key/DATETIME_FORMAT`;
        const res = await fetch(API_URL, { credentials: 'include' });
        if (res.ok) {
            const json = await res.json();
            const val = typeof json === 'string' ? json : (json?.systemValue || json?.configValue || json?.config_value || json?.system_value || json?.value || null);
            if (val) dateTimeFormat = val;
        }
    } catch (e) {
        // ignore
    }
    const { format } = await import('date-fns');
    const formattedDate = format(new Date(), dateTimeFormat);

    const head = [columns.map(c => c.label || '')];
    const body = data.map(item => columns.map(c => {
        const val = c.format ? c.format(item) : item[c.key];
        return val !== undefined && val !== null ? String(val) : '';
    }));

    const totalPagesExp = '{total_pages_count_string}';

    autoTable(doc, {
        startY: 30,
        margin: { top: 30 },
        head: head,
        body: body,
        theme: 'grid',
        styles: { fontSize: 10, font: 'Sarabun' },
        headStyles: { fillColor: [59, 130, 246], font: 'Sarabun', fontStyle: 'normal', lineColor: [200, 200, 200], lineWidth: 0.1 },
        didDrawPage: (data) => {
            // Draw Header
            doc.setFontSize(16);
            doc.text(title, pageWidth / 2, 15, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`${datePrefix} ${formattedDate}`, pageWidth - 14, 22, { align: 'right' });

            // Draw gray separator line
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.line(14, 26, pageWidth - 14, 26);

            // Draw Footer
            const str = `${pagePrefix} ${data.pageNumber} / ${totalPagesExp}`;
            doc.setFontSize(10);
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.text(str, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
    });

    if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
    }

    const blob = doc.output('blob');
    triggerDownload(blob, `${filenamePrefix}_${dateStr()}.pdf`);
};
