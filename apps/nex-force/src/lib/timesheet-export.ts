/**
 * Timesheet export — Monthly Time Sheet + Daily Work Log (ใบบันทึกการทำงาน)
 * Combined into a single workbook (Excel) or multi-page document (PDF).
 */

import { downloadFile } from "@/lib/download-file";
import { format } from "date-fns";
import * as XLSX from "xlsx-js-style";
import type { TimesheetRespond } from "@/types/timesheet";

/* ═══════════════════════════════════════════════════════════ */
/*  Types                                                      */
/* ═══════════════════════════════════════════════════════════ */

export interface CalendarData {
    holidays: { date: number; title: string }[];
    specialDays: { date: number; title: string }[];
    leaveDays: { date: number; reason: string; leaveType: string }[];
    daysInMonth: number;
}

/* ═══════════════════════════════════════════════════════════ */
/*  Helpers                                                    */
/* ═══════════════════════════════════════════════════════════ */

function ts() { return format(new Date(), "yyyyMMdd_HHmmss"); }
function numDaysInMonth(y: number, m: number) { return new Date(y, m, 0).getDate(); }

/** Check if a day is a weekend (0=Sun, 6=Sat) */
function isWeekend(y: number, m: number, d: number): boolean {
    const dow = new Date(y, m - 1, d).getDay();
    return dow === 0 || dow === 6;
}

/** Build a set of working days for a month: weekdays + special days - holidays */
function buildWorkingDays(y: number, m: number, cal: CalendarData | null): Set<number> {
    const numDays = cal?.daysInMonth || numDaysInMonth(y, m);
    const holidaySet = new Set((cal?.holidays || []).map(h => h.date));
    const specialSet = new Set((cal?.specialDays || []).map(s => s.date));
    const workDays = new Set<number>();

    for (let d = 1; d <= numDays; d++) {
        const weekend = isWeekend(y, m, d);
        if (weekend && specialSet.has(d)) {
            // Weekend but special working day → working
            workDays.add(d);
        } else if (!weekend && !holidaySet.has(d)) {
            // Weekday and not a holiday → working
            workDays.add(d);
        }
    }
    return workDays;
}

/* ─── Common cell styles ─── */
const T = { style: "thin", color: { rgb: "000000" } } as const;
const B = { top: T, bottom: T, left: T, right: T } as const;

const S = {
    // Title: large bold centered
    title: (sz = 14) => ({
        font: { bold: true, sz, name: "Sarabun" },
        alignment: { horizontal: "center" as const, vertical: "center" as const },
    }),
    // Section header: bold with colored bg + border
    secHead: {
        font: { bold: true, sz: 11, name: "Sarabun", color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "left" as const, vertical: "center" as const },
        border: B,
    },
    // Info label: bold left
    infoLabel: {
        font: { bold: true, sz: 10, name: "Sarabun" },
        alignment: { horizontal: "left" as const, vertical: "center" as const },
        border: B,
    },
    // Info value: normal left
    infoVal: {
        font: { sz: 10, name: "Sarabun" },
        alignment: { horizontal: "left" as const, vertical: "center" as const },
        border: B,
    },
    // Calendar header: green bg, bold white, centered
    calHead: {
        font: { bold: true, sz: 9, name: "Sarabun", color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "548235" } },
        alignment: { horizontal: "center" as const, vertical: "center" as const },
        border: B,
    },
    // Calendar cell: centered with border
    calCell: {
        font: { sz: 9, name: "Sarabun" },
        alignment: { horizontal: "center" as const, vertical: "center" as const },
        border: B,
    },
    // Calendar row label: bold left with border
    calLabel: {
        font: { bold: true, sz: 9, name: "Sarabun" },
        alignment: { horizontal: "left" as const, vertical: "center" as const },
        border: B,
    },
    // Summary label
    summary: {
        font: { bold: true, sz: 10, name: "Sarabun" },
        alignment: { horizontal: "left" as const, vertical: "center" as const },
    },
    // Note text
    note: {
        font: { bold: true, sz: 9, name: "Sarabun", color: { rgb: "FF0000" } },
        alignment: { horizontal: "left" as const, vertical: "center" as const },
        fill: { fgColor: { rgb: "FFFF00" } },
        border: B,
    },
    // Diary title
    diaryTitle: {
        font: { bold: true, sz: 18, name: "Sarabun" },
        alignment: { horizontal: "left" as const, vertical: "center" as const },
    },
    // Diary table header: bold underline
    diaryHead: {
        font: { bold: true, sz: 10, name: "Sarabun", underline: true },
        alignment: { horizontal: "center" as const, vertical: "center" as const },
        border: B,
    },
    // Diary cell
    diaryCell: {
        font: { sz: 10, name: "Sarabun" },
        alignment: { horizontal: "left" as const, vertical: "center" as const, wrapText: true },
        border: B,
    },
    // Diary cell centered
    diaryCellCenter: {
        font: { sz: 10, name: "Sarabun" },
        alignment: { horizontal: "center" as const, vertical: "center" as const },
        border: B,
    },
    // Diary label bold
    diaryLabelBold: {
        font: { bold: true, sz: 10, name: "Sarabun" },
        alignment: { horizontal: "left" as const, vertical: "center" as const },
        border: B,
    },
    // Diary header info
    diaryInfo: {
        font: { bold: true, sz: 10, name: "Sarabun", underline: true },
        alignment: { horizontal: "left" as const, vertical: "center" as const },
    },
    diaryInfoVal: {
        font: { sz: 10, name: "Sarabun", underline: true },
        alignment: { horizontal: "left" as const, vertical: "center" as const },
    },
};

/* ─── Utility: Apply style to cell (create if missing) ─── */
function setCell(ws: XLSX.WorkSheet, r: number, c: number, val: any, style: any) {
    const ref = XLSX.utils.encode_cell({ r, c });
    if (!ws[ref]) ws[ref] = { v: val ?? "", t: typeof val === "number" ? "n" : "s" };
    ws[ref].s = style;
    if (val !== undefined && val !== null) ws[ref].v = val;
}

/* ═══════════════════════════════════════════════════════════ */
/*  Build Monthly Time Sheet                                   */
/* ═══════════════════════════════════════════════════════════ */

function buildMonthlySheet(
    wb: XLSX.WorkBook,
    items: TimesheetRespond[],
    year: number,
    month: number,
    companyName: string,
    cal: CalendarData | null = null
) {
    const first = items[0];
    const clientName = first.clientName || first.organizationName || "N/A";
    const projectName = first.projectName || "N/A";
    const projectCode = first.projectCode || "";
    const inchargeName = first.inchargeName || "";
    const leaderName = first.projectLeaderName || "";
    const employeeName = first.employeeName || "";
    const employeeCode = first.employeeCode || "";
    const numDays = cal?.daysInMonth || numDaysInMonth(year, month);
    const monthLabel = format(new Date(year, month - 1, 1), "MMM-yy");
    const workingDays = buildWorkingDays(year, month, cal);
    const holidaySet = new Set((cal?.holidays || []).map(h => h.date));
    const leaveMap = new Map<number, string>();
    (cal?.leaveDays || []).forEach(l => {
        // Map leaveType to letter: Annual→L, Sick→S, Private→P
        const t = (l.leaveType || "").toLowerCase();
        let letter = "L";
        if (t.includes("sick")) letter = "S";
        else if (t.includes("private") || t.includes("personal")) letter = "P";
        leaveMap.set(l.date, letter);
    });

    // Build per-day maps
    const workMap: Record<number, number> = {};
    const otMap: Record<number, number> = {};
    const jobMap: Record<number, string> = {};

    items.forEach(item => {
        if (!item.workDate) return;
        const d = new Date(item.workDate);
        if (d.getFullYear() !== year || d.getMonth() + 1 !== month) return;
        const day = d.getDate();
        workMap[day] = (workMap[day] || 0) + (item.totalWorkHours || 0);
        otMap[day] = (otMap[day] || 0) + (item.totalOtHours || 0);
        if (item.jobType) jobMap[day] = item.jobType;
    });

    // Total columns = 1 (label) + numDays
    const totalCols = 1 + numDays;
    const rows: any[][] = [];

    // ── Row 0: Client/Company name ──
    const r0: any[] = new Array(totalCols).fill("");
    r0[0] = clientName;
    rows.push(r0);

    // ── Row 1: Monthly Time Sheet ──
    const r1: any[] = new Array(totalCols).fill("");
    r1[0] = "Monthly Time Sheet";
    rows.push(r1);

    // ── Row 2: As of ──
    const r2: any[] = new Array(totalCols).fill("");
    r2[0] = `As of  ${monthLabel}`;
    rows.push(r2);

    // ── Row 3: Empty ──
    rows.push(new Array(totalCols).fill(""));

    // ── Row 4: Section headers ──
    // Client Info occupies cols 0-4, Consultant Info occupies cols 5-9
    const cInfoEnd = Math.min(4, totalCols - 1);
    const consStart = 5;
    const consEnd = Math.min(9, totalCols - 1);

    const rSec: any[] = new Array(totalCols).fill("");
    rSec[0] = "Client Information";
    if (consStart < totalCols) rSec[consStart] = "Consultant Information";
    rows.push(rSec);

    // ── Rows 5-9: Info pairs ──
    const infoPairs = [
        ["Client Site", clientName, "Company Name", companyName],
        ["Organization Code", first.organizationCode || "N/A", "Employee Code", employeeCode],
        ["Project Code", projectCode, "Employee Name", employeeName],
        ["Project Name", projectName, "Job Responsibility", first.jobType || "Developer"],
        ["Incharge Name", inchargeName, "Project Leader", leaderName],
    ];

    for (const [lbl1, val1, lbl2, val2] of infoPairs) {
        const r: any[] = new Array(totalCols).fill("");
        r[0] = lbl1;
        r[1] = val1;
        if (consStart < totalCols) r[consStart] = lbl2;
        if (consStart + 1 < totalCols) r[consStart + 1] = val2;
        rows.push(r);
    }

    // ── Row 10: Empty ──
    rows.push(new Array(totalCols).fill(""));

    // ── Row 11: Date header ──
    const dayRow: any[] = ["Date"];
    for (let d = 1; d <= numDays; d++) dayRow.push(d);
    rows.push(dayRow);

    // ── Row 12: Work Hrs — default 8 for all working days, override with actual data ──
    const workRow: any[] = ["Work Hrs."];
    for (let d = 1; d <= numDays; d++) {
        if (workMap[d]) {
            workRow.push(workMap[d]);
        } else if (workingDays.has(d) && !leaveMap.has(d)) {
            // Working day with no timesheet → default 8
            workRow.push(8);
        } else {
            workRow.push("");
        }
    }
    rows.push(workRow);

    // ── Row 13: OT Hrs ──
    const otRow: any[] = ["OT Hrs."];
    for (let d = 1; d <= numDays; d++) otRow.push(otMap[d] || "");
    rows.push(otRow);

    // ── Rows 14-20: Leave types — use calendar data ──
    const leaveTypes: [string, (day: number) => string][] = [
        ["H-Holiday", (d) => holidaySet.has(d) ? "H" : ""],
        ["L-Annual Leave", (d) => leaveMap.get(d) === "L" ? "L" : ""],
        ["S-Sick Leave", (d) => leaveMap.get(d) === "S" ? "S" : ""],
        ["P-Private Leave", (d) => leaveMap.get(d) === "P" ? "P" : ""],
        ["C-Client Comp. Off", () => ""],
        ["W-Work From Home", (d) => jobMap[d] === "WFH" ? "W" : ""],
    ];

    for (const [label, fn] of leaveTypes) {
        const lr: any[] = [label];
        for (let d = 1; d <= numDays; d++) lr.push(fn(d));
        rows.push(lr);
    }

    // ── Row 21: Blank ──
    rows.push(new Array(totalCols).fill(""));

    // ── Row 22: Note ──
    const noteRow: any[] = new Array(totalCols).fill("");
    noteRow[0] = "Pls. Corresponding Alphabets for Other Columns (L - Annual Leave, S - Sick Leave, P - Private Leave, C - Company Off, H - Holiday, W - Work From Home)";
    rows.push(noteRow);

    // ── Row 23: Blank ──
    rows.push(new Array(totalCols).fill(""));

    // ── Row 24: Summary ──
    // Count working days (with actual data + default working days)
    const totalDays = workingDays.size;
    const totalOt = Object.values(otMap).reduce((a, b) => a + b, 0);
    const convDays = totalOt > 0 ? Number((totalOt / 8).toFixed(4)) : 0;

    const sumRow: any[] = new Array(totalCols).fill("");
    sumRow[0] = `Total No. of Days Worked :`;
    sumRow[1] = `${totalDays} Days`;
    sumRow[3] = `Total No. of OT Hrs/Days :`;
    sumRow[4] = `${totalOt} Hrs.`;
    sumRow[6] = `Convert Hrs to :`;
    sumRow[7] = `${convDays} Days`;
    rows.push(sumRow);

    // ── Rows 25-30: Signature ──
    rows.push(new Array(totalCols).fill(""));
    const certRow: any[] = new Array(totalCols).fill("");
    certRow[0] = "I Certify that the above is a true record of my time for this period.";
    rows.push(certRow);
    rows.push(new Array(totalCols).fill(""));
    const sig1: any[] = new Array(totalCols).fill("");
    sig1[0] = "Employee Signature (Consultant)";
    sig1[4] = "Date";
    rows.push(sig1);
    rows.push(new Array(totalCols).fill(""));
    const sig2: any[] = new Array(totalCols).fill("");
    sig2[0] = "Project Leader Signature (Client)";
    sig2[4] = "Date";
    rows.push(sig2);

    // ═══ Create worksheet ═══
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // ── Merges ──
    const merges: XLSX.Range[] = [
        // Title merges (rows 0-2 across all cols)
        { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
        // Client Info header merge
        { s: { r: 4, c: 0 }, e: { r: 4, c: cInfoEnd } },
        // Consultant Info header merge
        { s: { r: 4, c: consStart }, e: { r: 4, c: consEnd } },
        // Info value merges (cols 1-4 for client, cols 6-9 for consultant)
        ...infoPairs.map((_, i) => ({ s: { r: 5 + i, c: 1 }, e: { r: 5 + i, c: cInfoEnd } })),
        ...infoPairs.filter((_, i) => i < 4).map((_, i) => ({
            s: { r: 5 + i, c: consStart + 1 }, e: { r: 5 + i, c: consEnd }
        })),
        // Note row merge
        { s: { r: rows.length - 9, c: 0 }, e: { r: rows.length - 9, c: totalCols - 1 } },
        // Summary merges
        { s: { r: rows.length - 7, c: 1 }, e: { r: rows.length - 7, c: 2 } },
        { s: { r: rows.length - 7, c: 4 }, e: { r: rows.length - 7, c: 5 } },
        { s: { r: rows.length - 7, c: 7 }, e: { r: rows.length - 7, c: 8 } },
        // Cert row merge
        { s: { r: rows.length - 5, c: 0 }, e: { r: rows.length - 5, c: 8 } },
    ];
    ws["!merges"] = merges;

    // ── Styles ──

    // Title rows 0-2
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < totalCols; c++) {
            setCell(ws, r, c, undefined, S.title(r === 0 ? 14 : r === 1 ? 13 : 11));
        }
    }

    // Section headers (row 4)
    for (let c = 0; c <= cInfoEnd; c++) setCell(ws, 4, c, undefined, S.secHead);
    for (let c = consStart; c <= consEnd; c++) setCell(ws, 4, c, undefined, S.secHead);

    // Info rows (5-9)
    for (let r = 5; r <= 9; r++) {
        setCell(ws, r, 0, undefined, S.infoLabel);
        for (let c = 1; c <= cInfoEnd; c++) setCell(ws, r, c, undefined, S.infoVal);
        if (consStart < totalCols) setCell(ws, r, consStart, undefined, S.infoLabel);
        for (let c = consStart + 1; c <= consEnd; c++) setCell(ws, r, c, undefined, S.infoVal);
    }

    // Calendar: row 11 = date header (green)
    const calStartRow = 11;
    for (let c = 0; c < totalCols; c++) {
        setCell(ws, calStartRow, c, undefined, S.calHead);
    }

    // Calendar data rows (12 to 12 + 7 = Work, OT, H, L, S, P, C, W)
    for (let r = calStartRow + 1; r <= calStartRow + 8; r++) {
        setCell(ws, r, 0, undefined, S.calLabel);
        for (let c = 1; c < totalCols; c++) {
            setCell(ws, r, c, undefined, S.calCell);
        }
    }

    // Note row (yellow/red)
    const noteIdx = rows.length - 9;
    for (let c = 0; c < totalCols; c++) {
        setCell(ws, noteIdx, c, undefined, S.note);
    }

    // Summary
    const sumIdx = rows.length - 7;
    setCell(ws, sumIdx, 0, undefined, S.summary);
    setCell(ws, sumIdx, 3, undefined, S.summary);
    setCell(ws, sumIdx, 6, undefined, S.summary);

    // ── Column widths ──
    ws["!cols"] = [
        { wch: 20 }, // Label column
        ...Array.from({ length: numDays }, () => ({ wch: 4.5 }))
    ];

    // ── Row heights ──
    ws["!rows"] = [];
    ws["!rows"][0] = { hpt: 22 };
    ws["!rows"][1] = { hpt: 20 };
    ws["!rows"][4] = { hpt: 18 };
    for (let r = calStartRow; r <= calStartRow + 8; r++) {
        ws["!rows"][r] = { hpt: 18 };
    }

    const projectPrefix = projectCode || projectName || "TS";
    const sheetName = `Summary_${projectPrefix}`.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
}


/* ═══════════════════════════════════════════════════════════ */
/*  Build Daily Work Log (ใบบันทึกการทำงาน)                     */
/* ═══════════════════════════════════════════════════════════ */

function buildDiarySheets(
    wb: XLSX.WorkBook,
    items: TimesheetRespond[],
    year: number,
    month: number,
    companyName: string,
    cal: CalendarData | null = null
) {
    const holidaySet = new Set((cal?.holidays || []).map(h => h.date));
    const specialSet = new Set((cal?.specialDays || []).map(s => s.date));
    const first = items[0];
    const projectName = first.projectName || "N/A";
    const projectCode = first.projectCode || "";
    const inchargeName = first.inchargeName || "";
    const employeeName = first.employeeName || "";

    // Create all days of the month
    const numDays = numDaysInMonth(year, month);
    const allDays: number[] = [];
    for (let d = 1; d <= numDays; d++) allDays.push(d);

    // Group into weeks (starting from day 1, new week if it's a Monday or every 7 days?
    // Let's use a simple grouping: Every 7 days or until Sunday
    const weekBatches: number[][] = [];
    let currentWeek: number[] = [];
    for (let d = 1; d <= numDays; d++) {
        currentWeek.push(d);
        const dateObj = new Date(year, month - 1, d);
        if (dateObj.getDay() === 0) { // Sunday ends the week
            weekBatches.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) weekBatches.push(currentWeek);

    // Map existing items by day
    const itemMap = new Map<number, TimesheetRespond[]>();
    items.forEach(i => {
        if (!i.workDate) return;
        const d = new Date(i.workDate);
        if (d.getFullYear() === year && d.getMonth() + 1 === month) {
            const date = d.getDate();
            if (!itemMap.has(date)) itemMap.set(date, []);
            itemMap.get(date)!.push(i);
        }
    });

    // Column count = 9: วันที่ | เวลาเข้า | เวลาออก | ประเภทงาน | รายละเอียดงาน(3 cols) | ผู้พัฒนา | ผู้ตรวจสอบ
    const COLS = 9;
    let weekNum = 0;

    for (const weekDays of weekBatches) {
        // Only skip the week if it contains 0 total working days (Mon-Fri + Special)
        const weekHasWorkingDays = weekDays.some(day => {
            const dateObj = new Date(year, month - 1, day);
            const dow = dateObj.getDay();
            return (dow !== 0 && dow !== 6) || specialSet.has(day);
        });
        if (!weekHasWorkingDays) continue;

        weekNum++;
        const startDay = weekDays[0];
        const endDay = weekDays[weekDays.length - 1];
        const startLabel = format(new Date(year, month - 1, startDay), "d-MMM-yyyy");
        const endLabel = format(new Date(year, month - 1, endDay), "d-MMM-yyyy");

        const rows: any[][] = [];

        // ── Row 0: Header line 1 ──
        rows.push([
            "ใบบันทึกการทำงาน", "", "",
            "บริษัทต้นสังกัด", companyName,
            "ชื่อโครงการ", projectName,
            "ผู้รับผิดชอบ", inchargeName
        ]);

        // ── Row 1: Header line 2 ──
        rows.push([
            "", "", "",
            "ชื่อพนักงาน", employeeName,
            "ประจำวันที่", startLabel,
            "ถึงวันที่", endLabel
        ]);

        // ── Row 2: Blank ──
        rows.push(new Array(COLS).fill(""));

        // ── Row 3: Table column headers ──
        rows.push([
            "วันที่", "เวลาเข้างาน", "เวลาเลิกงาน", "ประเภทงาน",
            "รายละเอียดงาน", "", "",
            "ผู้พัฒนา", "ผู้ตรวจสอบ"
        ]);

        // ── Data rows ──
        let totalItemsInWeek = 0;
        let displayedDaysInWeek = 0;
        
        for (const day of weekDays) {
            const dateObj = new Date(year, month - 1, day);
            const dow = dateObj.getDay(); // 0=Sun, 6=Sat
            const isWeekend = (dow === 0 || dow === 6);
            const isSpecialWork = specialSet.has(day);
            const isHoliday = holidaySet.has(day);

            // Skip weekends unless it's a special work day
            if (isWeekend && !isSpecialWork) continue;

            displayedDaysInWeek++;
            const dayItems = itemMap.get(day) || [{} as TimesheetRespond];
            const dateStr = format(dateObj, "d-MMM-yyyy");

            for (const item of dayItems) {
                totalItemsInWeek++;
                const details = item.details || [];
                const st = details.length > 0 ? formatTime(details[0]?.startTime) : "";
                const et = details.length > 0 ? formatTime(details[0]?.endTime) : "";
                let desc = details.map(d => d.workName || d.workDescription || "").filter(Boolean).join(", ");
                
                if (isHoliday && !item.totalWorkHours) {
                    desc = `(HOLIDAY) ${cal?.holidays.find(h => h.date === day)?.title || ""}`;
                }

                const prob = details.map(d => d.problemDescription || "").filter(Boolean).join(", ");
                const resolve = details.map(d => d.problemResolve || "").filter(Boolean).join(", ");
                const nameParts = (employeeName || "").split(" ");
                const devName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : nameParts[0];

                // Main data + งานที่มอบหมาย
                rows.push([dateStr, st, et, "งานที่มอบหมาย", desc || "-", "", "", devName || "-", inchargeName || "-"]);
                // งานที่ทำจริง
                rows.push(["", "", "", "งานที่ทำจริง", desc || "-", "", "", "", ""]);
                // ปัญหาที่พบ
                rows.push(["", "", "", "ปัญหาที่พบ", prob || "-", "", "", "", ""]);
                // แนวทางแก้ไข
                rows.push(["", "", "", "แนวทางแก้ไข", resolve || "-", "", "", "", ""]);
                // ชดเชย/ล่วงเวลา separator
                rows.push(["ชดเชย/ล่วงเวลา", "", "", "", "", "", "", "", ""]);
            }
        }

        // ── Summary ──
        rows.push(new Array(COLS).fill(""));

        const sumStart = rows.length;
        rows.push(["รวมวันทำงานที่ต้องชดเชย ยกมา", "", "0 วัน", "", "", "ลงชื่อ", "", "", "ผู้อนุมัติ"]);
        rows.push(["รวมวันทำงานสำหรับสัปดาห์นี้", "", `${displayedDaysInWeek} วัน`, "", "", "", "", "", ""]);
        rows.push(["คงเหลือวันทำงานที่ต้องชดเชย", "", "0 วัน", "", "", `( ${inchargeName} )`, "", "", ""]);
        rows.push(["", "", "", "", "", "ผู้รับผิดชอบโครงการ", "", "", ""]);

        // ═══ Create worksheet ═══
        const ws = XLSX.utils.aoa_to_sheet(rows);

        // ── Merges ──
        const merges: XLSX.Range[] = [
            // Title "ใบบันทึกการทำงาน" merge
            { s: { r: 0, c: 0 }, e: { r: 1, c: 2 } },
            // Table header "รายละเอียดงาน" merge
            { s: { r: 3, c: 4 }, e: { r: 3, c: 6 } },
        ];

        // Per-entry merges: date spans 5 rows, start/end time spans 5 rows
        for (let i = 0; i < totalItemsInWeek; i++) {
            const baseRow = 4 + (i * 5);
            // Date cell merge (vertical across 4 data rows, not the separator)
            merges.push({ s: { r: baseRow, c: 0 }, e: { r: baseRow + 3, c: 0 } });
            // Start time merge
            merges.push({ s: { r: baseRow, c: 1 }, e: { r: baseRow + 3, c: 1 } });
            // End time merge
            merges.push({ s: { r: baseRow, c: 2 }, e: { r: baseRow + 3, c: 2 } });
            // Description merge (cols 4-6 for each sub-row)
            for (let sub = 0; sub < 4; sub++) {
                merges.push({ s: { r: baseRow + sub, c: 4 }, e: { r: baseRow + sub, c: 6 } });
            }
            // Separator merge
            merges.push({ s: { r: baseRow + 4, c: 0 }, e: { r: baseRow + 4, c: COLS - 1 } });
        }

        // Summary merges
        merges.push({ s: { r: sumStart, c: 0 }, e: { r: sumStart, c: 1 } });
        merges.push({ s: { r: sumStart + 1, c: 0 }, e: { r: sumStart + 1, c: 1 } });
        merges.push({ s: { r: sumStart + 2, c: 0 }, e: { r: sumStart + 2, c: 1 } });

        ws["!merges"] = merges;

        // ── Styles ──

        // Title
        setCell(ws, 0, 0, undefined, S.diaryTitle);
        // Header info labels
        for (const c of [3, 5, 7]) {
            setCell(ws, 0, c, undefined, S.diaryInfo);
            setCell(ws, 1, c, undefined, S.diaryInfo);
        }
        // Header info values
        for (const c of [4, 6, 8]) {
            setCell(ws, 0, c, undefined, S.diaryInfoVal);
            setCell(ws, 1, c, undefined, S.diaryInfoVal);
        }

        // Table headers (row 3)
        for (let c = 0; c < COLS; c++) {
            setCell(ws, 3, c, undefined, S.diaryHead);
        }

        // Data area + separators
        const dataEnd = 4 + (totalItemsInWeek * 5);
        for (let r = 4; r < dataEnd; r++) {
            const isSepar = (r - 4) % 5 === 4; // separator row
            for (let c = 0; c < COLS; c++) {
                if (isSepar) {
                    setCell(ws, r, c, undefined, {
                        font: { bold: true, sz: 9, name: "Sarabun", color: { rgb: "999999" } },
                        alignment: { horizontal: "left" as const },
                        border: B,
                    });
                } else {
                    const subIdx = (r - 4) % 5;
                    if (c === 0 || c === 1 || c === 2) {
                        // Date, start, end: center and only show in first sub-row
                        setCell(ws, r, c, undefined, S.diaryCellCenter);
                    } else if (c === 3) {
                        // ประเภทงาน: bold label
                        setCell(ws, r, c, undefined, S.diaryLabelBold);
                    } else if (c === 7 || c === 8) {
                        // Developer / auditor
                        setCell(ws, r, c, undefined, subIdx === 0 ? S.diaryCellCenter : S.diaryCell);
                    } else {
                        setCell(ws, r, c, undefined, S.diaryCell);
                    }
                }
            }
        }

        // Summary rows
        for (let r = sumStart; r < rows.length; r++) {
            for (let c = 0; c < COLS; c++) {
                setCell(ws, r, c, undefined, c < 3 ? S.summary : S.diaryCell);
            }
        }

        // ── Column widths ──
        ws["!cols"] = [
            { wch: 14 }, // วันที่
            { wch: 12 }, // เวลาเข้า
            { wch: 12 }, // เวลาออก
            { wch: 15 }, // ประเภทงาน
            { wch: 35 }, // รายละเอียดงาน
            { wch: 12 },
            { wch: 12 },
            { wch: 16 }, // ผู้พัฒนา
            { wch: 18 }, // ผู้ตรวจสอบ
        ];

        // ── Row heights ──
        ws["!rows"] = [];
        ws["!rows"][0] = { hpt: 24 };
        ws["!rows"][1] = { hpt: 20 };

        const projectPrefix = (projectCode || "WL").substring(0, 15);
        const sheetName = `Week(${weekNum})_${projectPrefix}`.substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
}

/** Format a TimeSpan or time string to HH:mm */
function formatTime(val: any): string {
    if (!val) return "";
    const s = String(val);
    // Already HH:mm:ss or HH:mm
    if (s.includes(":")) {
        const parts = s.split(":");
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    return s;
}


/* ═══════════════════════════════════════════════════════════ */
/*  Export Combined (Monthly + Daily) — Excel                  */
/* ═══════════════════════════════════════════════════════════ */

export async function exportTimesheetExcel(
    data: TimesheetRespond[],
    year: number,
    month: number,
    companyName: string = "Tech Biz Convergence Co., Ltd.",
    cal: CalendarData | null = null
) {
    if (!data.length) return;

    const wb = XLSX.utils.book_new();
    const monthLabel = format(new Date(year, month - 1, 1), "MMM-yy");

    // Group by project
    const byProject = new Map<number, TimesheetRespond[]>();
    data.forEach(d => {
        const pid = d.projectId || 0;
        if (!byProject.has(pid)) byProject.set(pid, []);
        byProject.get(pid)!.push(d);
    });

    // For each project: Monthly sheet first, then Diary sheets
    for (const [, items] of byProject) {
        buildMonthlySheet(wb, items, year, month, companyName, cal);
        buildDiarySheets(wb, items, year, month, companyName, cal);
    }

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    await downloadFile({
        data: buf,
        filename: `timesheet_${monthLabel}_${ts()}.xlsx`,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
}


/* ═══════════════════════════════════════════════════════════ */
/*  Export Combined (Monthly + Daily) — PDF                    */
/* ═══════════════════════════════════════════════════════════ */

const FONT_URLS = {
    regular: "https://fonts.gstatic.com/s/sarabun/v17/DtVjJx26TKEr37c9WBI.ttf",
    bold: "https://fonts.gstatic.com/s/sarabun/v17/DtVmJx26TKEr37c9YK5sik8s7g.ttf",
};
const _fontCache: Record<string, string> = {};

async function fetchFont(url: string): Promise<string> {
    if (_fontCache[url]) return _fontCache[url];
    const resp = await fetch(url);
    const buf = await resp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    _fontCache[url] = btoa(binary);
    return _fontCache[url];
}

async function registerFont(doc: any) {
    try {
        const [reg, bold] = await Promise.all([fetchFont(FONT_URLS.regular), fetchFont(FONT_URLS.bold)]);
        doc.addFileToVFS("Sarabun-Regular.ttf", reg);
        doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
        doc.addFileToVFS("Sarabun-Bold.ttf", bold);
        doc.addFont("Sarabun-Bold.ttf", "Sarabun", "bold");
        doc.setFont("Sarabun");
    } catch { /* fallback */ }
}

export async function exportTimesheetPDF(
    data: TimesheetRespond[],
    year: number,
    month: number,
    companyName: string = "Tech Biz Convergence Co., Ltd.",
    cal: CalendarData | null = null
) {
    if (!data.length) return;

    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    await registerFont(doc);

    const monthLabel = format(new Date(year, month - 1, 1), "MMM-yy");
    const numDays = cal?.daysInMonth || numDaysInMonth(year, month);
    const pw = doc.internal.pageSize.getWidth();
    const workingDays = buildWorkingDays(year, month, cal);
    const holidaySet = new Set((cal?.holidays || []).map(h => h.date));
    const leaveMap = new Map<number, string>();
    (cal?.leaveDays || []).forEach(l => {
        const t = (l.leaveType || "").toLowerCase();
        let letter = "L";
        if (t.includes("sick")) letter = "S";
        else if (t.includes("private") || t.includes("personal")) letter = "P";
        leaveMap.set(l.date, letter);
    });

    // Group by project
    const byProject = new Map<number, TimesheetRespond[]>();
    data.forEach(d => {
        const pid = d.projectId || 0;
        if (!byProject.has(pid)) byProject.set(pid, []);
        byProject.get(pid)!.push(d);
    });

    let firstPage = true;

    for (const [, items] of byProject) {
        const first = items[0];
        const clientName = first.clientName || first.organizationName || "N/A";
        const projectName = first.projectName || "N/A";
        const projectCode = first.projectCode || "";
        const inchargeName = first.inchargeName || "";
        const leaderName = first.projectLeaderName || "";
        const employeeName = first.employeeName || "";
        const employeeCode = first.employeeCode || "";

        // Build maps
        const workMap: Record<number, number> = {};
        const otMap: Record<number, number> = {};
        const jobMap: Record<number, string> = {};

        items.forEach(item => {
            if (!item.workDate) return;
            const d = new Date(item.workDate);
            if (d.getFullYear() !== year || d.getMonth() + 1 !== month) return;
            const day = d.getDate();
            workMap[day] = (workMap[day] || 0) + (item.totalWorkHours || 0);
            otMap[day] = (otMap[day] || 0) + (item.totalOtHours || 0);
            if (item.jobType) jobMap[day] = item.jobType;
        });

        /* ──── PAGE: Monthly Time Sheet ──── */
        if (!firstPage) doc.addPage("a4", "landscape");
        firstPage = false;

        // Title
        doc.setFontSize(14);
        doc.setFont("Sarabun", "bold");
        doc.text(clientName, pw / 2, 12, { align: "center" });
        doc.setFontSize(12);
        doc.text("Monthly Time Sheet", pw / 2, 18, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("Sarabun", "normal");
        doc.text(`As of  ${monthLabel}`, pw / 2, 23, { align: "center" });

        // Info section
        let y = 28;
        doc.setFontSize(8);

        // Client Info box
        doc.setFont("Sarabun", "bold");
        doc.setFillColor(68, 114, 196);
        doc.setTextColor(255, 255, 255);
        doc.rect(10, y, 90, 5, "F");
        doc.text("Client Information", 12, y + 3.5);
        doc.setFillColor(68, 114, 196);
        doc.rect(110, y, 90, 5, "F");
        doc.text("Consultant Information", 112, y + 3.5);
        doc.setTextColor(0, 0, 0);
        y += 6;

        const leftInfo = [
            ["Client Site", clientName],
            ["Project Code", projectCode],
            ["Project Name", projectName],
            ["Incharge Name", inchargeName],
            ["Project Leader", leaderName],
        ];
        const rightInfo = [
            ["Company Name", companyName],
            ["Employee Code", employeeCode],
            ["Employee Name", employeeName],
            ["Job Responsibility", first.jobType || "Developer"],
        ];

        for (let i = 0; i < leftInfo.length; i++) {
            doc.setFont("Sarabun", "bold");
            doc.text(leftInfo[i][0], 12, y + 3.5);
            doc.setFont("Sarabun", "normal");
            doc.text(leftInfo[i][1], 45, y + 3.5);
            if (i < rightInfo.length) {
                doc.setFont("Sarabun", "bold");
                doc.text(rightInfo[i][0], 112, y + 3.5);
                doc.setFont("Sarabun", "normal");
                doc.text(rightInfo[i][1], 155, y + 3.5);
            }
            y += 4.5;
        }

        y += 2;

        // Calendar table
        const dayHeaders = ["Date", ...Array.from({ length: numDays }, (_, i) => String(i + 1))];
        const calRows = [
            ["Work Hrs.", ...Array.from({ length: numDays }, (_, i) => {
                const d = i + 1;
                if (workMap[d]) return String(workMap[d]);
                if (workingDays.has(d) && !leaveMap.has(d)) return "8";
                return "";
            })],
            ["OT Hrs.", ...Array.from({ length: numDays }, (_, i) => otMap[i + 1] ? String(otMap[i + 1]) : "")],
            ["H-Holiday", ...Array.from({ length: numDays }, (_, i) => holidaySet.has(i + 1) ? "H" : "")],
            ["L-Annual Leave", ...Array.from({ length: numDays }, (_, i) => leaveMap.get(i + 1) === "L" ? "L" : "")],
            ["S-Sick Leave", ...Array.from({ length: numDays }, (_, i) => leaveMap.get(i + 1) === "S" ? "S" : "")],
            ["P-Private Leave", ...Array.from({ length: numDays }, (_, i) => leaveMap.get(i + 1) === "P" ? "P" : "")],
            ["C-Client Comp. Off", ...Array.from({ length: numDays }, () => "")],
            ["W-Work From Home", ...Array.from({ length: numDays }, (_, i) => jobMap[i + 1] === "WFH" ? "W" : "")],
        ];



        autoTable(doc, {
            startY: y,
            head: [dayHeaders],
            body: calRows,
            styles: { fontSize: 6, cellPadding: 1, halign: "center", font: "Sarabun", fontStyle: "normal", lineWidth: 0.2, lineColor: [0, 0, 0] },
            headStyles: { fillColor: [84, 130, 53], font: "Sarabun", fontStyle: "bold", textColor: [255, 255, 255] },
            columnStyles: { 0: { halign: "left", cellWidth: 22, fontStyle: "bold" } },
            tableWidth: "auto",
            margin: { left: 10 },
        });

        // Summary
        const finalY = (doc as any).lastAutoTable?.finalY || y + 50;
        let sy = finalY + 5;
        const totalDays = workingDays.size;
        const totalOt = Object.values(otMap).reduce((a, b) => a + b, 0);
        const convDays = totalOt > 0 ? Number((totalOt / 8).toFixed(4)) : 0;

        doc.setFontSize(9);
        doc.setFont("Sarabun", "bold");
        doc.text(`Total No. of Days Worked : ${totalDays} Days     Total No. of OT Hrs/Days : ${totalOt} Hrs.     Convert Hrs to : ${convDays} Days`, 10, sy);

        sy += 6;
        doc.setFontSize(8);
        doc.setFont("Sarabun", "normal");
        doc.text("I Certify that the above is a true record of my time for this period.", 10, sy);

        sy += 8;
        doc.text("Employee Signature (Consultant) _____________________  Date ________", 10, sy);
        sy += 6;
        doc.text("Project Leader Signature (Client)  _____________________  Date ________", 10, sy);


        /* ──── PAGE(s): Daily Work Log ──── */
        // Group into weeks
        const allDaysArr: number[] = [];
        for (let d = 1; d <= numDays; d++) allDaysArr.push(d);

        const weekBatches: number[][] = [];
        let currentWeek: number[] = [];
        for (let d = 1; d <= numDays; d++) {
            currentWeek.push(d);
            const dateObj = new Date(year, month - 1, d);
            if (dateObj.getDay() === 0) {
                weekBatches.push(currentWeek);
                currentWeek = [];
            }
        }
        if (currentWeek.length > 0) weekBatches.push(currentWeek);

        // Map existing items by day
        const itemMap = new Map<number, TimesheetRespond[]>();
        items.forEach(i => {
            if (!i.workDate) return;
            const d = new Date(i.workDate);
            if (d.getFullYear() === year && d.getMonth() + 1 === month) {
                const date = d.getDate();
                if (!itemMap.has(date)) itemMap.set(date, []);
                itemMap.get(date)!.push(i);
            }
        });

        const specialSetArr = new Set((cal?.specialDays || []).map(s => s.date));
        const holidaySetArr = new Set((cal?.holidays || []).map(h => h.date));

        for (const weekDays of weekBatches) {
            // Only skip the week if it contains 0 total working days
            const weekHasWorkingDays = weekDays.some(day => {
                const dateObj = new Date(year, month - 1, day);
                const dow = dateObj.getDay();
                return (dow !== 0 && dow !== 6) || specialSetArr.has(day);
            });
            if (!weekHasWorkingDays) continue;

            doc.addPage("a4", "landscape");

            const startDay = weekDays[0];
            const endDay = weekDays[weekDays.length - 1];
            const startLabel = format(new Date(year, month - 1, startDay), "d-MMM-yyyy");
            const endLabel = format(new Date(year, month - 1, endDay), "d-MMM-yyyy");

            // Header
            doc.setFontSize(16);
            doc.setFont("Sarabun", "bold");
            doc.text("ใบบันทึกการทำงาน", 10, 14);

            doc.setFontSize(9);
            doc.setFont("Sarabun", "bold");
            doc.text("บริษัทต้นสังกัด", 85, 10);
            doc.setFont("Sarabun", "normal");
            doc.text(companyName, 115, 10);
            doc.setFont("Sarabun", "bold");
            doc.text("ชื่อโครงการ", 175, 10);
            doc.setFont("Sarabun", "normal");
            doc.text(projectName, 195, 10);
            doc.setFont("Sarabun", "bold");
            doc.text("ผู้รับผิดชอบ", 235, 10);
            doc.setFont("Sarabun", "normal");
            doc.text(inchargeName, 255, 10);

            doc.setFont("Sarabun", "bold");
            doc.text("ชื่อพนักงาน", 85, 16);
            doc.setFont("Sarabun", "normal");
            doc.text(employeeName, 115, 16);
            doc.setFont("Sarabun", "bold");
            doc.text("ประจำวันที่", 175, 16);
            doc.setFont("Sarabun", "normal");
            doc.text(startLabel, 195, 16);
            doc.setFont("Sarabun", "bold");
            doc.text("ถึงวันที่", 235, 16);
            doc.setFont("Sarabun", "normal");
            doc.text(endLabel, 255, 16);

            // Table
            const diaryHead = [["วันที่", "เวลาเข้างาน", "เวลาเลิกงาน", "ประเภทงาน", "รายละเอียดงาน", "ผู้พัฒนา", "ผู้ตรวจสอบ"]];
            const diaryBody: any[][] = [];
            let displayedDaysInWeek = 0;

            for (const day of weekDays) {
                const dateObj = new Date(year, month - 1, day);
                const dow = dateObj.getDay();
                const isWeekendArr = (dow === 0 || dow === 6);
                const isSpecialWorkArr = specialSetArr.has(day);
                const isHolidayArr = holidaySetArr.has(day);

                if (isWeekendArr && !isSpecialWorkArr) continue;

                displayedDaysInWeek++;
                const dayItems = itemMap.get(day) || [{} as TimesheetRespond];
                const dateStr = format(dateObj, "d-MMM-yyyy");

                for (const item of dayItems) {
                    const details = item.details || [];
                    const st = details.length > 0 ? formatTime(details[0]?.startTime) : "";
                    const et = details.length > 0 ? formatTime(details[0]?.endTime) : "";
                    let desc = details.map(d => d.workName || d.workDescription || "").filter(Boolean).join(", ");
                    
                    if (isHolidayArr && !item.totalWorkHours) {
                        desc = `(HOLIDAY) ${cal?.holidays.find(h => h.date === day)?.title || ""}`;
                    }
                    if (!desc) desc = "-";

                    const prob = details.map(d => d.problemDescription || "").filter(Boolean).join(", ");
                    const resolve = details.map(d => d.problemResolve || "").filter(Boolean).join(", ");
                    
                    const nameParts = (employeeName || "").split(" ");
                    const devName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : nameParts[0];

                    diaryBody.push([dateStr, st, et, "งานที่มอบหมาย", desc, devName, inchargeName]);
                    diaryBody.push(["", "", "", "งานที่ทำจริง", desc, "", ""]);
                    diaryBody.push(["", "", "", "ปัญหาที่พบ", prob || "-", "", ""]);
                    diaryBody.push(["", "", "", "แนวทางแก้ไข", resolve || "-", "", ""]);
                    diaryBody.push([{ content: "ชดเชย/ล่วงเวลา", colSpan: 7, styles: { halign: "left", textColor: [150, 150, 150], fontSize: 7 } }]);
                }
            }

            autoTable(doc, {
                startY: 22,
                head: diaryHead,
                body: diaryBody,
                styles: { fontSize: 8, cellPadding: 1.5, font: "Sarabun", fontStyle: "normal", lineWidth: 0.2, lineColor: [0, 0, 0] },
                headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold", lineWidth: 0.3 },
                columnStyles: {
                    0: { cellWidth: 22 },
                    1: { cellWidth: 20, halign: "center" },
                    2: { cellWidth: 20, halign: "center" },
                    3: { cellWidth: 22, fontStyle: "bold" },
                    4: { cellWidth: 'auto' },
                    5: { cellWidth: 25 },
                    6: { cellWidth: 30 },
                },
                margin: { left: 10 },
            });

            // Summary
            const dy = (doc as any).lastAutoTable?.finalY || 160;
            let dsY = dy + 5;
            doc.setFontSize(9);
            doc.setFont("Sarabun", "normal");
            doc.text(`รวมวันทำงานที่ต้องชดเชย ยกมา     0 วัน`, 10, dsY);
            doc.text("ลงชื่อ __________________________ ผู้อนุมัติ", 170, dsY);
            dsY += 5;
            doc.text(`รวมวันทำงานสำหรับสัปดาห์นี้     ${displayedDaysInWeek} วัน`, 10, dsY);
            dsY += 5;
            doc.text(`คงเหลือวันทำงานที่ต้องชดเชย     0 วัน`, 10, dsY);
            doc.text(`( ${inchargeName} )`, 180, dsY);
            dsY += 4;
            doc.text("ผู้รับผิดชอบโครงการ", 180, dsY);
        }
    }

    const buf = doc.output("arraybuffer");
    await downloadFile({
        data: buf,
        filename: `timesheet_${monthLabel}_${ts()}.pdf`,
        mimeType: "application/pdf",
    });
}

/* Legacy exports for backward compatibility */
export const exportMonthlyTimeSheet = exportTimesheetExcel;
export const exportDailyWorkLog = exportTimesheetExcel;
