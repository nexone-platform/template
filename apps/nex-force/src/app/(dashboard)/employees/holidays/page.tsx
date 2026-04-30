"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useUpdateHoliday, useDeleteHoliday, useSearchHolidays, useCopyHoliday } from "@/features/employees/hooks/use-employees";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import { useMessages } from "@/hooks/use-messages";
import { Pencil, Trash2, Search, X, Copy, Loader2, Check } from "lucide-react";
import { format } from "date-fns";
import { useOrganizationData } from "@/hooks/use-organization";
import { getUserProfile } from "@/lib/auth";
import { holidayService } from "@/services/organization.service";
import ExportButtons from "@/components/ExportButtons";
import ImportExcelButton from "@/components/ImportExcelButton";
import type { ExportColumn } from "@/lib/table-export";
import { PageHeader, ModalWrapper, FormField, LoadingSpinner, EmptyState, PaginationBar, ui, SelectAllCheckbox, RowCheckbox } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function HolidaysPage() {
    const { t, currentLang } = usePageTranslation();
    const { showError, showConfirm } = useMessages();
    const { data: organizations } = useOrganizationData();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Holiday Name En', 'Holiday Name En'), key: "titleEn" },
        { header: t('Holiday Date', 'Holiday Date'), key: "holidayDate", format: (v: any) => v ? new Date(v).toLocaleDateString("en-GB") : "-" },
        { header: t('Day', 'Day'), key: "day" },
        { header: t('Annual Day', 'Annual Day'), key: "isAnnual", format: (v: any) => v ? t('Yes', 'Yes') : t('No', 'No') },
        { header: t('Organization', 'Organization'), key: "organizationNameEn" },
    ];
    const updateMutation = useUpdateHoliday();
    const deleteMutation = useDeleteHoliday();
    const searchMutation = useSearchHolidays();
    const copyMutation = useCopyHoliday();

    const [holidays, setHolidays] = useState<any[]>([]);


    // Modals
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCopyOpen, setIsCopyOpen] = useState(false);
    const [editingHoliday, setEditingHoliday] = useState<any>(null);

    // Search Form — matches Angular's createSearchForm
    const currentYear = new Date().getFullYear();
    const searchForm = useForm({
        defaultValues: {
            year: "" as string,
            title: "",
            organizationCode: "" as string,
            isAnnual: null as boolean | null,
        }
    });

    // Auto-search on mount — matches Angular's createSearchForm → onSearch()
    useEffect(() => {
        doSearch({
            year: "",
            title: "",
            organizationCode: "",
            isAnnual: null,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const doSearch = (data: any) => {
        const payload: any = {};

        // Angular: if (formValues.year) this.year = formValues.year;
        if (data.year) {
            payload.year = data.year;
        }

        if (data.title) {
            payload.title = data.title;
        }

        // Angular: if (formValues.organizationCode === 0) formValues.organizationCode = null;
        if (data.organizationCode && data.organizationCode !== "0") {
            payload.organizationCode = data.organizationCode;
        }

        if (data.isAnnual !== null && data.isAnnual !== undefined) {
            payload.isAnnual = data.isAnnual;
        }

        searchMutation.mutate(payload, {
            onSuccess: (res) => {
                // Angular sorts by holidayDate asc — backend also already sorts
                const sorted = (res.data || []).sort((a: any, b: any) =>
                    new Date(a.holidayDate).getTime() - new Date(b.holidayDate).getTime()
                );
                setHolidays(sorted);
                goToPage(1);
            }
        });
    };

    const onSearch = (data: any) => {
        doSearch(data);
    };

    // Angular: clear() — resets search form and re-searches
    const onClearSearch = () => {
        searchForm.reset({
            year: "",
            title: "",
            organizationCode: "",
            isAnnual: null,
        });
        doSearch({
            year: "",
            title: "",
            organizationCode: "",
            isAnnual: null,
        });
    };

    const { paginatedData, currentPage, totalPages, goToPage, changePageSize: setPageSize, pageSize, totalData: totalItems } = usePagination(holidays);

    // ── Row Selection ──
    const getRowId = useCallback((holiday: any) => holiday.holidayId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const startIndex = (currentPage - 1) * pageSize + 1;

    // Year display — matches Angular: {{ "Holidays" | translate }} {{ year }}
    const displayYear = searchForm.watch("year") || currentYear;

    // ============ Add/Edit Form — matches Angular createHolidayForm ============
    const holidayForm = useForm({
        defaultValues: {
            holidayId: 0,
            titleTh: "",
            titleEn: "",
            holidayDate: "",
            organizationCode: "",
            isAnnual: true,
            isActive: true,
        }
    });

    // Angular: openEditModal('add')
    const openAddModal = () => {
        holidayForm.reset({
            holidayId: 0,
            titleTh: "",
            titleEn: "",
            holidayDate: "",
            organizationCode: "",
            isAnnual: true,
            isActive: true,
        });
        setEditingHoliday(null);
        setIsFormOpen(true);
    };

    // Angular: openEditModal('edit', row) → patchForm(data)
    const openEditModal = (holiday: any) => {
        holidayForm.reset({
            holidayId: holiday.holidayId,
            titleTh: holiday.titleTh || "",
            titleEn: holiday.titleEn || "",
            holidayDate: holiday.holidayDate ? new Date(holiday.holidayDate).toISOString().split('T')[0] : "",
            organizationCode: holiday.organizationCode || "",
            isAnnual: holiday.isAnnual ?? true,
            isActive: holiday.isActive ?? true,
        });
        setEditingHoliday(holiday);
        setIsFormOpen(true);
    };

    // Angular: onSubmit() — matches createOrUpdateEmployee API
    const onSaveHoliday = (data: any) => {
        const username = getUserProfile() || "System";

        // Angular: if (this.mode === 'add') formData.holidayId = 0;
        if (!editingHoliday) {
            data.holidayId = 0;
        }

        // Angular: force UTC date
        const date = new Date(data.holidayDate);
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

        // Angular: formData.day = this.getDay(formData.holidayDate);
        const dayName = format(utcDate, "EEEE"); // e.g. "Monday"

        const payload = {
            ...data,
            holidayDate: utcDate.toISOString(),
            day: dayName,
            username,
        };

        updateMutation.mutate(payload, {
            onSuccess: () => {
                setIsFormOpen(false);
                doSearch(searchForm.getValues());
            }
        });
    };

    // Angular: deleteData(id) → Swal confirm → deleteData(selectedId)
    const confirmDelete = (id: number) => {
        showConfirm('HOLIDAY_DELETE_CONFIRM', () => {
            deleteMutation.mutate(id, {
                onSuccess: () => {
                    doSearch(searchForm.getValues());
                }
            });
        }, { fallbackTitle: 'Delete Holiday', fallbackMsg: 'Are you sure you want to delete this holiday?' });
    };

    // ============ Copy Form — matches Angular createCopyForm + copy() ============
    const copyForm = useForm({
        defaultValues: {
            destinationYear: "",
            organizationCode: "",
        }
    });

    // Angular: copy()
    const onCopyHolidays = (data: any) => {
        if (!data.destinationYear || Number(data.destinationYear) < currentYear) {
            showError('INVALID_YEAR', 'Error', 'Please provide a valid destination year.');
            return;
        }

        // Angular: filteredHolidays = this.holidayData.filter(h => this.selectedRows.includes(h.holidayId))
        const selectedHolidaysData = selection.getSelectedRows(holidays);
        if (selectedHolidaysData.length === 0) {
            showError('NO_ITEM_SELECTED', 'Error', 'No holidays found matching the criteria.');
            return;
        }

        const username = getUserProfile() || "System";

        // Angular: builds copiedHolidays with UTC dates and new year
        const copiedList = selectedHolidaysData.map(h => {
            const holidayDate = new Date(h.holidayDate);
            holidayDate.setFullYear(Number(data.destinationYear));

            // Force UTC 00:00 — matches Angular logic exactly
            const utcDate = new Date(Date.UTC(
                holidayDate.getFullYear(),
                holidayDate.getMonth(),
                holidayDate.getDate()
            ));

            return {
                ...h,
                holidayDate: utcDate.toISOString(),
                organizationCode: data.organizationCode || h.organizationCode,
                username,
            };
        });

        copyMutation.mutate({ holidays: copiedList, destinationYear: Number(data.destinationYear) }, {
            onSuccess: () => {
                setIsCopyOpen(false);
                selection.clearSelection();
                copyForm.reset();
                doSearch(searchForm.getValues());
            }
        });
    };



    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={`${t('Holidays', 'Holidays')} ${displayYear}`}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }, { label: t('Holidays', 'Holidays') }]}
                actionLabel={t('Add Holiday', 'Add Holiday')}
                onAction={openAddModal}
            />

            {/* Filter Section — matches Angular search form */}
            <div className={ui.filterCard}>
                <form onSubmit={searchForm.handleSubmit(onSearch)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                    <FormField label={t('Year', 'Year')}>
                        <input type="text" {...searchForm.register("year")} className={ui.input} placeholder="e.g. 2026" />
                    </FormField>
                    <div className="flex items-center mb-2">
                        <input type="checkbox" id="isAnnualFilter" {...searchForm.register("isAnnual")} className="w-4 h-4 text-nv-violet rounded focus:ring-blue-500" />
                        <label htmlFor="isAnnualFilter" className="ml-2 text-sm text-gray-700">{t('Annual Day', 'Annual Day')}</label>
                    </div>
                    <FormField label={t('Holiday Name En', 'Holiday Name En')}>
                        <input type="text" {...searchForm.register("title")} className={ui.input} />
                    </FormField>
                    <FormField label={t('Organization', 'Organization')}>
                        <select {...searchForm.register("organizationCode")} className={ui.select}>
                            <option value="">{t('Select Organization', 'Select Organization')}</option>
                            {organizations?.map((org: any, idx: number) => (
                                <option key={org.organizationId ?? `org-${idx}`} value={org.organizationCode}>
                                    {org.organizationCode}: {org.organizationName}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <div className="lg:col-span-2 flex justify-end gap-3 mt-2">
                        <button type="button" onClick={onClearSearch} className={ui.btnSecondary}>
                            <X className="w-4 h-4 mr-1.5 inline" /> {t('Clear', 'Clear')}
                        </button>
                        <button type="submit" disabled={searchMutation.isPending} className="px-5 py-2.5 bg-nv-violet text-white text-sm font-medium rounded-lg hover:bg-nv-violet-dark disabled:opacity-70 transition-all duration-150 shadow-sm flex items-center gap-2">
                            {searchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} {t('Search', 'Search')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Actions Bar — matches Angular Copy Holiday + Show entries */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 flex-wrap">
                    <button
                        onClick={() => setIsCopyOpen(true)}
                        disabled={selection.selectedCount === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-nv-violet hover:bg-nv-violet-dark text-white text-sm font-medium rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Copy className="w-4 h-4" /> {t('Copy Holiday', 'Copy Holiday')}
                    </button>
                    <ExportButtons
                        data={holidays.map((h: any, i: number) => ({ ...h, _index: i + 1 }))}
                        columns={exportColumns}
                        filenamePrefix="holidays"
                        pdfTitle={`${t('Holidays', 'Holidays')} ${displayYear}`}
                        totalLabel={`${t('Total', 'Total')} ${holidays.length}`}
                        selectedData={selection.getSelectedRows(holidays)}
                        selectedCount={selection.selectedCount}
                        onClearSelection={selection.clearSelection}
                    />
                    <ImportExcelButton
                        columns={[
                            { header: "Holiday Name (TH)", key: "title", required: true },
                            { header: "Holiday Date", key: "holidayDate", required: true },
                            { header: "Day", key: "day" },
                            { header: "Organization Code", key: "organizationCode" },
                            { header: "Annual", key: "isAnnual" },
                        
                        { header: "Holiday Name En", key: "titleEn" },
                        { header: "Organization", key: "organizationNameEn" },]}
                        filenamePrefix="holidays"
                        onImport={(rows) => holidayService.bulkImport(rows)}
                        onImportComplete={() => doSearch(searchForm.getValues())}
                    />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    {t('Show', 'Show')}
                    <select
                        className="px-2 py-1 border border-gray-200 rounded-md bg-white text-sm outline-none"
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    {t('Entries', 'Entries')}
                </div>
            </div>

            {/* Table — matches Angular table structure */}
            <div className={ui.tableWrapper}>
                <div className="overflow-x-auto">
                    <table className={ui.table}>
                        <thead className={ui.thead}>
                            <tr>
                                    <SelectAllCheckbox checked={selection.allSelected} indeterminate={selection.indeterminate} onChange={selection.toggleAll} />
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{currentLang === 'th' ? t('Holiday Name Th', 'Holiday Name Th') : t('Holiday Name En', 'Holiday Name En')}</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('Holiday Date', 'Holiday Date')}</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('Day', 'Day')}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('Annual Day', 'Annual Day')}</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t('Organization', 'Organization')}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('Action', 'Action')}</th>
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {searchMutation.isPending ? (
                                <tr>
                                    <td colSpan={9}><LoadingSpinner /></td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={9}><EmptyState message={t('No Data Found', 'No Data Found')} /></td>
                                </tr>
                            ) : (
                                paginatedData.map((holiday, i) => (
                                    <tr key={holiday.holidayId} className={selection.isSelected(holiday.holidayId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(holiday.holidayId)} onChange={() => selection.toggle(holiday.holidayId)} />
                                        <td className={ui.tdIndex}>{startIndex + i}</td>
                                        <td className={ui.tdBold}>{currentLang === 'th' ? (holiday.titleTh || holiday.titleEn) : (holiday.titleEn || holiday.titleTh)}</td>
                                        <td className={ui.td}>{holiday.holidayDate ? format(new Date(holiday.holidayDate), "dd/MM/yyyy") : "-"}</td>
                                        <td className={ui.td}>{holiday.day}</td>
                                        <td className="px-4 py-3 text-center">
                                            {holiday.isAnnual ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={currentLang === 'th' ? (holiday.organizationNameTh || holiday.organizationNameEn || "") : (holiday.organizationNameEn || "")}>
                                            {currentLang === 'th' ? (holiday.organizationNameTh || holiday.organizationNameEn) : holiday.organizationNameEn}
                                        </td>
                                        <td className={ui.tdActions}>
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => openEditModal(holiday)} className="p-1.5 bg-gray-100 hover:bg-nv-violet-light text-gray-600 hover:text-nv-violet rounded-md transition" title={t('Edit', 'Edit')}>
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => confirmDelete(holiday.holidayId)} className="p-1.5 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-md transition" title={t('Delete', 'Delete')}>
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {paginatedData.length > 0 && (
                    <PaginationBar
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalData={totalItems}
                        pageSize={pageSize}
                        onGoToPage={goToPage}
                    />
                )}
            </div>

            {/* Add/Edit Modal — matches Angular add_holiday modal */}
            <ModalWrapper
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingHoliday ? t('Edit Holiday', 'Edit Holiday') : t('Add Holiday', 'Add Holiday')}
                maxWidth="max-w-lg"
                footer={
                    <>
                        <button type="button" onClick={() => setIsFormOpen(false)} className={`${ui.btnSecondary} flex-1`}>{t('Cancel', 'Cancel')}</button>
                        <button type="submit" form="holidayForm" disabled={updateMutation.isPending} className={`${ui.btnPrimary} flex-1`}>
                            {updateMutation.isPending ? t('Saving...', 'Saving...') : t('Submit', 'Submit')}
                        </button>
                    </>
                }
            >
                <form id="holidayForm" onSubmit={holidayForm.handleSubmit(onSaveHoliday)} className="space-y-4">
                    <FormField label={t('Holiday Name Th', 'Holiday Name Th')} required>
                        <input type="text" {...holidayForm.register("titleTh", { required: true })} className={ui.input} />
                    </FormField>
                    <FormField label={t('Holiday Name En', 'Holiday Name En')} required>
                        <input type="text" {...holidayForm.register("titleEn", { required: true })} className={ui.input} />
                    </FormField>
                    <FormField label={t('Holiday Date', 'Holiday Date')} required>
                        <input type="date" {...holidayForm.register("holidayDate", { required: true })} className={ui.input} />
                    </FormField>
                    <FormField label={t('Organization', 'Organization')} required>
                        <select {...holidayForm.register("organizationCode")} className={ui.select}>
                            <option value="">{t('Select Organization', 'Select Organization')}</option>
                            {organizations?.map((org: any, idx: number) => (
                                <option key={org.organizationId ?? `org-${idx}`} value={org.organizationCode}>
                                    {org.organizationCode}: {org.organizationName}
                                </option>
                            ))}
                        </select>
                    </FormField>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="isAnnual" {...holidayForm.register("isAnnual")} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nv-violet"></div>
                            </label>
                            <label htmlFor="isAnnual" className="text-sm text-gray-700">{t('Annual Day', 'Annual Day')}</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="isActive" {...holidayForm.register("isActive")} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                            <label htmlFor="isActive" className="text-sm text-gray-700">{t('Active', 'Active')}</label>
                        </div>
                    </div>
                </form>
            </ModalWrapper>

            {/* Copy Holiday Modal — matches Angular copy_holiday modal */}
            <ModalWrapper
                open={isCopyOpen}
                onClose={() => setIsCopyOpen(false)}
                title={t('Copy Holidays', 'Copy Holidays')}
                maxWidth="max-w-md"
                footer={
                    <>
                        <button type="button" onClick={() => setIsCopyOpen(false)} className={`${ui.btnSecondary} flex-1`}>{t('Cancel', 'Cancel')}</button>
                        <button type="submit" form="copyForm" disabled={copyMutation.isPending} className="flex-1 px-5 py-2.5 bg-nv-violet text-white text-sm font-medium rounded-lg hover:bg-nv-violet-dark disabled:opacity-50 shadow-sm transition-all duration-150 flex items-center justify-center gap-2">
                            {copyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />} {t('Copy', 'Copy')}
                        </button>
                    </>
                }
            >
                <div className="text-sm text-gray-600 mb-4 bg-nv-violet-light/50 p-3 rounded-lg">
                    {t('You are about to copy', 'You are about to copy')} {selection.selectedCount} {t('selected holiday(s)', 'selected holiday(s)')}.
                </div>
                <form id="copyForm" onSubmit={copyForm.handleSubmit(onCopyHolidays)} className="space-y-4">
                    <FormField label={t('Destination Year', 'Destination Year')} required>
                        <input type="number" {...copyForm.register("destinationYear", { required: true })} className={ui.input} placeholder="e.g. 2027" />
                    </FormField>
                    <FormField label={t('Organization To', 'Organization To')}>
                        <select {...copyForm.register("organizationCode")} className={ui.select}>
                            <option value="">{t('Original Organization (No Change)', 'Original Organization (No Change)')}</option>
                            {organizations?.map((org: any, idx: number) => (
                                <option key={org.organizationId ?? `org-${idx}`} value={org.organizationCode}>
                                    {org.organizationCode}: {org.organizationName}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </form>
            </ModalWrapper>
        </div>
    );
}
