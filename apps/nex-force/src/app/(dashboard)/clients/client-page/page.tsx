"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMessages } from "@/hooks/use-messages";
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import { getUserProfile } from "@/lib/auth";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import {
    PageHeader, ModalWrapper, FormField, LoadingSpinner, EmptyState, ui,
} from "@/components/shared/ui-components";
import ImportExcelButton from "@/components/ImportExcelButton";
import { usePageTranslation } from "@/lib/language";

interface Client {
    clientId?: number;
    clientCode?: string;
    company?: string;
    address?: string;
    taxId?: string;
    clientEmail?: string;
    headOffice?: boolean;
    branchNo?: string;
    branchName?: string;
    creditTerm?: number;
    officeNo?: string;
    imgPath?: string;
    contractName?: string;
    contractNo?: string;
    contractEmail?: string;
    clientNameEn?: string;
    clientNameTh?: string;
    clientPhone?: string;
    isActive?: boolean;
    id?: number;
}

export default function ClientPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError, showWarning } = useMessages();
    const username = getUserProfile();
    const queryClient = useQueryClient();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>("");
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    // Search form
    const [searchCode, setSearchCode] = useState("");
    const [searchClientId, setSearchClientId] = useState("");

    // Fetch all clients
    const { data: clientList, isLoading } = useQuery({
        queryKey: ["clients"],
        queryFn: async () => {
            const { data } = await apiClient.get<{ data: Client[] }>("client/getAllClient");
            return data?.data || [];
        },
    });

    // Search mutation
    const searchMutation = useMutation({
        mutationFn: async (criteria: { clientCode?: string; clientId?: number | null }) => {
            const { data } = await apiClient.post<Client[]>("client/searchClients", criteria);
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["clients"], data);
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const { data } = await apiClient.post<{ message: string }>("client/update", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return data;
        },
        onSuccess: () => {
            showSuccess('SAVE_SUCCESS', 'Success!', 'Client saved successfully');
            setModalOpen(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
        onError: () => {
            showError('SAVE_ERROR', 'Error!', 'Error saving client');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { data } = await apiClient.delete<{ message: string }>(`client/delete?id=${id}`);
            return data;
        },
        onSuccess: (data) => {
            showSuccess('SAVE_SUCCESS', 'Success!', data?.message || "Client deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
        onError: () => {
            showError('SAVE_ERROR', 'Error!', 'Error deleting client');
        },
    });

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<Client>();
    const watchHeadOffice = watch("headOffice");

    const resetForm = () => {
        reset({
            clientId: undefined,
            clientCode: "",
            company: "",
            address: "",
            taxId: "",
            clientEmail: "",
            headOffice: true,
            branchNo: "",
            branchName: "",
            creditTerm: undefined,
            officeNo: "",
            contractName: "",
            contractNo: "",
            contractEmail: "",
            isActive: true,
        });
        setSelectedFile(null);
        setPreviewImage("");
    };

    const openModal = (client?: Client) => {
        if (client) {
            setSelectedClient(client);
            reset({
                clientId: client.clientId,
                clientCode: client.clientCode || "",
                company: client.company || "",
                address: client.address || "",
                taxId: client.taxId || "",
                clientEmail: client.clientEmail || "",
                headOffice: client.headOffice ?? true,
                branchNo: client.branchNo || "",
                branchName: client.branchName || "",
                creditTerm: client.creditTerm,
                officeNo: client.officeNo || "",
                contractName: client.contractName || "",
                contractNo: client.contractNo || "",
                contractEmail: client.contractEmail || "",
                isActive: client.isActive ?? true,
            });
            setPreviewImage(client.imgPath || "");
        } else {
            setSelectedClient(null);
            resetForm();
        }
        setModalOpen(true);
    };

    const handleDelete = (id: number) => {
        showWarning('REQUIRED_FIELDS', 'Delete Client', 'Are you sure you want to delete this client?').then((result) => { if (result.isConfirmed) deleteMutation.mutate(id); });
    };

    const onSubmit = (formValues: Client) => {
        const formData = new FormData();
        const clientId = formValues.clientId ?? 0;
        formData.append("clientId", String(clientId));

        const fields: (keyof Client)[] = [
            "clientCode", "company", "address", "taxId", "clientEmail",
            "headOffice", "branchNo", "branchName", "creditTerm", "officeNo",
            "imgPath", "contractName", "contractNo", "contractEmail", "isActive",
        ];
        fields.forEach((key) => {
            const val = formValues[key];
            if (val !== undefined && val !== null) {
                formData.append(key, String(val));
            }
        });
        formData.append("username", username || "");

        if (selectedFile) {
            formData.append("imgFile", selectedFile);
        }

        updateMutation.mutate(formData);
    };

    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSearch = () => {
        searchMutation.mutate({
            clientCode: searchCode || undefined,
            clientId: searchClientId ? Number(searchClientId) : null,
        });
    };

    const formatPhone = (value: string, maxLen: number) => {
        const numbers = value.replace(/\D/g, "").substring(0, maxLen);
        if (numbers.length > 6) return `${numbers.substring(0, 3)}-${numbers.substring(3, 6)}-${numbers.substring(6)}`;
        if (numbers.length > 3) return `${numbers.substring(0, 3)}-${numbers.substring(3)}`;
        return numbers;
    };

    const displayClients = clientList || [];

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Clients', 'Clients')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.employeeDashboard }, { label: t('Clients', 'Clients') }]}
                actions={
                    <div className="flex items-center gap-3">
                        <button onClick={() => openModal()} className={ui.btnPrimary}>
                            <Plus className="w-4 h-4" /> Add Client
                        </button>
                        <div className="flex border rounded-lg overflow-hidden">
                            <Link href={ROUTES.clientPage} className="px-3 py-2 bg-nv-violet text-white text-sm">
                                <span className="text-xs">▦</span>
                            </Link>
                            <button onClick={() => {}} className="px-3 py-2 bg-white text-gray-600 hover:bg-gray-50 text-sm cursor-not-allowed opacity-50" title="List view coming soon">
                                <span className="text-xs">▰</span>
                            </button>
                        </div>
                    </div>
                }
            />

            {/* Search Filter */}
            <div className={ui.tableWrapper + " mb-6 !overflow-visible"}>
                <div className="flex gap-4 items-end p-4">
                    <div className="flex-1">
                        <FormField label={t('Client Code', 'Client Code')}>
                            <input type="text" className={ui.input} value={searchCode} onChange={(e) => setSearchCode(e.target.value)} placeholder="Client Code" />
                        </FormField>
                    </div>
                    <div className="flex-1">
                        <FormField label={t('Company', 'Company')}>
                            <select className={ui.select} value={searchClientId} onChange={(e) => setSearchClientId(e.target.value)}>
                                <option value="">{t('Select Company', 'Select Company')}</option>
                                {displayClients.map((c) => (
                                    <option key={c.clientId} value={c.clientId}>{c.company}</option>
                                ))}
                            </select>
                        </FormField>
                    </div>
                    <button onClick={handleSearch} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-nv-violet-dark transition h-10">
                        Search
                    </button>
                    <ImportExcelButton
                        columns={[
                            { header: "Client Code", key: "clientCode", required: true },
                            { header: "Company", key: "company", required: true },
                            { header: "Address", key: "address" },
                            { header: "Tax ID", key: "taxId" },
                            { header: "Client Email", key: "clientEmail" },
                            { header: "Contract Name", key: "contractName", required: true },
                            { header: "Contract No", key: "contractNo" },
                            { header: "Contract Email", key: "contractEmail" },
                        ]}
                        filenamePrefix="clients"
                        onImport={async (rows) => {
                            let success = 0, failed = 0;
                            for (const row of rows) {
                                try {
                                    const fd = new FormData();
                                    fd.append("clientId", "0");
                                    fd.append("clientCode", row.clientCode ?? "");
                                    fd.append("company", row.company ?? "");
                                    fd.append("address", row.address ?? "");
                                    fd.append("taxId", row.taxId ?? "");
                                    fd.append("clientEmail", row.clientEmail ?? "");
                                    fd.append("headOffice", "true");
                                    fd.append("contractName", row.contractName ?? "");
                                    fd.append("contractNo", row.contractNo ?? "");
                                    fd.append("contractEmail", row.contractEmail ?? "");
                                    fd.append("isActive", "true");
                                    fd.append("username", username || "");
                                    await apiClient.post("client/update", fd, { headers: { "Content-Type": "multipart/form-data" } });
                                    success++;
                                } catch { failed++; }
                            }
                            return { success, failed };
                        }}
                        onImportComplete={() => queryClient.invalidateQueries({ queryKey: ["clients"] })}
                    />
                </div>
            </div>

            {/* Client Grid */}
            {isLoading ? (
                <LoadingSpinner />
            ) : displayClients.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayClients.map((client) => (
                        <div key={client.clientId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative p-6 flex flex-col items-center">
                                {/* Dropdown */}
                                <div className="absolute top-3 right-3">
                                    <button
                                        onClick={() => setOpenDropdownId(openDropdownId === client.clientId! ? null : client.clientId!)}
                                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                    {openDropdownId === client.clientId && (
                                        <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg z-10">
                                            <button
                                                onClick={() => { openModal(client); setOpenDropdownId(null); }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Pencil className="w-3 h-3" /> Edit
                                            </button>
                                            <button
                                                onClick={() => { handleDelete(client.clientId!); setOpenDropdownId(null); }}
                                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-3 h-3" /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Avatar */}
                                <Link href={`/clients/client-profile/${client.clientId}`} className="block">
                                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden mb-4">
                                        <img
                                            src={client.imgPath || "/assets/img/profile/profile.jpg"}
                                            alt={client.company || ""}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </Link>

                                {/* Info */}
                                <Link href={`/clients/client-profile/${client.clientId}`} className="text-center hover:text-nv-violet">
                                    <h4 className="font-semibold text-gray-800 truncate max-w-[200px]">
                                        {client.clientCode}: {client.company}
                                    </h4>
                                </Link>
                                <Link href={`/clients/client-profile/${client.clientId}`} className="text-center hover:text-nv-violet">
                                    <p className="text-sm text-gray-500 mt-1 truncate max-w-[200px]">
                                        {client.clientNameEn}
                                    </p>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <ModalWrapper
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedClient ? t("Edit Client", "Edit Client") : t("Add Client", "Add Client")}
                maxWidth="max-w-3xl"
                footer={
                    <>
                        <button onClick={() => setModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={updateMutation.isPending}
                            className={ui.btnPrimary}
                        >
                            {updateMutation.isPending ? t("Saving...", "Saving...") : t("Submit", "Submit")}
                        </button>
                    </>
                }
            >
                <form className="space-y-6">
                    {/* Image Section */}
                    <div className="flex flex-col items-center pb-6 border-b border-gray-100 italic">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-nv-violet/20 flex items-center justify-center">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Plus className="w-8 h-8 text-gray-300 group-hover:text-nv-violet transition-colors" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-nv-violet text-white p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-nv-violet-dark transition-colors border-2 border-white">
                                <Pencil className="w-3 h-3" />
                                <input type="file" accept="image/*" onChange={onFileSelected} className="hidden" />
                            </label>
                        </div>
                        <p className="mt-2 text-[10px] text-gray-400 font-medium tracking-wide uppercase">{t('Profile Image', 'Profile Image')}</p>
                    </div>

                    {/* Section 1: Company Information */}
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                        <h5 className="font-bold text-nv-violet uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-1 h-3 bg-nv-violet rounded-full"></span>
                            {t('Company Information', 'Company Information')}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t('Client Code', 'Client Code')} required>
                                <input {...register("clientCode", { required: true })}
                                    className={`${ui.input} ${errors.clientCode ? "border-red-500" : ""}`} />
                            </FormField>
                            <FormField label={t('Company', 'Company')} required>
                                <input {...register("company", { required: true })}
                                    className={`${ui.input} ${errors.company ? "border-red-500" : ""}`} />
                            </FormField>
                            <div className="col-span-1 md:col-span-2">
                                <FormField label={t('Address', 'Address')}>
                                    <textarea rows={2} {...register("address")} className={ui.textarea} />
                                </FormField>
                            </div>
                            <FormField label={t('Tax ID', 'Tax ID')}>
                                <input {...register("taxId")} className={ui.input} />
                            </FormField>
                            <FormField label={t('Client Email', 'Client Email')}>
                                <input type="email" {...register("clientEmail")} className={ui.input} />
                            </FormField>
                            
                            <FormField label={t('Office Type', 'Office Type')}>
                                <div className="flex items-center gap-4 mt-2 bg-white/50 p-2 rounded-lg border border-gray-100">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="radio" value="true" {...register("headOffice")} className="w-4 h-4 accent-nv-violet" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-nv-violet transition-colors">{t('Head Office', 'Head Office')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="radio" value="false" {...register("headOffice")} className="w-4 h-4 accent-nv-violet" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-nv-violet transition-colors">{t('Branch', 'Branch')}</span>
                                    </label>
                                </div>
                            </FormField>
                            
                            <FormField label={t('Credit Term', 'Credit Term')}>
                                <div className="relative">
                                    <input type="number" {...register("creditTerm")} className={ui.input} />
                                    <span className="absolute right-3 top-2 text-xs text-gray-400">{t('Days', 'Days')}</span>
                                </div>
                            </FormField>

                            {String(watchHeadOffice) === "false" && (
                                <>
                                    <FormField label={t('Branch No', 'Branch No')}>
                                        <input {...register("branchNo")} className={ui.input} placeholder="e.g. 00001" />
                                    </FormField>
                                    <FormField label={t('Branch Name', 'Branch Name')}>
                                        <input {...register("branchName")} className={ui.input} />
                                    </FormField>
                                </>
                            )}
                            
                            <FormField label={t('Office No', 'Office No')}>
                                <input
                                    {...register("officeNo")}
                                    onChange={(e) => {
                                        const formatted = formatPhone(e.target.value, 9);
                                        setValue("officeNo", formatted);
                                    }}
                                    className={ui.input}
                                    placeholder="xxx-xxx-xxx"
                                />
                            </FormField>
                        </div>
                    </div>

                    {/* Section 2: Contact Person */}
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                        <h5 className="font-bold text-nv-violet uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-1 h-3 bg-nv-violet rounded-full"></span>
                            {t('Contact Person', 'Contact Person')}
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={t('Contract Name', 'Contract Name')} required>
                                <input {...register("contractName", { required: true })}
                                    className={`${ui.input} ${errors.contractName ? "border-red-500" : ""}`} />
                            </FormField>
                            <FormField label={t('Contract No', 'Contract No')}>
                                <input
                                    {...register("contractNo")}
                                    onChange={(e) => {
                                        const formatted = formatPhone(e.target.value, 10);
                                        setValue("contractNo", formatted);
                                    }}
                                    className={ui.input}
                                    placeholder="xxx-xxx-xxxx"
                                />
                            </FormField>
                            <FormField label={t('Contract Email', 'Contract Email')} required>
                                <input type="email" {...register("contractEmail", { required: true })}
                                    className={`${ui.input} ${errors.contractEmail ? "border-red-500" : ""}`} />
                            </FormField>
                            
                            <div className="flex items-end mb-1">
                                <div className="flex items-center justify-between w-full bg-white/50 p-2 rounded-lg border border-gray-100">
                                    <span className="text-sm font-medium text-gray-600">{t('Active Status', 'Active Status')}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" {...register("isActive")} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nv-violet"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </ModalWrapper>
        </div>
    );
}
