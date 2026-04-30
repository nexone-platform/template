"use client";

import { useState, useMemo } from "react";
import {
    usePerformanceReviews,
    useCreateReview,
    useUpdateReview,
    useDeleteReview,
    PerformanceReviewDto
} from "@/hooks/use-performance";
import { useMessages } from "@/hooks/use-messages";
import { ROUTES } from "@/lib/routes";
import { usePagination } from "@/hooks/use-pagination";
import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader,
    TableHeaderBar,
    SortableTh,
    ActionButtons,
    EmptyState,
    LoadingSpinner,
    PaginationBar,
    ModalWrapper,
    FormField,
    ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

type AnyRow = Record<string, any>;

export default function PerformanceReviewPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError } = useMessages();

    const exportColumns: ExportColumn[] = useMemo(() => [
        { header: "#", key: "_index" },
        { header: t('Employee', 'Employee'), key: "employeeName" },
        { header: t('Employee ID', 'Employee ID'), key: "employeeId" },
        { header: t('Department', 'Department'), key: "department" },
        { header: t('Designation', 'Designation'), key: "designation" },
        { header: t('Date of Join', 'Date of Join'), key: "dateOfJoin" },
        { header: t('RO Name', 'RO Name'), key: "roName" },
    ], [t]);

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "employeeName", label: t('Employee', 'Employee'), sortable: true },
    { key: "employeeId", label: t('Employee ID', 'Employee ID'), sortable: true },
    { key: "department", label: t('Department', 'Department'), sortable: true },
    { key: "designation", label: t('Designation', 'Designation'), sortable: true },
    { key: "dateOfJoin", label: t('Date of Join', 'Date of Join'), sortable: true },
    { key: "roName", label: t('RO Name', 'RO Name'), sortable: true },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const { data: reviews, isLoading } = usePerformanceReviews();
    const createMutation = useCreateReview();
    const updateMutation = useUpdateReview();
    const deleteMutation = useDeleteReview();

    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState(10);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<PerformanceReviewDto | null>(null);
    const [formData, setFormData] = useState<Partial<PerformanceReviewDto>>({
        employeeName: "",
        employeeId: "",
        department: "",
        designation: "",
        qualification: "",
        dateOfJoin: "",
        dateOfConfirmation: "",
        prevExp: "",
        roName: "",
        roDesignation: "",
    });

    const list: PerformanceReviewDto[] = useMemo(() => reviews ?? [], [reviews]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.employeeName?.toLowerCase().includes(q) ||
                d.employeeId?.toLowerCase().includes(q) ||
                d.department?.toLowerCase().includes(q) ||
                d.designation?.toLowerCase().includes(q) ||
                d.roName?.toLowerCase().includes(q) ||
                d.dateOfJoin?.toLowerCase().includes(q)
        );
    }, [list, searchText]);

    const sorted = useMemo(() => {
        if (!sortKey) return filtered;
        return [...filtered].sort((a, b) => {
            const aVal = (a as AnyRow)[sortKey] ?? "";
            const bVal = (b as AnyRow)[sortKey] ?? "";
            return (aVal < bVal ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
        });
    }, [filtered, sortKey, sortDir]);

    const {
        paginatedData,
        currentPage,
        totalPages,
        goToPage,
        changePageSize: changePgSize,
    } = usePagination(sorted, { pageSize });

    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const openAdd = () => {
        setSelectedReview(null);
        setFormData({
            employeeName: "", employeeId: "", department: "", designation: "",
            qualification: "", dateOfJoin: "", dateOfConfirmation: "", prevExp: "",
            roName: "", roDesignation: "",
        });
        setModalOpen(true);
    };

    const openEdit = (item: PerformanceReviewDto) => {
        setSelectedReview(item);
        setFormData({
            employeeName: item.employeeName,
            employeeId: item.employeeId,
            department: item.department,
            designation: item.designation,
            qualification: item.qualification,
            dateOfJoin: item.dateOfJoin,
            dateOfConfirmation: item.dateOfConfirmation,
            prevExp: item.prevExp,
            roName: item.roName,
            roDesignation: item.roDesignation,
        });
        setModalOpen(true);
    };

    const handleSubmitForm = () => {
        if (selectedReview) {
            updateMutation.mutate({ ...selectedReview, ...formData } as PerformanceReviewDto, {
                onSuccess: () => {
                    showSuccess('SAVE_SUCCESS', 'Success!', 'Review updated successfully.');
                    setModalOpen(false);
                },
                onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to update review.'),
            });
        } else {
            createMutation.mutate(formData, {
                onSuccess: () => {
                    showSuccess('SAVE_SUCCESS', 'Success!', 'Review created successfully.');
                    setModalOpen(false);
                },
                onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to create review.'),
            });
        }
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Performance Review', 'Performance Review')}
                breadcrumbs={[
                    { label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard },
                    { label: t('Performance Review', 'Performance Review') },
                ]}
                actionLabel={t('Add', 'Add')}
                onAction={openAdd}
            />

            <ExportButtons
                data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))}
                columns={exportColumns}
                filenamePrefix="performance_reviews"
                pdfTitle={t('Performance Reviews', 'Performance Reviews')}
                totalCount={sorted.length}
            />

            <div className={ui.tableWrapper}>
                <TableHeaderBar
                    pageSize={pageSize}
                    onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }}
                    searchText={searchText}
                    onSearchChange={setSearchText}
                />

                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}>
                                <tr>
                                    {tableColumns.map((col) => (
                                        <SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((d: PerformanceReviewDto, idx: number) => (
                                        <tr key={d.employeeId + idx} className={ui.tr}>
                                            <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td className={ui.tdBold}>{d.employeeName}</td>
                                            <td className={ui.td}>{d.employeeId}</td>
                                            <td className={ui.td}>{d.department}</td>
                                            <td className={ui.td}>{d.designation}</td>
                                            <td className={ui.td}>{d.dateOfJoin}</td>
                                            <td className={ui.td}>{d.roName}</td>
                                            <td className={ui.tdActions}>
                                                <ActionButtons
                                                    onEdit={() => openEdit(d)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <EmptyState colSpan={8} />
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

            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedReview ? "Edit Review" : "Add Review"}
                maxWidth="max-w-2xl"
                footer={
                    <button onClick={handleSubmitForm} disabled={updateMutation.isPending || createMutation.isPending} className={ui.btnPrimary}>
                        {updateMutation.isPending || createMutation.isPending ? "Saving..." : "Submit"}
                    </button>
                }
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Employee Name', 'Employee Name')} required>
                            <input type="text" value={formData.employeeName} onChange={(e) => setFormData((p) => ({ ...p, employeeName: e.target.value }))} className={ui.input} placeholder="Enter employee name" />
                        </FormField>
                        <FormField label={t('Employee ID', 'Employee ID')} required>
                            <input type="text" value={formData.employeeId} onChange={(e) => setFormData((p) => ({ ...p, employeeId: e.target.value }))} className={ui.input} placeholder="Enter employee ID" />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Department', 'Department')} required>
                            <input type="text" value={formData.department} onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))} className={ui.input} placeholder="Enter department" />
                        </FormField>
                        <FormField label={t('Designation', 'Designation')}>
                            <input type="text" value={formData.designation} onChange={(e) => setFormData((p) => ({ ...p, designation: e.target.value }))} className={ui.input} placeholder="Enter designation" />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Qualification', 'Qualification')}>
                            <input type="text" value={formData.qualification} onChange={(e) => setFormData((p) => ({ ...p, qualification: e.target.value }))} className={ui.input} placeholder="Enter qualification" />
                        </FormField>
                        <FormField label={t('Previous Experience', 'Previous Experience')}>
                            <input type="text" value={formData.prevExp} onChange={(e) => setFormData((p) => ({ ...p, prevExp: e.target.value }))} className={ui.input} placeholder="e.g. 3 years" />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Date of Joining', 'Date of Joining')}>
                            <input type="date" value={formData.dateOfJoin} onChange={(e) => setFormData((p) => ({ ...p, dateOfJoin: e.target.value }))} className={ui.input} />
                        </FormField>
                        <FormField label={t('Date of Confirmation', 'Date of Confirmation')}>
                            <input type="date" value={formData.dateOfConfirmation} onChange={(e) => setFormData((p) => ({ ...p, dateOfConfirmation: e.target.value }))} className={ui.input} />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label={t('Reporting Officer Name', 'Reporting Officer Name')} required>
                            <input type="text" value={formData.roName} onChange={(e) => setFormData((p) => ({ ...p, roName: e.target.value }))} className={ui.input} placeholder="Enter RO name" />
                        </FormField>
                        <FormField label={t('RO Designation', 'RO Designation')}>
                            <input type="text" value={formData.roDesignation} onChange={(e) => setFormData((p) => ({ ...p, roDesignation: e.target.value }))} className={ui.input} placeholder="Enter RO designation" />
                        </FormField>
                    </div>
                </div>
            </ModalWrapper>
        </div>
    );
}
