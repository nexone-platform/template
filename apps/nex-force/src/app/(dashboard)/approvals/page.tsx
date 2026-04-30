"use client";

import { useState, useMemo } from "react";
import {
    usePendingApprovals,
    useApprovalAction,
    useCancelReasons
} from "@/hooks/use-approval";
import {
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    MessageSquare,
    FileText,
    Loader2,
    AlertCircle,
    BadgeCheck
} from "lucide-react";
import { format } from "date-fns";
import { getUserId, getUserProfile } from "@/lib/auth";
import { toast } from "sonner";
import { usePageTranslation } from "@/lib/language";

export default function ApprovalsPage() {
    const { t } = usePageTranslation();
    const userId = parseInt(getUserId() || "0");
    const username = getUserProfile() || "System";

    const { data: approvals, isLoading } = usePendingApprovals(userId);
    const { data: cancelReasons } = useCancelReasons();
    const actionMutation = useApprovalAction();

    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [actionModal, setActionModal] = useState<{ type: 'approve' | 'reject', item: any } | null>(null);
    const [actionComment, setActionComment] = useState("");
    const [cancelReasonId, setCancelReasonId] = useState<string>("");

    const filteredApprovals = useMemo(() => {
        return approvals?.filter((item: any) => {
            const matchesSearch =
                item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.ruleName?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = filterType === "all" || item.refType === filterType;

            return matchesSearch && matchesType;
        });
    }, [approvals, searchTerm, filterType]);

    const handleAction = async () => {
        if (!actionModal) return;

        const payload = {
            instanceId: actionModal.item.instanceId,
            stepId: actionModal.item.stepId,
            approverId: userId,
            action: actionModal.type === 'approve' ? "APPROVE" : "REJECT",
            comment: actionComment,
            reasonId: cancelReasonId ? parseInt(cancelReasonId) : undefined,
            username: username
        };

        actionMutation.mutate(payload, {
            onSuccess: () => {
                setActionModal(null);
                setActionComment("");
                setCancelReasonId("");
                toast.success(`Request ${actionModal.type === 'approve' ? 'approved' : 'rejected'} successfully`);
            }
        });
    };

    const getTypeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'leave': return 'bg-orange-50 text-nv-danger border-orange-100';
            case 'expense': return 'bg-green-50 text-green-600 border-green-100';
            case 'resignation': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-nv-violet-light text-nv-violet border-blue-100';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight transition-all">{t('Approvals Center', 'Approvals Center')}</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">You have {approvals?.length || 0} requests awaiting your decision.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('Filter requests...', 'Filter requests...')}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-4">
                {["all", "LEAVE", "EXPENSE", "OVERTIME", "RESIGNATION"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${filterType === type
                            ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105"
                            : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
                            }`}
                    >
                        {type === 'all' ? t('All Requests', 'All Requests') : type}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Loader2 className="w-10 h-10 text-nv-violet animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Scanning pending approvals...</p>
                </div>
            ) : filteredApprovals?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dotted border-gray-200 shadow-sm">
                    <div className="bg-gray-50 p-6 rounded-full mb-4">
                        <BadgeCheck className="w-12 h-12 text-green-400 opacity-50" />
                    </div>
                    <p className="text-gray-800 font-bold text-lg">Inbound box is clear!</p>
                    <p className="text-gray-400 text-sm mt-1">No pending requests match your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {filteredApprovals?.map((item: any) => (
                        <div key={item.instanceId} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group overflow-hidden flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nv-violet-light to-nv-violet-light flex items-center justify-center text-nv-violet font-bold text-lg shadow-inner group-hover:scale-110 transition-transform">
                                            {item.employeeName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-gray-900">{item.employeeName}</p>
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border tracking-widest ${getTypeColor(item.refType)}`}>
                                                {item.refType}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 flex items-center justify-end gap-1">
                                            <Clock className="w-3 h-3" />
                                            {item.requestDate ? format(new Date(item.requestDate), "MMM d, yyyy") : "Date Unknown"}
                                        </p>
                                        <p className="text-[10px] text-gray-300 mt-1 uppercase font-bold">REQ-{item.requestId}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-50 group-hover:bg-nv-violet-light/30 group-hover:border-blue-50 transition-colors">
                                        <p className="text-sm text-gray-700 italic flex items-start gap-2 leading-relaxed">
                                            <MessageSquare className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
                                            {item.description || "No description provided."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <span>Level {item.currentApprovalLevel}: {item.ruleName}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-end gap-2 px-6">
                                <button
                                    onClick={() => setActionModal({ type: 'reject', item })}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                                >
                                    <XCircle className="w-4 h-4" />
                                    {t('Reject', 'Reject')}
                                </button>
                                <button
                                    onClick={() => setActionModal({ type: 'approve', item })}
                                    className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-nv-violet hover:bg-nv-violet-dark rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 transform group-hover:-translate-y-0.5"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    {t('Approve', 'Approve')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Action Modal */}
            {actionModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className={`p-8 text-center ${actionModal.type === 'approve' ? 'bg-nv-violet-light/50' : 'bg-red-50/50'}`}>
                            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${actionModal.type === 'approve' ? 'bg-nv-violet-light text-nv-violet shadow-blue-100' : 'bg-red-100 text-red-600 shadow-red-100'
                                } shadow-xl`}>
                                {actionModal.type === 'approve' ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 leading-tight">
                                {actionModal.type === 'approve' ? t('Approve Request?', 'Approve Request?') : t('Reject Request?', 'Reject Request?')}
                            </h2>
                            <p className="text-sm text-gray-500 mt-2 font-medium">
                                Reviewing request from <span className="font-bold text-gray-700">{actionModal.item.employeeName}</span>
                            </p>
                        </div>

                        <div className="p-8 space-y-6">
                            {actionModal.type === 'reject' && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('Select Reason', 'Select Reason')}</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all font-medium text-gray-700 appearance-none h-[50px]"
                                        value={cancelReasonId}
                                        onChange={(e) => setCancelReasonId(e.target.value)}
                                    >
                                        <option value="">Select a reason (optional)</option>
                                        {cancelReasons?.map((r: any) => (
                                            <option key={r.reasonId} value={r.reasonId}>{r.reasonDetail}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('Comments', 'Comments')}</label>
                                <textarea
                                    placeholder={t('Enter your decision notes here...', 'Enter your decision notes here...')}
                                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 transition-all outline-none min-h-[120px] font-medium text-gray-700 ${actionModal.type === 'approve' ? 'focus:ring-blue-100 focus:border-nv-violet' : 'focus:ring-red-100 focus:border-red-400'
                                        }`}
                                    value={actionComment}
                                    onChange={(e) => setActionComment(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setActionModal(null)}
                                    className="flex-1 px-6 py-4 font-black text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
                                >
                                    {t('Cancel', 'Cancel')}
                                </button>
                                <button
                                    onClick={handleAction}
                                    disabled={actionMutation.isPending}
                                    className={`flex-[2] py-4 font-black text-white rounded-2xl shadow-xl transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 ${actionModal.type === 'approve'
                                        ? 'bg-nv-violet hover:bg-nv-violet-dark shadow-blue-100'
                                        : 'bg-red-600 hover:bg-red-700 shadow-red-100'
                                        }`}
                                >
                                    {actionMutation.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {actionModal.type === 'approve' ? <BadgeCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                            {t('Confirm Decision', 'Confirm Decision')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
