import React, { useState } from 'react';
import { Key, Shield, Clock, Save, Lock } from 'lucide-react';

export default function SecuritySettings() {
    const [saving, setSaving] = useState(false);
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 500);
    };

    const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
        <div
            onClick={onToggle}
            className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors duration-200 ${enabled ? 'bg-blue-500' : 'bg-slate-300'}`}
        >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-[2px] shadow-sm transition-all duration-200 ${enabled ? 'left-[26px]' : 'left-[2px]'}`} />
        </div>
    );

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
                        ความปลอดภัย (Security)
                    </h2>
                    <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>
                        จัดการรหัสผ่าน, การยืนยันตัวตน (2FA), และระยะเวลา Session การใช้งาน
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
                
                {/* Section 1: การยืนยันตัวตนและการเข้าถึง */}
                <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                    <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ background: "#eff6ff", padding: "6px", borderRadius: "8px", color: "#3b82f6" }}>
                            <Lock size={20} />
                        </div>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>การยืนยันตัวตนและการเข้าถึง</h3>
                    </div>
                    <div style={{ padding: "24px" }} className="flex flex-col gap-4">
                        
                        <div className="flex items-center justify-between p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Key size={24} />
                                </div>
                                <div>
                                    <div className="text-[15px] font-bold text-slate-800">เปลี่ยนรหัสผ่านระดับองค์การ (Admin/Super Admin)</div>
                                    <div className="text-sm text-slate-500 mt-1">อัปเดตรหัสผ่านใหม่เป็นประจำเพื่อความปลอดภัยของระบบ</div>
                                </div>
                            </div>
                            <button className="px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                                เปลี่ยนรหัสผ่าน
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <div className="text-[15px] font-bold text-slate-800">Two-Factor Authentication (2FA)</div>
                                    <div className="text-sm text-slate-500 mt-1">บังคับพนักงานใช้ Google Authenticator เพื่อเข้าถึงข้อมูลสำคัญ</div>
                                </div>
                            </div>
                            <ToggleSwitch enabled={twoFAEnabled} onToggle={() => setTwoFAEnabled(!twoFAEnabled)} />
                        </div>

                        <div className="flex items-center justify-between p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <div className="text-[15px] font-bold text-slate-800">เวลาการหมดอายุเซสชัน (Session Timeout)</div>
                                    <div className="text-sm text-slate-500 mt-1">ระบบจะบังคับออกจากระบบอัตโนมัติเมื่อผู้ใช้ไม่มีการโต้ตอบ</div>
                                </div>
                            </div>
                            <select className="bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent p-2.5 outline-none transition-colors w-40">
                                <option>15 นาที</option>
                                <option>30 นาที</option>
                                <option selected>1 ชั่วโมง</option>
                                <option>4 ชั่วโมง</option>
                                <option>ไม่หมดเวลา</option>
                            </select>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
