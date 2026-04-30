"use client";

import { ROUTES } from "@/lib/routes";
import Link from "next/link";
import { PageHeader, StatusBadge, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

/* ──────────────────────────────────────────────────────────────────────────
 * Admin Dashboard — converted from Angular AdminDashboardComponent
 * ────────────────────────────────────────────────────────────────────────── */

export default function AdminDashboardPage() {
    const { t } = usePageTranslation();
    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Welcome Admin!', 'Welcome Admin!')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard') }]}
            />

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: t('Projects', 'Projects'), value: "112", icon: "📦", gradient: "from-orange-400 to-orange-500" },
                    { label: t('Clients', 'Clients'), value: "44", icon: "💰", gradient: "from-nv-violet/80 to-nv-violet" },
                    { label: t('Tasks', 'Tasks'), value: "37", icon: "💎", gradient: "from-nv-violet/80 to-nv-violet" },
                    { label: t('Employees', 'Employees'), value: "218", icon: "👤", gradient: "from-sb-sky to-zinc-900" },
                ].map((card) => (
                    <div key={card.label} className={`bg-gradient-to-br ${card.gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-white/80 text-sm font-medium">{card.label}</p>
                                <p className="text-3xl font-bold mt-1">{card.value}</p>
                            </div>
                            <span className="text-3xl opacity-80">{card.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={ui.tableWrapper}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('Total Revenue', 'Total Revenue')}</h3>
                        <div className="h-[280px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                            <div className="text-center">
                                <div className="flex items-end justify-center gap-2 mb-3">
                                    {[120, 90, 60, 90, 60, 90, 120].map((h, i) => (
                                        <div key={`income-${i}`} className="w-6 rounded-t transition-all duration-300 hover:opacity-80" style={{ height: `${h}px`, backgroundColor: "#ff9b44" }} />
                                    ))}
                                </div>
                                <div className="flex items-end justify-center gap-2">
                                    {[85, 75, 57, 85, 61, 75, 85].map((h, i) => (
                                        <div key={`outcome-${i}`} className="w-6 rounded-t transition-all duration-300 hover:opacity-80" style={{ height: `${h}px`, backgroundColor: "#fc6075" }} />
                                    ))}
                                </div>
                                <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#ff9b44]" /> {t('Total Income', 'Total Income')}</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#fc6075]" /> {t('Total Outcome', 'Total Outcome')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={ui.tableWrapper}>
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('Sales Overview', 'Sales Overview')}</h3>
                        <div className="h-[280px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                            <div className="text-center text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-2 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16" /></svg>
                                <p className="text-sm">{t('Sales chart integration', 'Sales chart will be integrated here')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Info Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: t('New Employees', 'New Employees'), value: "10", change: "+10%", changeColor: "text-nv-violet", sub: t('Overall Employees', 'Overall Employees') + " 218", progress: 70 },
                    { title: t('Earnings', 'Earnings'), value: "$1,42,300", change: "+12.5%", changeColor: "text-nv-violet", sub: t('Previous Month', 'Previous Month') + " $1,15,852", progress: 70 },
                    { title: t('Expenses', 'Expenses'), value: "$8,500", change: "-2.8%", changeColor: "text-red-500", sub: t('Previous Month', 'Previous Month') + " $7,500", progress: 70 },
                    { title: t('Profit', 'Profit'), value: "$1,12,000", change: "-75%", changeColor: "text-red-500", sub: t('Previous Month', 'Previous Month') + " $1,42,000", progress: 70 },
                ].map((item) => (
                    <div key={item.title} className={`${ui.tableWrapper} p-5`}>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-600 font-medium">{item.title}</span>
                            <span className={`text-sm font-semibold ${item.changeColor}`}>{item.change}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{item.value}</h3>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                            <div className="bg-nv-violet h-1.5 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                        </div>
                        <p className="text-xs text-gray-500">{item.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Statistics / Task Statistics / Today Absent ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Statistics */}
                <div className={`${ui.tableWrapper} p-5`}>
                    <h4 className="font-semibold text-gray-900 mb-4">{t('Statistics', 'Statistics')}</h4>
                    <div className="space-y-4">
                        {[
                            { label: t('Today Leave', 'Today Leave'), current: 4, total: 65, pct: 31, color: "bg-nv-violet" },
                            { label: t('Pending Invoice', 'Pending Invoice'), current: 15, total: 92, pct: 31, color: "bg-amber-400" },
                            { label: t('Completed Projects', 'Completed Projects'), current: 85, total: 112, pct: 62, color: "bg-nv-violet" },
                            { label: t('Open Tickets', 'Open Tickets'), current: 190, total: 212, pct: 62, color: "bg-red-500" },
                            { label: t('Closed Tickets', 'Closed Tickets'), current: 22, total: 212, pct: 22, color: "bg-cyan-500" },
                        ].map((s) => (
                            <div key={s.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">{s.label}</span>
                                    <span className="font-semibold text-gray-900">{s.current} <span className="text-gray-400 text-xs">/ {s.total}</span></span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className={`${s.color} h-1.5 rounded-full transition-all`} style={{ width: `${s.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Task Statistics */}
                <div className={`${ui.tableWrapper} p-5`}>
                    <h4 className="font-semibold text-gray-900 mb-4">{t('Task Statistics', 'Task Statistics')}</h4>
                    <div className="grid grid-cols-2 gap-4 text-center mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">{t('Total Tasks', 'Total Tasks')}</p>
                            <h3 className="text-2xl font-bold text-gray-900">385</h3>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">{t('Overdue Tasks', 'Overdue Tasks')}</p>
                            <h3 className="text-2xl font-bold text-gray-900">19</h3>
                        </div>
                    </div>
                    <div className="flex rounded-full overflow-hidden h-4 mb-4">
                        <div className="bg-nv-violet" style={{ width: "30%" }}><span className="text-[10px] text-white pl-1">30%</span></div>
                        <div className="bg-amber-400" style={{ width: "22%" }}><span className="text-[10px] text-white pl-1">22%</span></div>
                        <div className="bg-nv-violet" style={{ width: "24%" }}><span className="text-[10px] text-white pl-1">24%</span></div>
                        <div className="bg-red-500" style={{ width: "14%" }}><span className="text-[10px] text-white pl-1">14%</span></div>
                        <div className="bg-cyan-500" style={{ width: "10%" }}><span className="text-[10px] text-white pl-1">10%</span></div>
                    </div>
                    <div className="space-y-2 text-sm">
                        {[
                            { label: t('Completed Tasks', 'Completed Tasks'), count: 166, color: "bg-nv-violet" },
                            { label: t('Inprogress Tasks', 'Inprogress Tasks'), count: 115, color: "bg-amber-400" },
                            { label: t('On Hold Tasks', 'On Hold Tasks'), count: 31, color: "bg-nv-violet" },
                            { label: t('Pending Tasks', 'Pending Tasks'), count: 47, color: "bg-red-500" },
                            { label: t('Review Tasks', 'Review Tasks'), count: 5, color: "bg-cyan-500" },
                        ].map((item) => (
                            <div key={item.label} className="flex justify-between items-center">
                                <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${item.color}`} />{item.label}</span>
                                <span className="font-medium text-gray-900">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Today Absent */}
                <div className={`${ui.tableWrapper} p-5`}>
                    <div className="flex items-center gap-2 mb-4">
                        <h4 className="font-semibold text-gray-900">{t('Today Absent', 'Today Absent')}</h4>
                        <StatusBadge label="5" variant="danger" dot={false} />
                    </div>
                    <div className="space-y-4">
                        {[
                            { name: "Martin Lewis", date: "4 Sep 2023", status: "Pending" },
                            { name: "Martin Lewis", date: "4 Sep 2023", status: "Approved" },
                        ].map((item, idx) => (
                            <div key={idx} className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                        {item.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{item.date}</p>
                                        <p className="text-xs text-gray-500">{t('Leave Date', 'Leave Date')}</p>
                                    </div>
                                    <StatusBadge label={item.status} />
                                </div>
                            </div>
                        ))}
                        <button className="text-sm text-gray-500 hover:text-nv-violet w-full text-center py-1 transition-colors">{t('Load More', 'Load More')}</button>
                    </div>
                </div>
            </div>

            {/* ── Invoices & Payments ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Invoices */}
                <div className={ui.tableWrapper}>
                    <div className="p-5 border-b border-gray-100"><h3 className="font-semibold text-gray-900">{t('Invoices', 'Invoices')}</h3></div>
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}>
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Invoice ID', 'Invoice ID')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Client', 'Client')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Due Date', 'Due Date')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Total', 'Total')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Status', 'Status')}</th>
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {[
                                    { id: "#INV-0001", client: "Global Technologies", date: "11 Mar 2023", total: "$380", status: "Partially Paid" },
                                    { id: "#INV-0002", client: "Delta Infotech", date: "8 Feb 2023", total: "$500", status: "Paid" },
                                    { id: "#INV-0003", client: "Cream Inc", date: "23 Jan 2023", total: "$60", status: "Unpaid" },
                                ].map((inv) => (
                                    <tr key={inv.id} className={ui.tr}>
                                        <td className={ui.tdLink}>{inv.id}</td>
                                        <td className={ui.tdBold}>{inv.client}</td>
                                        <td className={ui.td}>{inv.date}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{inv.total}</td>
                                        <td className="px-4 py-3"><StatusBadge label={inv.status} variant={inv.status === "Paid" ? "success" : inv.status === "Unpaid" ? "danger" : "warning"} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-100 text-sm">
                        <button className="text-nv-violet hover:text-nv-violet-dark font-medium transition-colors">{t('View all invoices', 'View all invoices')}</button>
                    </div>
                </div>

                {/* Payments */}
                <div className={ui.tableWrapper}>
                    <div className="p-5 border-b border-gray-100"><h3 className="font-semibold text-gray-900">{t('Payments', 'Payments')}</h3></div>
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}>
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Invoice ID', 'Invoice ID')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Client', 'Client')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Payment Type', 'Payment Type')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Paid Date', 'Paid Date')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Paid Amount', 'Paid Amount')}</th>
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {[
                                    { id: "#INV-0001", client: "Global Technologies", type: "Paypal", date: "11 Mar 2023", amount: "$380" },
                                    { id: "#INV-0002", client: "Delta Infotech", type: "Paypal", date: "8 Feb 2023", amount: "$500" },
                                    { id: "#INV-0003", client: "Cream Inc", type: "Paypal", date: "23 Jan 2023", amount: "$60" },
                                ].map((pay) => (
                                    <tr key={pay.id} className={ui.tr}>
                                        <td className={ui.tdLink}>{pay.id}</td>
                                        <td className={ui.tdBold}>{pay.client}</td>
                                        <td className={ui.td}>{pay.type}</td>
                                        <td className={ui.td}>{pay.date}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{pay.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-100 text-sm">
                        <button className="text-nv-violet hover:text-nv-violet-dark font-medium transition-colors">{t('View all payments', 'View all payments')}</button>
                    </div>
                </div>
            </div>

            {/* ── Clients & Recent Projects ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Clients */}
                <div className={ui.tableWrapper}>
                    <div className="p-5 border-b border-gray-100"><h3 className="font-semibold text-gray-900">{t('Clients', 'Clients')}</h3></div>
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}>
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Name', 'Name')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Email', 'Email')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Status', 'Status')}</th>
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {[
                                    { name: "Barry Cuda", role: "CEO", email: "barrycuda@example.com", active: true },
                                    { name: "Tressa Wexler", role: "Manager", email: "tressawexler@example.com", active: false },
                                    { name: "Ruby Bartlett", role: "CEO", email: "rubybartlett@example.com", active: false },
                                    { name: "Misty Tison", role: "CEO", email: "mistytison@example.com", active: true },
                                    { name: "Daniel Deacon", role: "CEO", email: "danieldeacon@example.com", active: false },
                                ].map((c) => (
                                    <tr key={c.email} className={ui.tr}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{c.name.charAt(0)}</div>
                                                <div><p className="font-medium text-gray-900">{c.name}</p><p className="text-xs text-gray-500">{t(c.role, c.role)}</p></div>
                                            </div>
                                        </td>
                                        <td className={ui.td}>{c.email}</td>
                                        <td className="px-4 py-3"><StatusBadge label={c.active ? "Active" : "Inactive"} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-100 text-sm">
                        <button className="text-nv-violet hover:text-nv-violet-dark font-medium transition-colors">{t('View all clients', 'View all clients')}</button>
                    </div>
                </div>

                {/* Recent Projects */}
                <div className={ui.tableWrapper}>
                    <div className="p-5 border-b border-gray-100"><h3 className="font-semibold text-gray-900">{t('Recent Projects', 'Recent Projects')}</h3></div>
                    <div className="overflow-x-auto">
                        <table className={ui.table}>
                            <thead className={ui.thead}>
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Project Name', 'Project Name')}</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Progress', 'Progress')}</th>
                                </tr>
                            </thead>
                            <tbody className={ui.tbody}>
                                {[
                                    { name: "Office Management", open: 1, done: 9, pct: 65 },
                                    { name: "Project Management", open: 2, done: 5, pct: 15 },
                                    { name: "Video Calling App", open: 3, done: 3, pct: 49 },
                                    { name: "Hospital Administration", open: 12, done: 4, pct: 88 },
                                    { name: "Digital Marketplace", open: 7, done: 14, pct: 100 },
                                ].map((p) => (
                                    <tr key={p.name} className={ui.tr}>
                                        <td className="px-4 py-3">
                                            <Link href={ROUTES.projectPage} className="font-medium text-nv-violet hover:text-nv-violet-dark hover:underline transition-colors">{p.name}</Link>
                                            <p className="text-xs text-gray-500 mt-0.5"><span className="font-medium">{p.open}</span> {t('open tasks', 'open tasks')}, <span className="font-medium">{p.done}</span> {t('tasks completed', 'tasks completed')}</p>
                                        </td>
                                        <td className="px-4 py-3 w-36">
                                            <div className="w-full bg-gray-100 rounded-full h-2">
                                                <div className={`h-2 rounded-full transition-all ${p.pct === 100 ? "bg-nv-violet" : "bg-nv-violet"}`} style={{ width: `${p.pct}%` }} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
