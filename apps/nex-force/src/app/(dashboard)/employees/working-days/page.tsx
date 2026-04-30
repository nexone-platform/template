"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Copy, Pencil, Trash2, X, Loader2, Check, Search } from "lucide-react";
import {
    useSpecialWorkingDays, useUpdateWorkingDay, useDeleteWorkingDay, useCopyWorkingDays,
} from "@/hooks/use-working-days";
import { useOrganizationData } from "@/hooks/use-organization";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import { useMessages } from "@/hooks/use-messages";
import type { Special } from "@/types/working-days";
import ExportButtons from "@/components/ExportButtons";
import type { ExportColumn } from "@/lib/table-export";
import {
    PageHeader, ModalWrapper, FormField, LoadingSpinner, EmptyState, PaginationBar, ui, SelectAllCheckbox, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";


export default function WorkingDaysPage() {
    const { t, currentLang } = usePageTranslation();
    const { showSuccess, showError, showConfirm } = useMessages();

    const exportColumns: ExportColumn[] = useMemo(() => [
    { header: "#", key: "_index" },
    { header: t('Day Name', 'Day Name'), key: "titleEn" },
    { header: t('Date', 'Date'), key: "specialDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "" },
    { header: t('Day', 'Day'), key: "day" },
    { header: t('Annual Day', 'Annual Day'), key: "isAnnual", format: (v: any) => v ? "Yes" : "No" },
    { header: t('Organization', 'Organization'), key: "organizationNameEn" },
    ], [t]);
    const [modalOpen, setModalOpen] = useState(false);
    const [copyModalOpen, setCopyModalOpen] = useState(false);
    const [editingDay, setEditingDay] = useState<Special | null>(null);

    const [pageSize, setPageSize] = useState(10);

    const { data: holidaysData, isLoading } = useSpecialWorkingDays();
    const updateMutation = useUpdateWorkingDay();
    const deleteMutation = useDeleteWorkingDay();
    const copyMutation = useCopyWorkingDays();
    const { data: orgData } = useOrganizationData();

    const currentYear = new Date().getFullYear();

    // ── Search Form ──
    const searchForm = useForm({
        defaultValues: { year: "" as string, title: "", organizationCode: "" as string, isAnnual: false },
    });
    const watchYear = searchForm.watch("year");
    const watchTitle = searchForm.watch("title");
    const watchOrgCode = searchForm.watch("organizationCode");
    const watchIsAnnual = searchForm.watch("isAnnual");

    const filteredData = useMemo(() => {
        const list = holidaysData?.data || [];
        return list.filter((item) => {
            const itemYear = new Date(item.specialDate).getFullYear().toString();
            return (
                (!watchYear || itemYear === watchYear) &&
                (!watchIsAnnual || item.isAnnual === watchIsAnnual) &&
                (!watchTitle || item.titleEn.toLowerCase().includes(watchTitle.toLowerCase())) &&
                (!watchOrgCode || String(item.organizationCode) === watchOrgCode)
            );
        });
    }, [holidaysData, watchYear, watchTitle, watchOrgCode, watchIsAnnual]);

    const { paginatedData, currentPage, totalPages, goToPage, changePageSize: changePgSize } =
        usePagination(filteredData, { pageSize });

    // ── Row Selection ──
    const getRowId = useCallback((holiday: any) => holiday.specialDaysId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const startIndex = (currentPage - 1) * pageSize + 1;
    const displayYear = watchYear || currentYear;

    const onClearSearch = () => { searchForm.reset({ year: "", title: "", organizationCode: "", isAnnual: false }); };

    // ── Add/Edit Form ──
    const holidayForm = useForm({
        defaultValues: { specialDaysId: 0 as number, titleTh: "", titleEn: "", specialDate: "", organizationCode: "" as string },
    });

    const openAddModal = () => {
        holidayForm.reset({ specialDaysId: 0, titleTh: "", titleEn: "", specialDate: "", organizationCode: "" });
        setEditingDay(null); setModalOpen(true);
    };

    const openEditModal = (holiday: Special) => {
        holidayForm.reset({
            specialDaysId: holiday.specialDaysId,
            titleTh: holiday.titleTh || "", titleEn: holiday.titleEn || "",
            specialDate: holiday.specialDate ? new Date(holiday.specialDate).toISOString().split("T")[0] : "",
            organizationCode: holiday.organizationCode ? String(holiday.organizationCode) : "",
        });
        setEditingDay(holiday); setModalOpen(true);
    };

    const onSubmit = (data: any) => {
        if (!editingDay) data.specialDaysId = 0;
        const date = new Date(data.specialDate);
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayName = format(utcDate, "EEEE");
        const payload = { ...data, specialDate: utcDate.toISOString(), day: dayName };

        updateMutation.mutate(payload, {
            onSuccess: () => { showSuccess('WORKING_DAY_SAVE_SUCCESS', 'Success!', 'Working day saved successfully.'); setModalOpen(false); },
            onError: () => { showError('SAVE_ERROR', 'Error!', 'Error saving working day.'); },
        });
    };

    const confirmDelete = (id: number) => {
        showConfirm('WORKING_DAY_DELETE_CONFIRM', () => {
            deleteMutation.mutate(id, {
                onSuccess: () => { showSuccess('DELETE_SUCCESS', 'Deleted!', 'Working day deleted successfully.'); },
                onError: () => { showError('DELETE_ERROR', 'Error!', 'Error deleting working day.'); },
            });
        }, { fallbackTitle: 'Delete Working Day', fallbackMsg: 'Are you sure you want to delete this working day?' });
    };

    // ── Copy Form ──
    const copyForm = useForm({ defaultValues: { destinationYear: "", organizationCode: "" } });

    const onCopy = (data: any) => {
        if (!data.destinationYear || Number(data.destinationYear) < currentYear) {
            showError('INVALID_YEAR', 'Error', 'Please provide a valid destination year.'); return;
        }
        const selectedItems = selection.getSelectedRows(filteredData);
        if (selectedItems.length === 0) { showError('NO_ITEM_SELECTED', 'Error', 'No day found matching the criteria.'); return; }

        const copiedDays = selectedItems.map((holiday: any) => {
            const newHoliday = { ...holiday };
            const holidayDate = new Date(holiday.specialDate);
            holidayDate.setFullYear(Number(data.destinationYear));
            const utcDate = new Date(Date.UTC(holidayDate.getFullYear(), holidayDate.getMonth(), holidayDate.getDate()));
            newHoliday.specialDate = utcDate.toISOString();
            if (data.organizationCode) newHoliday.organizationCode = data.organizationCode;
            return newHoliday;
        });

        copyMutation.mutate(
            { specials: copiedDays, destinationYear: Number(data.destinationYear) },
            {
                onSuccess: () => { showSuccess('COPY_SUCCESS', 'Copied!', `Working day copied for ${data.destinationYear}`); setCopyModalOpen(false); selection.clearSelection(); copyForm.reset(); },
                onError: () => { showError('COPY_ERROR', 'Error', 'Failed to copy day.'); },
            }
        );
    };



    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={`Working Days ${displayYear}`}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }, { label: t('Working Days', 'Working Days') }]}
                actionLabel={t('Add Day', 'Add Day')}
                onAction={openAddModal}
            />

            {/* ── Search Filter ── */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    <FormField label={t('Year', 'Year')}>
                        <input type="text" {...searchForm.register("year")} className={ui.input} placeholder="e.g. 2026" />
                    </FormField>
                    <div className="flex items-center mb-2">
                        <input type="checkbox" id="isAnnualFilter" {...searchForm.register("isAnnual")} className="w-4 h-4 text-nv-violet rounded focus:ring-blue-500" />
                        <label htmlFor="isAnnualFilter" className="ml-2 text-sm text-gray-700">{t('Annual Day', 'Annual Day')}</label>
                    </div>
                    <FormField label={t('Day Name', 'Day Name')}>
                        <input type="text" {...searchForm.register("title")} className={ui.input} />
                    </FormField>
                    <FormField label={t('Organization', 'Organization')}>
                        <select {...searchForm.register("organizationCode")} className={ui.select}>
                            <option value="">{t('Select Organization', 'Select Organization')}</option>
                            {orgData?.map((org: any, idx: number) => (
                                <option key={org.organizationCode ?? `org-${idx}`} value={org.organizationCode}>{org.organizationCode}: {org.organizationName}</option>
                            ))}
                        </select>
                    </FormField>
                    <div className="lg:col-span-2 flex justify-end gap-3 mt-2">
                        <button type="button" onClick={onClearSearch} className={ui.btnSecondary}>
                            <X className="w-4 h-4 mr-1.5 inline" /> {t('Clear', 'Clear')}
                        </button>
                        <button type="button" className="px-5 py-2.5 bg-nv-violet text-white text-sm font-medium rounded-lg hover:bg-nv-violet-dark transition-all duration-150 shadow-sm flex items-center gap-2">
                            <Search className="w-4 h-4" /> {t('Search', 'Search')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 flex-wrap">
                    <button onClick={() => setCopyModalOpen(true)} disabled={selection.selectedCount === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-nv-violet hover:bg-nv-violet-dark text-white text-sm font-medium rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm">
                        <Copy className="w-4 h-4" /> {t('Copy Days', 'Copy Days')}
                    </button>
                    <ExportButtons
                        data={filteredData.map((d, i) => ({ ...d, _index: i + 1 }))}
                        columns={exportColumns}
                        filenamePrefix="working_days"
                        pdfTitle={`${t('Working Days', 'Working Days')} ${displayYear}`}
                        totalLabel={`${t('Total', 'Total')} ${filteredData.length}`}
                        selectedData={selection.getSelectedRows(filteredData)}
                        selectedCount={selection.selectedCount}
                        onClearSelection={selection.clearSelection}
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    {t('Show', 'Show')}
                    <select className="px-2 py-1 border border-gray-200 rounded-md bg-white text-sm outline-none" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); changePgSize(Number(e.target.value)); }}>
                        <option value="10">10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option>
                    </select>
                    {t('Entries', 'Entries')}
                </div>
            </div>

            {/* ── Table ── */}
            <div className={ui.tableWrapper}>
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap text-sm">
                        <thead className={ui.thead}>
                            <tr>
                                    <SelectAllCheckbox checked={selection.allSelected} indeterminate={selection.indeterminate} onChange={selection.toggleAll} />
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Day Name', 'Day Name')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Date', 'Date')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Day', 'Day')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Annual Day', 'Annual Day')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Organization', 'Organization')}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Action', 'Action')}</th>
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {isLoading ? (
                                <tr><td colSpan={9}><LoadingSpinner /></td></tr>
                            ) : paginatedData.length === 0 ? (
                                <tr><td colSpan={9}><EmptyState message={t('No data found', 'No data found')} /></td></tr>
                            ) : (
                                paginatedData.map((holiday, idx) => (
                                    <tr key={holiday.specialDaysId ?? `wd-${idx}`} className={selection.isSelected(holiday.specialDaysId) ? ui.trSelected : ui.tr}>
                                        <RowCheckbox checked={selection.isSelected(holiday.specialDaysId)} onChange={() => selection.toggle(holiday.specialDaysId)} />
                                        <td className="px-4 py-3 text-gray-500">{startIndex + idx}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{currentLang === 'th' ? (holiday.titleTh || holiday.titleEn) : (holiday.titleEn || holiday.titleTh)}</td>
                                        <td className={ui.td}>{holiday.specialDate ? format(new Date(holiday.specialDate), "dd/MM/yyyy") : "-"}</td>
                                        <td className={ui.td}>{holiday.day}</td>
                                        <td className="px-4 py-3 text-center">
                                            {holiday.isAnnual ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={currentLang === 'th' ? (holiday.organizationNameTh || holiday.organizationNameEn || "") : (holiday.organizationNameEn || "")}>{currentLang === 'th' ? (holiday.organizationNameTh || holiday.organizationNameEn) : holiday.organizationNameEn}</td>
                                        <td className={ui.tdActions}>
                                            <button onClick={() => openEditModal(holiday)} className="p-1.5 text-gray-400 hover:text-nv-violet hover:bg-nv-violet-light rounded-md transition" title={t('Edit', 'Edit')}>
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => confirmDelete(holiday.specialDaysId)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition" title={t('Delete', 'Delete')}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={filteredData.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>

            {/* ── Add/Edit Modal ── */}
            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={`${editingDay ? "Edit" : "Add"} Working Day`}
                maxWidth="max-w-lg"
                footer={
                    <>
                        <button type="button" onClick={() => setModalOpen(false)} className={`flex-1 ${ui.btnSecondary}`}>{t('Cancel', 'Cancel')}</button>
                        <button type="button" onClick={holidayForm.handleSubmit(onSubmit)} disabled={updateMutation.isPending} className={`flex-1 ${ui.btnPrimary}`}>
                            {updateMutation.isPending ? "Saving..." : "Submit"}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <FormField label={t('Day Name Th', 'Day Name Th')} required>
                        <input type="text" {...holidayForm.register("titleTh", { required: true })} className={ui.input} />
                    </FormField>
                    <FormField label={t('Day Name En', 'Day Name En')} required>
                        <input type="text" {...holidayForm.register("titleEn", { required: true })} className={ui.input} />
                    </FormField>
                    <FormField label={t('Date', 'Date')} required>
                        <input type="date" {...holidayForm.register("specialDate", { required: true })} className={ui.input} />
                    </FormField>
                    <FormField label={t('Organization', 'Organization')} required>
                        <select {...holidayForm.register("organizationCode")} className={ui.select}>
                            <option value="">{t('Select Organization', 'Select Organization')}</option>
                            {orgData?.map((org: any, idx: number) => (
                                <option key={org.organizationCode ?? `org-${idx}`} value={org.organizationCode}>{org.organizationCode}: {org.organizationName}</option>
                            ))}
                        </select>
                    </FormField>
                </div>
            </ModalWrapper>

            {/* ── Copy Modal ── */}
            <ModalWrapper
                open={copyModalOpen}
                onClose={() => setCopyModalOpen(false)}
                title={t('Copy Days', 'Copy Days')}
                maxWidth="max-w-md"
                footer={
                    <>
                        <button type="button" onClick={() => setCopyModalOpen(false)} className={`flex-1 ${ui.btnSecondary}`}>{t('Cancel', 'Cancel')}</button>
                        <button type="button" onClick={copyForm.handleSubmit(onCopy)} disabled={copyMutation.isPending}
                            className={`flex-1 flex items-center justify-center gap-2 ${ui.btnPrimary}`}>
                            {copyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />} Copy
                        </button>
                    </>
                }
            >
                <p className="text-sm text-gray-600 mb-4 bg-nv-violet-light/50 p-3 rounded-lg">
                    You are about to copy {selection.selectedCount} selected day(s).
                </p>
                <div className="space-y-4">
                    <FormField label={t('Destination Year', 'Destination Year')} required>
                        <input type="number" {...copyForm.register("destinationYear", { required: true })} className={ui.input} placeholder="e.g. 2027" />
                    </FormField>
                    <FormField label={t('Organization To', 'Organization To')}>
                        <select {...copyForm.register("organizationCode")} className={ui.select}>
                            <option value="">Original Organization (No Change)</option>
                            {orgData?.map((org: any, idx: number) => (
                                <option key={org.organizationCode ?? `org-${idx}`} value={org.organizationCode}>{org.organizationCode}: {org.organizationName}</option>
                            ))}
                        </select>
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
