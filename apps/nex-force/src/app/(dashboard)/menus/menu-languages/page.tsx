"use client";

import { useState, useMemo, useCallback } from "react";
import apiClient from "@/lib/api-client";
import {
    useLabelList,
    useUpdateLabel,
    usePageKeys,
    TranslationDto
} from "@/hooks/use-menu-admin";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMessages } from "@/hooks/use-messages";
import { ROUTES } from "@/lib/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useRowSelection } from "@/hooks/use-row-selection";
import ExportButtons from "@/components/ExportButtons";
import ImportExcelButton from "@/components/ImportExcelButton";
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
    ui, RowCheckbox,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

type AnyRow = Record<string, any>;

export default function MenuLanguagesPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError } = useMessages();

    const exportColumns: ExportColumn[] = [
        { header: "#", key: "_index" },
        { header: t('Page Key', 'Page Key'), key: "pageKey" },
        { header: t('Label Key', 'Label Key'), key: "labelKey" },
        { header: t('Label Value', 'Label Value'), key: "labelValue" },
        { header: t('Language', 'Language'), key: "languageCode" },
    ];

    const tableColumns = [
    { key: "#", label: "#", width: "w-14" },
    { key: "pageKey", label: t('Page Key', 'Page Key'), sortable: true },
    { key: "labelKey", label: t('Label Key', 'Label Key'), sortable: true },
    { key: "labelValue", label: t('Value', 'Value'), sortable: true },
    { key: "languageCode", label: t('Language', 'Language'), sortable: true },
    { key: "action", label: t('Action', 'Action'), align: "right" as const },
    ];

    const [pageKeyFilter, setPageKeyFilter] = useState("");
    const [languageCodeFilter, setLanguageCodeFilter] = useState("");
    const [labelKeyFilter, setLabelKeyFilter] = useState("");

    const searchPayload = { pageKey: pageKeyFilter, languageCode: languageCodeFilter, labelKey: labelKeyFilter, labelValue: "" };

    const { data: labels, isLoading } = useLabelList(searchPayload);
    const { data: pageKeys } = usePageKeys();
    const updateMutation = useUpdateLabel();

    const [searchText, setSearchText] = useState("");
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [pageSize, setPageSize] = useState(10);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTranslation, setSelectedTranslation] = useState<TranslationDto | null>(null);

    const { register, handleSubmit, reset } = useForm();

    const list: TranslationDto[] = useMemo(() => labels ?? [], [labels]);

    const filtered = useMemo(() => {
        if (!searchText) return list;
        const q = searchText.toLowerCase();
        return list.filter(
            (d) =>
                d.pageKey?.toLowerCase().includes(q) ||
                d.labelKey?.toLowerCase().includes(q) ||
                d.labelValue?.toLowerCase().includes(q)
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
        paginatedData, currentPage, totalPages, goToPage, changePageSize: changePgSize,
    } = usePagination(sorted, { pageSize });


    // โ”€โ”€ Row Selection โ”€โ”€
    const getRowId = useCallback((d: any) => d.translationsId, []);
    const selection = useRowSelection(paginatedData, getRowId);
    const handleSort = (key: string) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const openModal = (translation?: TranslationDto) => {
        if (translation) {
            setSelectedTranslation(translation);
            reset({ translationsId: translation.translationsId, pageKey: translation.pageKey, languageCode: translation.languageCode, labelKey: translation.labelKey, labelValue: translation.labelValue });
        } else {
            setSelectedTranslation(null);
            reset({ translationsId: 0, pageKey: pageKeyFilter || "", languageCode: languageCodeFilter || "en-US", labelKey: "", labelValue: "" });
        }
        setModalOpen(true);
    };

    const onSubmit = (data: Partial<TranslationDto>) => {
        updateMutation.mutate(data, {
            onSuccess: () => { showSuccess('SAVE_SUCCESS', 'Success!', 'Translation saved.'); setModalOpen(false); },
            onError: () => showError('SAVE_ERROR', 'Error!', 'Failed to save translation.'),
        });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader title={t('Menu Languages', 'Menu Languages')} breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Menu Languages', 'Menu Languages') }]} actionLabel={t('Add', 'Add')} onAction={() => openModal()} />

            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label={t('Page Key', 'Page Key')}>
                        <select className={ui.select} value={pageKeyFilter} onChange={(e) => setPageKeyFilter(e.target.value)}>
                            <option value="">{t('All Pages', 'All Pages')}</option>
                            {pageKeys?.map((key: string) => (<option key={key} value={key}>{key}</option>))}
                        </select>
                    </FormField>
                    <FormField label={t('Language', 'Language')}>
                        <select className={ui.select} value={languageCodeFilter} onChange={(e) => setLanguageCodeFilter(e.target.value)}>
                            <option value="">{t('All Languages', 'All Languages')}</option>
                            <option value="en">English (en)</option>
                            <option value="th">Thai (th)</option>
                            <option value="ja-JP">Japanese (ja)</option>
                            <option value="zh-CN">Chinese (cn)</option>
                        </select>
                    </FormField>
                    <FormField label={t('Label Key', 'Label Key')}>
                        <input type="text" placeholder="Search label key..." className={ui.input} value={labelKeyFilter} onChange={(e) => setLabelKeyFilter(e.target.value)} />
                    </FormField>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <ExportButtons data={sorted.map((d, i) => ({ ...d, _index: i + 1 }))} columns={exportColumns} filenamePrefix="menu_languages" pdfTitle={t('Menu Languages', 'Menu Languages')} totalCount={sorted.length}
                    selectedData={selection.getSelectedRows(sorted)}
                    selectedCount={selection.selectedCount}
                    onClearSelection={selection.clearSelection}
                />
                <ImportExcelButton
                    columns={[
                        { header: "Page Key", key: "pageKey", required: true },
                        { header: "Language Code", key: "languageCode", required: true },
                        { header: "Label Key", key: "labelKey", required: true },
                        { header: "Label Value", key: "labelValue", required: true },
                    ]}
                    filenamePrefix="menu_languages"
                    onImport={async (rows) => {
                        let success = 0, failed = 0;
                        const username = localStorage.getItem("username");
                        for (const row of rows) {
                            try {
                                await apiClient.post("translations/update", {
                                    translationsId: 0,
                                    pageKey: row.pageKey ?? "",
                                    languageCode: row.languageCode ?? "en",
                                    labelKey: row.labelKey ?? "",
                                    labelValue: row.labelValue ?? "",
                                    username,
                                });
                                success++;
                            } catch { failed++; }
                        }
                        return { success, failed };
                    }}
                />
            </div>

            <div className={ui.tableWrapper}>
                <TableHeaderBar pageSize={pageSize} onPageSizeChange={(v) => { setPageSize(v); changePgSize(v); }} searchText={searchText} onSearchChange={setSearchText} />

                {isLoading ? <LoadingSpinner /> : (
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}><tr>{tableColumns.map((col) => (<SortableTh key={col.key} column={col} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />))}</tr></thead>
                            <tbody className={ui.tbody}>
                                {paginatedData.length > 0 ? paginatedData.map((d: AnyRow, idx: number) => (
                                    <tr key={d.translationsId} className={selection.isSelected(d.translationsId) ? ui.trSelected : ui.tr}>
                                            <RowCheckbox checked={selection.isSelected(d.translationsId)} onChange={() => selection.toggle(d.translationsId)} />
                                        <td className={ui.tdIndex}>{(currentPage - 1) * pageSize + idx + 1}</td>
                                        <td className={ui.td}><span className="px-2 py-0.5 text-xs font-medium rounded bg-nv-violet-light text-nv-violet border border-emerald-100">{d.pageKey}</span></td>
                                        <td className={ui.td}><span className="font-mono text-xs">{d.labelKey}</span></td>
                                        <td className={ui.tdBold}>{d.labelValue}</td>
                                        <td className={ui.td}><span className="px-2 py-0.5 text-xs font-medium rounded bg-nv-violet-light text-nv-violet border border-blue-100">{d.languageCode}</span></td>
                                        <td className={ui.tdActions}><ActionButtons onEdit={() => openModal(d as TranslationDto)} /></td>
                                    </tr>
                                )) : <EmptyState colSpan={7} />}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationBar currentPage={currentPage} totalPages={totalPages} totalData={sorted.length} pageSize={pageSize} onGoToPage={goToPage} />
            </div>

            <ModalWrapper open={modalOpen} onClose={() => setModalOpen(false)} title={selectedTranslation ? t('Edit Translation', 'Edit Translation') : t('Add Translation', 'Add Translation')} maxWidth="max-w-md"
                footer={<button onClick={handleSubmit(onSubmit)} disabled={updateMutation.isPending} className={ui.btnPrimary}>{updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin inline mr-2" />}{t('Submit', 'Submit')}</button>}>
                <div className="space-y-4">
                    <FormField label={t('Page Key', 'Page Key')} required>
                        <select {...register("pageKey", { required: true })} className={ui.select}>
                            <option value="">{t('Select Page', 'Select Page')}</option>
                            {pageKeys?.map((key: string) => (<option key={key} value={key}>{key}</option>))}
                        </select>
                    </FormField>
                    <FormField label={t('Language', 'Language')} required>
                        <select {...register("languageCode", { required: true })} className={ui.select}>
                            <option value="en">English (en)</option>
                            <option value="th">Thai (th)</option>
                        </select>
                    </FormField>
                    <FormField label={t('Label Key', 'Label Key')} required>
                        <input {...register("labelKey", { required: true })} className={ui.input} placeholder="e.g. UI_HEADER_TITLE" />
                    </FormField>
                    <FormField label={t('Label Value', 'Label Value')} required>
                        <textarea {...register("labelValue", { required: true })} className={ui.textarea} placeholder="Enter translated value..." rows={4} />
                    </FormField>
                </div>
            </ModalWrapper>
        </div>
    );
}
