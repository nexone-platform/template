"use client";

import { useState, useMemo, useEffect } from "react";
import { usePeriods, Period, StatusRequest } from "@/hooks/use-payroll";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import {
    PageHeader, TableHeaderBar, SortableTh, ActionButtons, EmptyState, LoadingSpinner,
    PaginationBar, ModalWrapper, FormField, StatusBadge, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useMessages } from "@/hooks/use-messages";

/* ── helpers ── */
const fmtDate = (d: string | Date | null | undefined) => {
    if (!d) return "";
    const dt = new Date(d as string);
    if (isNaN(dt.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
};

const fmtNum = (n: number | null | undefined) =>
    (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ── Status Constants ── */
const statuses = [
    { statusId: 1, statusName: "Draft" },
    { statusId: 2, statusName: "Pending Approval" },
    { statusId: 3, statusName: "Approved" },
    { statusId: 4, statusName: "Declined" },
    { statusId: 5, statusName: "Return" },
];

export default function EmployeeSalaryAdminPage() {
    const { t } = usePageTranslation();
    const { msg } = useMessages();
    const router = useRouter();

    const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);
    const [filterMonth, setFilterMonth] = useState<string>("");
    const [searchText, setSearchText] = useState("");
    const [searchRequest, setSearchRequest] = useState<StatusRequest>({});
    const { data: allPeriodsRaw, isLoading } = usePeriods(searchRequest);

    const [paymentTypes, setPaymentTypes] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [paymentTypeId, setPaymentTypeId] = useState<number | null>(null);
    const [paymentChannelId, setPaymentChannelId] = useState<number | null>(null);
    const [paymentTypeError, setPaymentTypeError] = useState(false);
    const [paymentChannelError, setPaymentChannelError] = useState(false);

    const paymentChannels = [
        { paymentChannelId: 1, paymentChannelName: "Payment via Bank Transfer" },
        { paymentChannelId: 2, paymentChannelName: "Cash Payment" },
    ];

    useEffect(() => {
        apiClient.get("paymentType").then((res: any) => { setPaymentTypes(res.data?.data || []); }).catch(() => { });
    }, []);

    const handleSearch = () => { setSearchRequest({ status: filterStatus ?? null, month: filterMonth || null }); setCurrentPage(1); };
    const handleClear = () => { setFilterStatus(undefined); setFilterMonth(""); setSearchRequest({}); setCurrentPage(1); };

    const handleSubmitPaymentType = () => {
        let hasError = false;
        if (!paymentTypeId) { setPaymentTypeError(true); hasError = true; } else { setPaymentTypeError(false); }
        if (!paymentChannelId) { setPaymentChannelError(true); hasError = true; } else { setPaymentChannelError(false); }
        if (hasError) return;
        setShowAddModal(false);
        router.push(`/payroll/employee-salary-admin/add-salary-detail?periodId=0&paymentTypeId=${paymentTypeId}&paymentChannelId=${paymentChannelId}&readonly=false`);
    };

    const navigateAdd = (period: Period) => {
        router.push(`/payroll/employee-salary-admin/add-salary-detail?periodId=${period.periodId}&paymentTypeId=${period.paymentTypeId}&paymentChannelId=${period.paymentChannel}&readonly=false`);
    };

    // ── Table state ──
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const rows = useMemo(() => {
        const base = Array.isArray(allPeriodsRaw) ? allPeriodsRaw : [];
        if (!searchText) return base;
        const q = searchText.toLowerCase();
        return base.filter((r: any) =>
            r.reason?.toLowerCase().includes(q) ||
            r.status?.toLowerCase().includes(q) ||
            (r.periodStartDate && fmtDate(r.periodStartDate).includes(q)) ||
            (r.periodEndDate && fmtDate(r.periodEndDate).includes(q)) ||
            (r.paymentDate && fmtDate(r.paymentDate).includes(q)) ||
            (r.monthYear && fmtDate(r.monthYear).includes(q)) ||
            String(r.totalCost ?? "").includes(q) ||
            String(r.totalPayment ?? "").includes(q)
        );
    }, [allPeriodsRaw, searchText]);

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    const sorted = useMemo(() => {
        const data = [...rows];
        if (!sortKey) return data;
        return data.sort((a: any, b: any) => {
            const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
            return (av < bv ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [rows, sortKey, sortDir]);

    const totalData = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedData = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);



    const columns = [
        { key: "periodStartDate", label: t('Periods', 'Periods'), sortable: true, align: "center" as const },
        { key: "paymentDate", label: t('Payment Date', 'Payment Date'), sortable: true, align: "center" as const },
        { key: "totalCost", label: t('Total Cost', 'Total Cost'), sortable: true, align: "right" as const },
        { key: "totalPayment", label: t('Total Payment', 'Total Payment'), sortable: true, align: "right" as const },
        { key: "status", label: t('Status', 'Status'), sortable: true, align: "center" as const },
        { key: "reason", label: t('Reason', 'Reason'), sortable: false },
        { key: "monthYear", label: t('Month/Year', 'Month/Year'), sortable: true, align: "center" as const },
        { key: "action", label: t('Action', 'Action'), sortable: false, align: "right" as const },
    ];

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Employee Salary Admin', 'Employee Salary Admin')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Employee Salary Admin', 'Employee Salary Admin') },
                ]}
                actionLabel={t('Add Salary', 'Add Salary')}
                onAction={() => { setShowAddModal(true); setPaymentTypeId(null); setPaymentChannelId(null); }}
                actionIcon={<Plus className="w-4 h-4" />}
            />

            {/* Search Filter */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <FormField label={t('Status', 'Status')}>
                        <select className={ui.select} value={filterStatus ?? ""} onChange={e => setFilterStatus(e.target.value ? Number(e.target.value) : undefined)}>
                            <option value="">{t('All Statuses', 'All Statuses')}</option>
                            {statuses.map(s => (<option key={s.statusId} value={s.statusId}>{t(s.statusName, s.statusName)}</option>))}
                        </select>
                    </FormField>
                    <FormField label={t('Month', 'Month')}>
                        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className={ui.input} />
                    </FormField>
                    <div className="flex gap-3">
                        <button onClick={handleSearch} className={`${ui.btnPrimary} bg-emerald-600 hover:bg-nv-violet-dark active:bg-emerald-800 flex items-center gap-2`}>{t('Search', 'Search')}</button>
                        <button onClick={handleClear} className={ui.btnSecondary}>{t('Clear', 'Clear')}</button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }}
                    searchText={searchText}
                    onSearchChange={(v) => { setSearchText(v); setCurrentPage(1); }}
                />
                <div className="overflow-x-auto">
                    <table className={`${ui.table} min-w-[1000px]`}>
                        <thead className={ui.thead}>
                            <tr>
                                {columns.map(col => (
                                    <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                ))}
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {isLoading ? (
                                <LoadingSpinner colSpan={8} />
                            ) : paginatedData.length === 0 ? (
                                <EmptyState colSpan={8} />
                            ) : paginatedData.map((salary, idx) => (
                                <tr key={salary.periodId || idx} className={ui.tr}>
                                    <td className="px-4 py-3 text-center text-gray-600">{fmtDate(salary.periodStartDate)} - {fmtDate(salary.periodEndDate)}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">{fmtDate(salary.paymentDate)}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{fmtNum(salary.totalCost)}</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{fmtNum(salary.totalPayment)}</td>
                                    <td className="px-4 py-3 text-center"><StatusBadge status={salary.status} /></td>
                                    <td className={ui.td}>{salary.reason || ""}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">{fmtDate(salary.monthYear)}</td>
                                    <td className={ui.tdActions}>
                                        <ActionButtons onEdit={() => navigateAdd(salary)} editTitle="Edit Salary" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationBar currentPage={safePage} totalPages={totalPages} totalData={totalData} pageSize={pageSize} onGoToPage={setCurrentPage} />
            </div>

            {/* Add Salary Modal */}
            <ModalWrapper open={showAddModal} onClose={() => setShowAddModal(false)} title={t('Add Salary', 'Add Salary')} maxWidth="max-w-lg"
                footer={<button onClick={handleSubmitPaymentType} className={ui.btnPrimary}>{t('Submit', 'Submit')}</button>}>
                <div className="space-y-4">
                    <FormField label={t('Payment Type', 'Payment Type')} required error={paymentTypeError ? msg('VAL_PAYMENT_TYPE_REQUIRED', '*Payment Type is required') : undefined}>
                        <select className={`${ui.select} ${paymentTypeError ? "border-red-500" : ""}`}
                            value={paymentTypeId ?? ""} onChange={e => { setPaymentTypeId(e.target.value ? Number(e.target.value) : null); setPaymentTypeError(false); }}>
                            <option value="">{t('Select Payment Type', 'Select Payment Type')}</option>
                            {paymentTypes.map((pt: any) => (<option key={pt.paymentTypeId} value={pt.paymentTypeId}>{t(pt.paymentTypeNameEn, pt.paymentTypeNameEn)}</option>))}
                        </select>
                    </FormField>
                    <FormField label={t('Payment Channel', 'Payment Channel')} required error={paymentChannelError ? msg('VAL_PAYMENT_CHANNEL_REQUIRED', '*Payment Channel is required') : undefined}>
                        <select className={`${ui.select} ${paymentChannelError ? "border-red-500" : ""}`}
                            value={paymentChannelId ?? ""} onChange={e => { setPaymentChannelId(e.target.value ? Number(e.target.value) : null); setPaymentChannelError(false); }}>
                            <option value="">{t('Select Payment Channel', 'Select Payment Channel')}</option>
                            {paymentChannels.map(ch => (<option key={ch.paymentChannelId} value={ch.paymentChannelId}>{t(ch.paymentChannelName, ch.paymentChannelName)}</option>))}
                        </select>
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
