import React, { useState } from 'react';
import { CreditCard, FileText, ChevronRight, Save, Plus, Wallet, FileOutput } from 'lucide-react';

export default function BillingSettings() {
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 500);
    };

    return (
        <div style={{ maxWidth: "100%", overflowX: "hidden", display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "40px", animation: "fadeIn 0.3s ease-in-out" }}>
            
            {/* ── Page Header ── */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "24px 32px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <div>
                    <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", margin: "0 0 8px 0" }}>
                        การเงิน & ภาษี (Billing & Tax)
                    </h2>
                    <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>
                        ตั้งค่าข้อมูลภาษีเบื้องต้น, วิธีรับชำระเงิน, และเทมเพลตสำหรับออกเอกสารทางการเงิน
                    </p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: "#3b82f6",
                            color: "#fff",
                            padding: "12px 24px",
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "14px",
                            border: "none",
                            cursor: saving ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "all 0.2s",
                            boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.2)"
                        }}
                    >
                        <Save size={18} className={saving ? "animate-spin" : ""} /> {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </button>
                </div>
            </div>

            {/* ── Settings Content ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
                
                {/* Section 1: ข้อมูลภาษี */}
                <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                    <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ background: "#eff6ff", padding: "6px", borderRadius: "8px", color: "#3b82f6" }}>
                            <FileOutput size={20} />
                        </div>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>ข้อมูลภาษีและเงื่อนไขทางการเงิน</h3>
                    </div>
                    <div style={{ padding: "24px" }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700">ประเภทภาษี (VAT)</label>
                                <select className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent p-3 outline-none transition-colors">
                                    <option>VAT 7% (รวมในราคา)</option>
                                    <option>VAT 7% (แยกจากราคา)</option>
                                    <option>ได้รับยกเว้นภาษี (0%)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700">หัก ณ ที่จ่ายเริ่มต้น</label>
                                <select className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent p-3 outline-none transition-colors">
                                    <option>1% (ค่าขนส่ง)</option>
                                    <option>3% (ค่าบริการ)</option>
                                    <option>5% (ค่าเช่า)</option>
                                    <option>ไม่หักภาษี</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700">เงื่อนไขการชำระเริ่มต้น (Credit Term)</label>
                                <select className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent p-3 outline-none transition-colors">
                                    <option>เงินสด (Cash)</option>
                                    <option>15 วัน</option>
                                    <option selected>30 วัน</option>
                                    <option>45 วัน</option>
                                    <option>60 วัน</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700">สกุลเงินหลัก (Base Currency)</label>
                                <select className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent p-3 outline-none transition-colors">
                                    <option>THB (บาท)</option>
                                    <option>USD ($)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: บัญชีรับชำระ */}
                <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                    <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ background: "#eff6ff", padding: "6px", borderRadius: "8px", color: "#3b82f6" }}>
                                <Wallet size={20} />
                            </div>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>บัญชีธนาคารรับชำระทางการเงิน</h3>
                        </div>
                        <button className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                            <Plus size={16} />เพิ่มบัญชี
                        </button>
                    </div>
                    <div style={{ padding: "24px" }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { bank: 'ธ.กรุงเทพ', account: 'XXX-X-XXXXX-X', name: 'บจ. เน็กซ์วัน คอร์ปอเรชั่น', type: 'ออมทรัพย์', primary: true, color: 'text-blue-700', bg: 'bg-blue-50' },
                                { bank: 'ธ.กสิกรไทย', account: 'XXX-X-XXXXX-X', name: 'บจ. เน็กซ์วัน คอร์ปอเรชั่น', type: 'กระแสรายวัน', primary: false, color: 'text-green-600', bg: 'bg-green-50' },
                            ].map(acc => (
                                <div key={acc.bank} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${acc.primary ? 'border-blue-300 ring-1 ring-blue-100 bg-blue-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${acc.bg} flex items-center justify-center`}>
                                            <CreditCard size={24} className={acc.color} />
                                        </div>
                                        <div>
                                            <div className="text-[15px] font-bold text-slate-800 flex items-center gap-2">
                                                {acc.bank}
                                                {acc.primary && <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Primary</span>}
                                            </div>
                                            <div className="text-sm font-medium text-slate-600 my-0.5">{acc.account} <span className="text-slate-400">({acc.type})</span></div>
                                            <div className="text-xs text-slate-500">{acc.name}</div>
                                        </div>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 3: เทมเพลตเอกสาร */}
                <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                    <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ background: "#eff6ff", padding: "6px", borderRadius: "8px", color: "#3b82f6" }}>
                            <FileText size={20} />
                        </div>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>ตั้งค่าเทมเพลตเอกสาร</h3>
                    </div>
                    <div style={{ padding: "24px" }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { title: 'ใบแจ้งหนี้ (Invoice)', id: 'INV' },
                                { title: 'ใบเสร็จรับเงิน (Receipt)', id: 'REC' },
                                { title: 'ใบกำกับภาษี (Tax Inv)', id: 'TAX' },
                                { title: 'ใบหัก ณ ที่จ่าย', id: 'WHT' }
                            ].map(doc => (
                                <div key={doc.id} className="group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <FileText size={18} className="text-slate-400 group-hover:text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{doc.title}</div>
                                            <div className="text-xs text-green-500 font-medium">ปรับแต่งแล้ว</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
