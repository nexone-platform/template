"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { usePeriodsByStatus, useUpdatePeriodStatus, Period, StatusRequest } from "@/hooks/use-payroll";
import { useRouter } from "next/navigation";
import { useMessages } from "@/hooks/use-messages";
import {
    PageHeader, TableHeaderBar, SortableTh, ActionButtons, EmptyState, LoadingSpinner,
    PaginationBar, ModalWrapper, FormField, StatusBadge, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

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
    { statusId: 2, statusName: "Pending" },
    { statusId: 3, statusName: "Approved" },
    { statusId: 4, statusName: "Declined" },
    { statusId: 5, statusName: "Return" },
];

const PeriodStatus = { Approved: 3, Declined: 4, Return: 5 };

export default function ApproveSalaryPage() {
    const { t } = usePageTranslation();
    const { msg, showSuccess, showError, showWarning } = useMessages();
    const router = useRouter();

    const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);
    const [filterMonth, setFilterMonth] = useState<string>("");
    const [searchRequest, setSearchRequest] = useState<StatusRequest>({});

    const { data: allPeriodsRaw, isLoading, refetch } = usePeriodsByStatus(searchRequest);
    const updateStatusMutation = useUpdatePeriodStatus();

    const handleSearch = () => { setSearchRequest({ status: filterStatus ?? null, month: filterMonth || null }); setCurrentPage(1); };
    const handleClear = () => { setFilterStatus(undefined); setFilterMonth(""); setSearchRequest({}); setCurrentPage(1); };

    const navigateAdd = (period: Period, readonly: boolean = true) => {
        router.push(`/payroll/employee-salary-admin/add-salary-detail?periodId=${period.periodId}&paymentTypeId=${period.paymentTypeId}&paymentChannelId=${period.paymentChannel}&readonly=${readonly}`);
    };

    const [isViewOnly, setIsViewOnly] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const profileStr = localStorage.getItem("userProfile");
            const profile = profileStr ? JSON.parse(profileStr) : null;
            // Assuming roleId 1 is Admin who can perform actions
            if (profile?.roleId === 1) {
                setIsViewOnly(false);
            }
        }
    }, []);

    // ── Approve/Decline/Return modal ──
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState<{ periodId: number; status: number; label: string } | null>(null);
    const [reason, setReason] = useState("");
    const [reasonError, setReasonError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openApproveModal = (periodId: number, status: number, label: string) => {
        setModalAction({ periodId, status, label }); setReason(""); setReasonError(false); setShowModal(true);
    };

    const handleUpdateStatus = async () => {
        if (!reason.trim()) {
            setReasonError(true);
            showWarning('REQUIRED_FIELDS', 'Validation Error', 'Please fill in all required fields.');
            return;
        }
        if (!modalAction) return;
        setIsSubmitting(true);
        try {
            await updateStatusMutation.mutateAsync({ periodId: modalAction.periodId, status: modalAction.status, reason: reason.trim() });
            showSuccess('STATUS_UPDATE_SUCCESS', 'Success!', `Salary has ${modalAction.label} successfully.`);
            setShowModal(false); refetch();
        } catch (error: any) {
            showError('SAVE_ERROR', 'Error!', error?.response?.data?.error || error?.message || 'Failed to update status.');
            setShowModal(false);
        } finally { setIsSubmitting(false); }
    };

    // ── Table state ──
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortKey, setSortKey] = useState("");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const rows = useMemo(() => Array.isArray(allPeriodsRaw) ? allPeriodsRaw : [], [allPeriodsRaw]);

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    };

    const sorted = useMemo(() => {
        const data = [...rows]; if (!sortKey) return data;
        return data.sort((a: any, b: any) => { const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? ""; return (av < bv ? -1 : 1) * (sortDir === "asc" ? 1 : -1); });
    }, [rows, sortKey, sortDir]);

    const totalData = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalData / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedData = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

    // ── Status Dropdowns ──
    const [openStatusDropdown, setOpenStatusDropdown] = useState<number | null>(null);
    const statusDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (openStatusDropdown === null) return;
        const handleClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (openStatusDropdown !== null && statusDropdownRef.current && !statusDropdownRef.current.contains(target)) setOpenStatusDropdown(null);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [openStatusDropdown]);

    const isActionable = (status: string) => status !== "Approved" && status !== "Declined" && status !== "Return" && isViewOnly;

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
                title={t('Approve Salary', 'Approve Salary')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" },
                    { label: t('Employee Salary Admin', 'Employee Salary Admin'), href: "/payroll/employee-salary-admin" },
                    { label: t('Approve Salary', 'Approve Salary') },
                ]}
            />

            {/* Search Filter */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <FormField label={t('Status', 'Status')}>
                        <select className={ui.select} value={filterStatus ?? ""} onChange={e => setFilterStatus(e.target.value ? Number(e.target.value) : undefined)}>
                            <option value="">{t('Select Status', 'Select Status')}</option>
                            {statuses.map(s => (<option key={s.statusId} value={s.statusId}>{s.statusName}</option>))}
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
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); setCurrentPage(1); }} />
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
                                    {/* Status with dropdown for actionable items */}
                                    <td className="px-4 py-3 text-center relative">
                                        {isActionable(salary.status) ? (
                                            <div ref={openStatusDropdown === idx ? statusDropdownRef : undefined} className="inline-block">
                                                <button onClick={() => setOpenStatusDropdown(openStatusDropdown === idx ? null : idx)}
                                                    className="cursor-pointer hover:opacity-80">
                                                    <StatusBadge status={salary.status} />
                                                    <span className="ml-1 text-xs text-gray-400">▾</span>
                                                </button>
                                                {openStatusDropdown === idx && (
                                                    <div className={`absolute left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[140px] ${idx >= paginatedData.length - 2 ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
                                                        <button onClick={() => { setOpenStatusDropdown(null); openApproveModal(salary.periodId, PeriodStatus.Approved, "Approved"); }}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-nv-violet inline-block" /> Approved
                                                        </button>
                                                        <button onClick={() => { setOpenStatusDropdown(null); openApproveModal(salary.periodId, PeriodStatus.Declined, "Declined"); }}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Declined
                                                        </button>
                                                        <button onClick={() => { setOpenStatusDropdown(null); openApproveModal(salary.periodId, PeriodStatus.Return, "Return"); }}
                                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-nv-warn inline-block" /> Return
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <StatusBadge status={salary.status} />
                                        )}
                                    </td>
                                    <td className={ui.td}>{salary.reason || ""}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">{fmtDate(salary.monthYear)}</td>
                                    <td className={ui.tdActions}>
                                        <ActionButtons onView={() => navigateAdd(salary, true)} viewTitle="View Salary Detail" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <PaginationBar currentPage={safePage} totalPages={totalPages} totalData={totalData} pageSize={pageSize} onGoToPage={setCurrentPage} />
            </div>

            {/* Approve/Decline/Return Modal */}
            <ModalWrapper
                open={showModal && modalAction !== null}
                onClose={() => setShowModal(false)}
                title={modalAction?.label === "Approved" ? "Approve Salary" : modalAction?.label === "Declined" ? "Decline Salary" : "Return Salary"}
                maxWidth="max-w-lg"
                footer={
                    <div className="flex gap-3 w-full">
                        <button onClick={handleUpdateStatus} disabled={isSubmitting}
                            className={`flex-1 py-2.5 rounded-lg text-white font-medium transition disabled:opacity-50 ${modalAction?.label === "Approved" ? "bg-emerald-600 hover:bg-nv-violet-dark" : modalAction?.label === "Declined" ? "bg-red-600 hover:bg-red-700" : "bg-nv-warn/90 hover:bg-amber-700"}`}>
                            {isSubmitting ? "Loading..." : modalAction?.label === "Approved" ? "Approve" : modalAction?.label === "Declined" ? "Decline" : "Return"}
                        </button>
                        <button onClick={() => setShowModal(false)} className={ui.btnSecondary}>{t('Close', 'Close')}</button>
                    </div>
                }>
                <p className="text-sm text-gray-500 mb-4">
                    {modalAction?.label === "Approved" && "Are you sure you want to approve this salary period?"}
                    {modalAction?.label === "Declined" && "Are you sure you want to decline this salary period?"}
                    {modalAction?.label === "Return" && "Are you sure you want to return this salary period?"}
                </p>
                <FormField label={t('Reason', 'Reason')} required error={reasonError && !reason.trim() ? msg('VAL_REASON_REQUIRED', '*Reason is required') : undefined}>
                    <textarea className={`${ui.textarea} min-h-[100px]`} placeholder="Enter your reason here" value={reason}
                        onChange={e => { setReason(e.target.value); setReasonError(false); }} />
                </FormField>
            </ModalWrapper>
        </div>
    );
}
