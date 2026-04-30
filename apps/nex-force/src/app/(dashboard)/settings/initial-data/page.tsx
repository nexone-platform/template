"use client";

import { useState } from "react";
import { useInitializeData } from "@/hooks/use-initial-data";
import { getUserProfile } from "@/lib/auth";
import { Database, AlertTriangle, RefreshCcw } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import { PageHeader, ModalWrapper, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function InitialDataPage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError } = useMessages();
    const initMutation = useInitializeData();
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    const handleInitialize = () => {
        const username = getUserProfile() || "System";
        initMutation.mutate(username, {
            onSuccess: () => {
                showSuccess('SAVE_SUCCESS', 'Success!', 'System data initialized successfully.');
                setConfirmModalOpen(false);
            },
            onError: (err) => {
                showError('SAVE_ERROR', 'Error!', getApiErrorMessage(err, "Failed to initialize."));
            },
        });
    };

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Initial Data', 'Initial Data')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" }, { label: t('Settings', 'Settings'), href: "/settings/company-settings" }, { label: t('Initial Data', 'Initial Data') }]}
            />

            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-lg w-full text-center relative overflow-hidden">
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-nv-violet-light rounded-full blur-2xl opacity-70"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-orange-50 rounded-full blur-2xl opacity-70"></div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-nv-violet-light text-nv-violet rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Database className="w-10 h-10" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Initialize System Data</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed text-sm">
                            This action will reset or initialize core system configurations, templates, and base records required for the platform to function properly.
                        </p>

                        <button
                            onClick={() => setConfirmModalOpen(true)}
                            className={`${ui.btnPrimary} px-8 py-3.5 shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 w-full max-w-xs mx-auto text-lg`}
                        >
                            <RefreshCcw className="w-5 h-5" />
                            Run Initialization
                        </button>

                        <p className="text-xs text-gray-400 mt-6 flex items-center justify-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> This action cannot be easily undone
                        </p>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ModalWrapper open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} title={t('Confirm Initialization', 'Confirm Initialization')} maxWidth="max-w-md"
                footer={<>
                    <button onClick={() => setConfirmModalOpen(false)} disabled={initMutation.isPending} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button>
                    <button onClick={handleInitialize} disabled={initMutation.isPending} className={ui.btnDanger}>
                        {initMutation.isPending ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                            </span>
                        ) : "Yes, Initialize Data"}
                    </button>
                </>}
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Are you absolutely sure?</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">
                        This will process the initial data setup and may overwrite current configuration data. The user profile executing this action will be recorded.
                    </p>
                </div>
            </ModalWrapper>
        </div>
    );
}
