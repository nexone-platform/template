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
export const exportToCSV = (data: any[], filenamePrefix: string, columns: ColumnDef[]) => {
    if (!data || !data.length) {
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
export const exportToXLSX = async (data: any[], filenamePrefix: string, columns: ColumnDef[]) => {
    if (!data || !data.length) {
        alert('ไม่มีข้อมูลสำหรับ export');
        return;
    }
    const XLSX = await import('xlsx');

    const wsData = [
        columns.map(c => c.label),
        ...data.map(item => columns.map(c => {
            const val = c.format ? c.format(item) : item[c.key];
            return val;
        }))
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = columns.map(() => ({ wch: 18 })); // default width
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    triggerDownload(blob, `${filenamePrefix}_${dateStr()}.xlsx`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exportToPDF = async (data: any[], filenamePrefix: string, columns: ColumnDef[], title: string = 'Report') => {
    if (!data || !data.length) {
        alert('ไม่มีข้อมูลสำหรับ export');
        return;
    }
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('th-TH')} ${new Date().toLocaleTimeString('th-TH')}`, 14, 22);

    const head = [columns.map(c => c.label || '')];
    const body = data.map(item => columns.map(c => {
        const val = c.format ? c.format(item) : item[c.key];
        return val !== undefined && val !== null ? String(val) : '';
    }));

    autoTable(doc, {
        startY: 30,
        head: head,
        body: body,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
    });

    const blob = doc.output('blob');
    triggerDownload(blob, `${filenamePrefix}_${dateStr()}.pdf`);
};
