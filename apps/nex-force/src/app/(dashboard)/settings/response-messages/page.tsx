"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Pencil, Trash2, Search, X, Languages, MessageSquare } from "lucide-react";
import Swal from "sweetalert2";
import { useResponseMessagesAdmin, type ResponseMessage } from "@/hooks/use-messages";
import { useLanguage } from "@/lib/language";
import { usePagination } from "@/hooks/use-pagination";
import { getUserProfile } from "@/lib/auth";
import {
    PageHeader, ModalWrapper, FormField, LoadingSpinner, EmptyState, PaginationBar, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

const CATEGORIES = [
    { value: "success", label: "Success", color: "bg-green-100 text-green-700" },
    { value: "error", label: "Error", color: "bg-red-100 text-red-700" },
    { value: "warning", label: "Warning", color: "bg-yellow-100 text-yellow-700" },
    { value: "confirm", label: "Confirm", color: "bg-blue-100 text-blue-700" },
    { value: "info", label: "Info", color: "bg-gray-100 text-gray-600" },
];

function getCategoryBadge(category: string) {
    const cat = CATEGORIES.find(c => c.value === category);
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cat?.color || "bg-gray-100 text-gray-600"}`}>
            {cat?.label || category}
        </span>
    );
}

export default function ResponseMessagesPage() {
    const { t } = usePageTranslation();
    const { languages } = useLanguage();
    const { messages, isLoading, updateMutation, deleteMutation } = useResponseMessagesAdmin();

    // ── Search / Filter ──
    const [searchKey, setSearchKey] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterLang, setFilterLang] = useState("");

    const filteredData = useMemo(() => {
        return messages.filter((m: ResponseMessage) => {
            const matchKey = !searchKey || m.messageKey.toLowerCase().includes(searchKey.toLowerCase()) || m.message.toLowerCase().includes(searchKey.toLowerCase());
            const matchCat = !filterCategory || m.category === filterCategory;
            const matchLang = !filterLang || m.languageCode === filterLang;
            return matchKey && matchCat && matchLang;
        });
    }, [messages, searchKey, filterCategory, filterLang]);

    const { paginatedData, currentPage, totalPages, goToPage, changePageSize, pageSize, totalData } = usePagination(filteredData);
    const startIndex = (currentPage - 1) * pageSize + 1;

    // ── Modal ──
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ResponseMessage | null>(null);

    const form = useForm({
        defaultValues: {
            messageId: 0,
            languageCode: "en",
            messageKey: "",
            category: "success",
            title: "",
            message: "",
            isActive: true,
        },
    });

    const openAddModal = () => {
        form.reset({
            messageId: 0, languageCode: "en", messageKey: "",
            category: "success", title: "", message: "", isActive: true,
        });
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const openEditModal = (item: ResponseMessage) => {
        form.reset({
            messageId: item.messageId,
            languageCode: item.languageCode,
            messageKey: item.messageKey,
            category: item.category,
            title: item.title || "",
            message: item.message || "",
            isActive: item.isActive,
        });
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const onSave = (data: any) => {
        const username = getUserProfile() || "System";
        updateMutation.mutate(
            { ...data, username },
            {
                onSuccess: () => {
                    Swal.fire(t("Success!", "Success!"), t("Message saved successfully.", "Message saved successfully."), "success");
                    setIsFormOpen(false);
                },
                onError: () => {
                    Swal.fire(t("Error!", "Error!"), t("Error saving message.", "Error saving message."), "error");
                },
            }
        );
    };

    const confirmDelete = (id: number) => {
        Swal.fire({
            title: t("Delete Message", "Delete Message"),
            text: t("Are you sure you want to delete this message?", "Are you sure you want to delete this message?"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: t("Delete", "Delete"),
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id, {
                    onSuccess: () => Swal.fire(t("Deleted!", "Deleted!"), t("Message deleted.", "Message deleted."), "success"),
                    onError: () => Swal.fire(t("Error!", "Error!"), t("Error deleting message.", "Error deleting message."), "error"),
                });
            }
        });
    };

    // ── Group by messageKey for display ──
    const uniqueLangs = useMemo(() => {
        const langs = new Set(messages.map((m: ResponseMessage) => m.languageCode));
        return Array.from(langs).sort();
    }, [messages]);

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t("Response Messages", "Response Messages")}
                breadcrumbs={[{ label: t("Dashboard", "Dashboard") }, { label: t("Settings", "Settings") }, { label: t("Response Messages", "Response Messages") }]}
                actionLabel={t("Add Message", "Add Message")}
                onAction={openAddModal}
            />

            {/* ── Filters ── */}
            <div className={ui.filterCard}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <FormField label={t("Search", "Search")}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchKey}
                                onChange={(e) => setSearchKey(e.target.value)}
                                placeholder={t("Search by key or message...", "Search by key or message...")}
                                className={`${ui.input} pl-9`}
                            />
                        </div>
                    </FormField>
                    <FormField label={t("Category", "Category")}>
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={ui.select}>
                            <option value="">{t("All Categories", "All Categories")}</option>
                            {CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label={t("Language", "Language")}>
                        <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)} className={ui.select}>
                            <option value="">{t("All Languages", "All Languages")}</option>
                            {languages.map(l => (
                                <option key={l.code} value={l.code}>{l.name} ({l.code})</option>
                            ))}
                        </select>
                    </FormField>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => { setSearchKey(""); setFilterCategory(""); setFilterLang(""); }}
                            className={ui.btnSecondary}
                        >
                            <X className="w-4 h-4 mr-1 inline" /> {t("Clear", "Clear")}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4" />
                        {t("Total", "Total")}: <strong>{filteredData.length}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Languages className="w-4 h-4" />
                        {t("Languages", "Languages")}: <strong>{uniqueLangs.join(", ")}</strong>
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    {t("Show", "Show")}
                    <select
                        className="px-2 py-1 border border-gray-200 rounded-md bg-white text-sm outline-none"
                        value={pageSize}
                        onChange={(e) => changePageSize(Number(e.target.value))}
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    {t("Entries", "Entries")}
                </div>
            </div>

            {/* ── Table ── */}
            <div className={ui.tableWrapper}>
                <div className="overflow-x-auto">
                    <table className={ui.table}>
                        <thead className={ui.thead}>
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t("Language", "Language")}</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t("Message Key", "Message Key")}</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t("Category", "Category")}</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t("Title", "Title")}</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t("Message", "Message")}</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t("Active", "Active")}</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t("Action", "Action")}</th>
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {isLoading ? (
                                <tr><td colSpan={8}><LoadingSpinner /></td></tr>
                            ) : paginatedData.length === 0 ? (
                                <tr><td colSpan={8}><EmptyState message={t("No messages found", "No messages found")} /></td></tr>
                            ) : (
                                paginatedData.map((msg: ResponseMessage, i: number) => (
                                    <tr key={msg.messageId} className={ui.tr}>
                                        <td className={ui.tdIndex}>{startIndex + i}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-mono font-medium text-gray-700">
                                                {msg.languageCode.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm text-nv-violet font-medium">{msg.messageKey}</td>
                                        <td className="px-4 py-3">{getCategoryBadge(msg.category)}</td>
                                        <td className={ui.tdBold}>{msg.title}</td>
                                        <td className="px-4 py-3 text-gray-600 max-w-[300px] truncate" title={msg.message}>{msg.message}</td>
                                        <td className="px-4 py-3 text-center">
                                            {msg.isActive ? (
                                                <span className="w-2.5 h-2.5 inline-block rounded-full bg-green-500"></span>
                                            ) : (
                                                <span className="w-2.5 h-2.5 inline-block rounded-full bg-gray-300"></span>
                                            )}
                                        </td>
                                        <td className={ui.tdActions}>
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => openEditModal(msg)} className="p-1.5 bg-gray-100 hover:bg-nv-violet-light text-gray-600 hover:text-nv-violet rounded-md transition" title={t("Edit", "Edit")}>
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => confirmDelete(msg.messageId)} className="p-1.5 bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 rounded-md transition" title={t("Delete", "Delete")}>
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
                        totalData={totalData}
                        pageSize={pageSize}
                        onGoToPage={goToPage}
                    />
                )}
            </div>

            {/* ── Add/Edit Modal ── */}
            <ModalWrapper
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingItem ? t("Edit Message", "Edit Message") : t("Add Message", "Add Message")}
                maxWidth="max-w-lg"
                footer={
                    <>
                        <button type="button" onClick={() => setIsFormOpen(false)} className={`${ui.btnSecondary} flex-1`}>
                            {t("Cancel", "Cancel")}
                        </button>
                        <button type="submit" form="msgForm" disabled={updateMutation.isPending} className={`${ui.btnPrimary} flex-1`}>
                            {updateMutation.isPending ? t("Saving...", "Saving...") : t("Submit", "Submit")}
                        </button>
                    </>
                }
            >
                <form id="msgForm" onSubmit={form.handleSubmit(onSave)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label={t("Language", "Language")} required>
                            <select {...form.register("languageCode", { required: true })} className={ui.select}>
                                {languages.map(l => (
                                    <option key={l.code} value={l.code}>{l.name} ({l.code})</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label={t("Category", "Category")} required>
                            <select {...form.register("category", { required: true })} className={ui.select}>
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                    <FormField label={t("Message Key", "Message Key")} required>
                        <input type="text" {...form.register("messageKey", { required: true })} className={`${ui.input} font-mono`} placeholder="e.g. SAVE_SUCCESS" />
                        <p className="text-xs text-gray-400 mt-1">{t("Unique key for this message. Use UPPER_SNAKE_CASE.", "Unique key for this message. Use UPPER_SNAKE_CASE.")}</p>
                    </FormField>
                    <FormField label={t("Title", "Title")} required>
                        <input type="text" {...form.register("title", { required: true })} className={ui.input} placeholder="e.g. Success!" />
                    </FormField>
                    <FormField label={t("Message", "Message")} required>
                        <textarea {...form.register("message", { required: true })} className={`${ui.input} min-h-[80px]`} placeholder="e.g. Data saved successfully." />
                    </FormField>
                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" {...form.register("isActive")} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                        <label className="text-sm text-gray-700">{t("Active", "Active")}</label>
                    </div>
                </form>
            </ModalWrapper>
        </div>
    );
}
