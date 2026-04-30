"use client";

import { useState } from "react";
import {
    Target, Award, Zap, Save, Plus, Trash2, CheckCircle2, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

export default function PerformanceSettingsPage() {
    const { t } = usePageTranslation();
    const [activeTab, setActiveTab] = useState("okrs");

    const tabs = [
        { id: "okrs", label: t('OKRs', 'OKRs'), icon: <Target className="w-4 h-4" /> },
        { id: "competency", label: t('Competency-based', 'Competency-based'), icon: <Award className="w-4 h-4" /> },
        { id: "smart", label: t('SMART Goals', 'SMART Goals'), icon: <Zap className="w-4 h-4" /> },
    ];

    const renderOkrTab = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-nv-violet-light/50 p-4 rounded-lg border border-blue-100/50">
                <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5" /> Objectives and Key Results (OKR)
                </h3>
                <p className="text-sm text-blue-800/80 leading-relaxed">
                    OKRs comprise an Objective—a clearly defined goal—and one or more Key Results—specific measures used to track the achievement of that goal.
                </p>
                <div className="mt-4">
                    <button className={`${ui.btnPrimary} flex items-center gap-2`}><CheckCircle2 className="w-4 h-4" /> OKR Activated</button>
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">OKRs Description</label>
                <textarea rows={4} className={ui.textarea}
                    defaultValue="Objectives and Key Results (OKR) is a framework for defining and tracking organizations objectives and their outcomes. OKRs comprise an Objective—a clearly defined goal—and one or more Key Results—specific measures used to track the achievement of that goal." />
            </div>

            <div className="border-t border-gray-100 pt-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-400" /> Rating Scale Configuration
                </h4>
                <div className="flex gap-4 mb-6">
                    {["0.1 - 1.0", "1 - 5", "1 - 10", "Custom"].map(scale => (
                        <label key={scale} className="flex items-center gap-2 cursor-pointer group">
                            <input type="radio" name="okr_scale" className="w-4 h-4 text-nv-violet" defaultChecked={scale === "0.1 - 1.0"} />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{scale}</span>
                        </label>
                    ))}
                </div>

                <div className={ui.tableWrapper}>
                    <table className={ui.table}>
                        <thead className={ui.thead}>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-20">{t('Rating', 'Rating')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-64">{t('Descriptive Word', 'Descriptive Word')}</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Definition', 'Definition')}</th>
                            </tr>
                        </thead>
                        <tbody className={ui.tbody}>
                            {[0.1, 0.5, 1.0].map(val => (
                                <tr key={val} className={ui.tr}>
                                    <td className="px-4 py-3 font-mono text-nv-violet font-bold">{val.toFixed(1)}</td>
                                    <td className="px-4 py-3">
                                        <input type="text" className={`${ui.input} border-transparent hover:border-gray-200 focus:border-nv-violet`} defaultValue={val === 1.0 ? "Delivered" : val === 0.5 ? "Progressing" : "Failed"} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <textarea rows={1} className={`${ui.textarea} border-transparent hover:border-gray-200 focus:border-nv-violet text-xs`} defaultValue="Goal achievement description sequence..." />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button onClick={() => toast.success("OKR configuration saved")} className={`${ui.btnPrimary} flex items-center gap-2`}>
                    <Save className="w-4 h-4" /> Save OKR Config
                </button>
            </div>
        </div>
    );

    const renderCompetencyTab = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-nv-violet-light/50 p-4 rounded-lg border border-purple-100/50">
                <h3 className="font-semibold text-purple-900 flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5" /> Competency-based Performance
                </h3>
                <p className="text-sm text-purple-800/80 leading-relaxed">
                    Evaluate employees performance through defined core competencies that align with the company&apos;s mission, vision and goals.
                </p>
            </div>

            <div className={ui.tableWrapper}>
                <table className={ui.table}>
                    <thead className={ui.thead}>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Competency', 'Competency')}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('Definition', 'Definition')}</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase w-20">{t('Action', 'Action')}</th>
                        </tr>
                    </thead>
                    <tbody className={ui.tbody}>
                        {[
                            { name: "Adaptability", desc: "Ability to handle ambiguity and situations outside control." },
                            { name: "Collaboration", desc: "Works harmoniously with others to get a job done." },
                            { name: "Communication", desc: "Delivers convincing and meaningful messages." }
                        ].map((c) => (
                            <tr key={c.name} className={`${ui.tr} group`}>
                                <td className={ui.tdBold}>{c.name}</td>
                                <td className="px-4 py-3 text-xs text-gray-500 leading-relaxed">{c.desc}</td>
                                <td className="px-4 py-3 text-center">
                                    <button className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                    <button className="text-nv-violet hover:text-nv-violet-dark font-medium text-sm flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add New Competency
                    </button>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button onClick={() => toast.success("Competency settings saved")} className={`${ui.btnPrimary} flex items-center gap-2`}>
                    <Save className="w-4 h-4" /> Save Competencies
                </button>
            </div>
        </div>
    );

    const renderSmartTab = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100/50">
                <h3 className="font-semibold text-orange-900 flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5" /> SMART Goals Configuration
                </h3>
                <p className="text-sm text-orange-800/80 leading-relaxed">
                    Specific, Measurable, Achievable, Relevant, and Time-bound goals for capturing feedback and performance.
                </p>
            </div>

            <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                <Zap className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <h4 className="text-gray-600 font-medium">SMART goals configuration is available</h4>
                <p className="text-gray-400 text-xs mt-1">Configure individual target metrics and periodic reviews.</p>
                <button className="mt-4 px-4 py-2 bg-nv-danger/90 text-white rounded-lg text-sm hover:bg-orange-700 transition-all font-medium">
                    Activate SMART Goals
                </button>
            </div>
        </div>
    );

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Performance Configuration', 'Performance Configuration')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: "/dashboard/employee" }, { label: t('Settings', 'Settings'), href: "/settings/company-settings" }, { label: t('Performance', 'Performance') }]}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
                <div className="border-b border-gray-200">
                    <div className="flex px-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-6 text-sm font-medium transition-all relative ${activeTab === tab.id ? "text-nv-violet" : "text-gray-400 hover:text-gray-600"}`}
                            >
                                {tab.icon}
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-nv-violet" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-8 flex-1">
                    {activeTab === "okrs" && renderOkrTab()}
                    {activeTab === "competency" && renderCompetencyTab()}
                    {activeTab === "smart" && renderSmartTab()}
                </div>
            </div>
        </div>
    );
}
