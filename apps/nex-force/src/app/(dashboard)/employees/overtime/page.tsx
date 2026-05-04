"use client";

import { useEffect,  useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit } from "lucide-react";
import apiClient from "@/lib/api-client";
import { useRowSelection } from "@/hooks/use-row-selection";
import {
    useAllOvertimeById,
    useOvertimeStatisticsById,
    useOvertimeTypes,
} from "@/hooks/use-overtime";
import { getUserId } from "@/lib/auth";
import { usePagination } from "@/hooks/use-pagination";
import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, ModalWrapper, FormField, StatusBadge, TableHeaderBar,
    LoadingSpinner, EmptyState, PaginationBar, SortableTh, ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useSystemConfig } from '@nexone/ui';



export default function OvertimePage() {
    const { t } = usePageTranslation();

    const tableColumns = useMemo(() => [
        { key: "employeeName", label: t('Name', 'Name'), sortable: true },
        { key: "overtimeDate", label: t('OT Date', 'OT Date'), sortable: true },
        { key: "hour", label: t('OT Hours', 'OT Hours'), sortable: true },
        { key: "typeName", label: t('OT Type', 'OT Type'), sortable: true },
        { key: "description", label: t('Description', 'Description'), sortable: true },
        { key: "amount", label: t('Amount', 'Amount'), sortable: true },
        { key: "status", label: t('Status', 'Status'), sortable: true },
        { key: "approvedBy", label: t('Approved By', 'Approved By'), sortable: true },
        { key: "approvalDate", label: t('Approved Date', 'Approved Date'), sortable: true },
        { key: "comments", label: t('Comment', 'Comment'), sortable: true },
    ], [t]);

    type AnyRow = Record<string, any>;

    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: "#", key: "_index" },
    { header: t('Name', 'Name'), key: "employeeName" },
    { header: t('OT Date', 'OT Date'), key: "overtimeDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
    { header: t('OT Hours', 'OT Hours'), key: "hour", format: (v: any) => typeof v === "number" ? v.toFixed(2) : String(v || "") },
    { header: t('OT Type', 'OT Type'), key: "typeName" },
    { header: t('Description', 'Description'), key: "description" },
    { header: t('Amount', 'Amount'), key: "amount", format: (v: any) => typeof v === "number" ? v.toFixed(2) : String(v || "") },
    { header: t('Status', 'Status'), key: "status" },
    { header: t('Approved By', 'Approved By'), key: "approvedBy" },
    { header: t('Comment', 'Comment'), key: "comments" },
    ], [t]);
    const queryClient = useQueryClient();
    const userId = getUserId();

    // ── Search form (Angular: searchForm → month, week) ──
    const [month, setMonth] = useState("");
    const [week, setWeek] = useState("");
    const filter = useMemo(() => ({ month, week, lang: "en" }), [month, week]);

    // ── Data queries ──
    const { data: statsData } = useOvertimeStatisticsById(userId, filter);
    const { data: listData, isLoading } = useAllOvertimeById(userId, filter);
    const { data: otTypes } = useOvertimeTypes();

    const { data: orgData } = useQuery({
        queryKey: ["masterOrganization"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("organizations/getMasterOrganization");
            return data;
        },
    });
    const { data: projectData } = useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("projects/getProject");
            return data?.data || [];
        },
    });
    const { data: employees } = useQuery({
        queryKey: ["employeesAutoComplete"],
        queryFn: async () => {
            const { data } = await apiClient.get<any>("employees/getEmployeeForSelect");
            return data?.data || [];
        },
    });


    // ── Table state ──
    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const { configs, loading: configLoading } = useSystemConfig();
    const [hasSetDefaultPageSize, setHasSetDefaultPageSize] = useState(false);

    useEffect(() => {
        if (!configLoading && configs?.pageRecordDefault && !hasSetDefaultPageSize) {
            setPageSize(configs.pageRecordDefault);
            setHasSetDefaultPageSize(true);
        }
    }, [configLoading, configs?.pageRecordDefault, hasSetDefaultPageSize]);
    const [pageSize, setPageSize] = useState(configs?.pageRecordDefault || 10);

    const otList = useMemo(() => listData?.data || [], [listData]);
    const stats = useMemo(() => statsData || [], [statsData]);

    const filtered = useMemo(() => {
        if (!searchText) return otList;
        const q = searchText.toLowerCase();
        return otList.filter(
            (r: AnyRow) =>
                r.employeeName?.toLowerCase().includes(q) ||
                r.typeName?.toLowerCase().includes(q) ||
                r.description?.toLowerCase().includes(q) ||
                r.status?.toLowerCase().includes(q)
        );
    }, [otList, searchText]);

    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a: AnyRow, b: AnyRow) => {
            const aVal = a[sortKey] ?? "";
            const bVal = b[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [filtered, sortKey, sortDir]);

    const {
        paginatedData,
        currentPage,
        totalPages,
        goToPage,
        changePageSize: changePgSize,
    } = usePagination<AnyRow>(sorted, { pageSize });

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    // ── Row Selection ──
    const getRowId = useCallback((row: AnyRow) => row.overtimeId, []);
    const selection = useRowSelection(paginatedData, getRowId);

    // ── View modal state (form is disabled/view-only in Angular) ──
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState<AnyRow>({});

    // Angular: openEdit → patches form but form is disabled
    const openView = (item: AnyRow) => {
        setFormData({
            overtimeId: item.overtimeId || 0,
            type: item.type || "",
            organizationCode: item.organizationCode || "",
            projectId: item.projectId || "",
            employeeId: item.employeeId || "",
            overtimeDate: item.overtimeDate
                ? new Date(item.overtimeDate).toISOString().split("T")[0]
                : "",
            hour: item.hour || "",
            description: item.description || "",
            requestorId: item.requestorId || "",
        });
        setModalOpen(true);
    };

    // ── Render ──
    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Overtime', 'Overtime')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }, { label: t('Overtime', 'Overtime') }]}
            />

            {/* ── Search Form (Angular: searchForm) ── */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label={t('Month', 'Month')}>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className={ui.input}
                        />
                    </FormField>
                    <FormField label={t('Week Interval', 'Week Interval')}>
                        <select
                            value={week}
                            onChange={(e) => setWeek(e.target.value)}
                            className={ui.select}
                        >
                            <option value="">{t('Full Month', 'Full Month')}</option>
                            <option value="1">Week 1–2</option>
                            <option value="2">Week 3–4</option>
                        </select>
                    </FormField>
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={() => {
                                queryClient.invalidateQueries({ queryKey: ["overtimeStatisticsById"] });
                                queryClient.invalidateQueries({ queryKey: ["overtimeById"] });
                            }}
                            className={`w-full ${ui.btnPrimary}`}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Statistics Cards ── */}
            {stats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {stats.map((s: AnyRow, i: number) => (
                        <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <h6 className="text-sm font-medium text-gray-500">{s.name}</h6>
                            <h4 className="text-2xl font-bold text-gray-800 mt-2">
                                {s.data}{" "}
                                <span className="text-sm font-normal text-gray-400">
                                    {s.name !== "Wait For Approve" && s.name !== "Declined"
                                        ? "Month"
                                        : ""}
                                </span>
                            </h4>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Export Buttons ── */}
            <ExportButtons
                data={sorted.map((d: any, i: number) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="overtime"
                pdfTitle={t('Overtime Records', 'Overtime Records')}
                totalCount={sorted.length}
            />

            {/* ── Table ── */}
            <div className={ui.tableWrapper}>
                {/* Show entries + search */}
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }} searchText={searchText} onSearchChange={setSearchText} />

                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}>
                                <tr>
                                    <SelectAllCheckbox checked={selection.allSelected} indeterminate={selection.indeterminate} onChange={selection.toggleAll} />
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-10">#</th>
                                    {tableColumns.map((col) => (
                                        <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    ))}
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item: AnyRow, idx: number) => (
                                        <tr key={item.overtimeId || idx} className={selection.isSelected(item.overtimeId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(item.overtimeId)} onChange={() => selection.toggle(item.overtimeId)} />
                                            <td className={ui.tdIndex}>
                                                {(currentPage - 1) * pageSize + idx + 1}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                        {item.imgPath && (
                                                            <img src={item.imgPath} alt="" className="w-full h-full object-cover" />
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-nv-violet">{item.employeeName}</span>
                                                </div>
                                            </td>
                                            <td className={ui.td}>
                                                {item.overtimeDate ? format(new Date(item.overtimeDate), "dd/MM/yyyy") : ""}
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium text-gray-600">
                                                {typeof item.hour === "number" ? item.hour.toFixed(2) : item.hour}
                                            </td>
                                            <td className={ui.td}>{item.typeName}</td>
                                            <td className="px-4 py-3 max-w-[150px] truncate text-gray-500" title={item.description}>
                                                {item.description}
                                            </td>
                                            <td className={ui.td}>
                                                {typeof item.amount === "number" ? item.amount.toFixed(2) : item.amount}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge status={item.status || "New"} />
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.approvedBy ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                            {item.approvedByImgPath && (
                                                                <img src={item.approvedByImgPath} alt="" className="w-full h-full object-cover" />
                                                            )}
                                                        </div>
                                                        <span className="text-gray-600">{item.approvedBy}</span>
                                                    </div>
                                                ) : "-"}
                                            </td>
                                            <td className={ui.td}>
                                                {item.approvalDate ? format(new Date(item.approvalDate), "dd/MM/yyyy") : ""}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate" title={item.comments}>
                                                {item.comments || ""}
                                            </td>
                                            <td className={ui.tdActions}>
                                                <button
                                                    onClick={() => openView(item)}
                                                    className="p-1.5 text-gray-500 hover:text-nv-violet hover:bg-nv-violet-light rounded-md transition-colors"
                                                    title={t('View', 'View')}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={13}>
                                            <EmptyState message={t('No data found', 'No data found')} />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalData={sorted.length}
                    pageSize={pageSize}
                    onGoToPage={goToPage}
                />
            </div>

            {/* ── View Modal (Angular: #add_overtime — but form is disabled, submit commented out) ── */}
            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={t('Overtime Detail', 'Overtime Detail')}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('OT Type', 'OT Type')} required>
                            <select
                                value={formData.type}
                                disabled
                                className={`${ui.select} ${ui.inputDisabled}`}
                            >
                                <option value="">{t('Select OT Type', 'Select OT Type')}</option>
                                {otTypes?.map((t: AnyRow) => (
                                    <option key={t.otTypeId} value={t.otTypeId}>{t.otTypeNameEn}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label={t('Organization Code', 'Organization Code')} required>
                            <select
                                value={formData.organizationCode}
                                disabled
                                className={`${ui.select} ${ui.inputDisabled}`}
                            >
                                <option value="">{t('Select Organization', 'Select Organization')}</option>
                                {orgData?.map((o: AnyRow) => (
                                    <option key={o.organizationId} value={o.organizationCode}>
                                        {o.organizationCode}: {o.organizationName}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Project', 'Project')} required>
                            <select
                                value={formData.projectId}
                                disabled
                                className={`${ui.select} ${ui.inputDisabled}`}
                            >
                                <option value="">{t('Select Project', 'Select Project')}</option>
                                {projectData?.map((p: AnyRow) => (
                                    <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label={t('Employee', 'Employee')} required>
                            <select
                                value={formData.employeeId}
                                disabled
                                className={`${ui.select} ${ui.inputDisabled}`}
                            >
                                <option value="">{t('Select Employee', 'Select Employee')}</option>
                                {employees?.map((e: AnyRow) => (
                                    <option key={e.id} value={e.id}>
                                        {e.firstNameEn} {e.lastNameEn}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Overtime Date', 'Overtime Date')} required>
                            <input
                                type="date"
                                value={formData.overtimeDate}
                                disabled
                                className={`${ui.input} ${ui.inputDisabled}`}
                            />
                        </FormField>
                        <FormField label={t('Overtime Hours', 'Overtime Hours')} required>
                            <input
                                type="number"
                                value={formData.hour}
                                disabled
                                className={`${ui.input} ${ui.inputDisabled}`}
                            />
                        </FormField>
                    </div>
                    <FormField label={t('Description', 'Description')} required>
                        <textarea
                            rows={3}
                            value={formData.description}
                            disabled
                            className={`${ui.textarea} ${ui.inputDisabled}`}
                        />
                    </FormField>
                </div>
                {/* No Submit button — commented out in Angular */}
            </ModalWrapper>
        </div>
    );
}
