"use client";

import { useState } from "react";
import liff from "@line/liff";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { ROUTES } from "@/lib/routes";
import { setToken } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import { useLiff } from "@/components/mobile/LiffAuthProvider";

interface TokenPayload {
    sub: string;
    nameid: string;
}

export default function RegisterLinePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { liffReady, liffError } = useLiff();

    const { register, handleSubmit, formState: { errors } } = useForm<any>();

    async function onSubmit(values: any) {
        if (!liffReady) {
            toast.error("LINE LIFF ยังไม่พร้อม กรุณาเปิดจากแอป LINE");
            return;
        }

        if (!liff.isLoggedIn()) {
            liff.login();
            return;
        }

        setLoading(true);
        try {
            const idToken = liff.getIDToken();
            if (!idToken) {
                toast.error("ไม่สามารถดึง LINE Token ได้");
                setLoading(false);
                return;
            }

            const registrationData = {
                employeeId: values.EmployeeId,
                password: values.Password,
                lineToken: idToken
            };

            const res = await authService.registerline(registrationData);
            
            if (res.token) {
                setToken(res.token);
                try {
                    const decoded = jwtDecode<TokenPayload>(res.token);
                    localStorage.setItem("username", decoded.sub);
                    localStorage.setItem("employeeId", decoded.nameid);
                } catch (e) {
                    console.error("Token decode failed", e);
                }
                window.dispatchEvent(new Event("storage"));
            }

            toast.success("เชื่อมต่อ LINE สำเร็จ!");
            router.push(ROUTES.mobileAnnouncement);
        } catch (err) {
            toast.error(getApiErrorMessage(err, "ไม่สามารถเชื่อมต่อ LINE ได้"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
            <div className="w-full max-w-sm">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
                    <h1 className="text-3xl font-bold text-white text-center mb-2">NEXT-FORCE</h1>
                    <p className="text-blue-200 text-center mb-8">Register LINE Account</p>

                    {/* LIFF status */}
                    {liffError && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm text-center">
                            ⚠ LINE LIFF: {liffError}
                        </div>
                    )}
                    {!liffReady && !liffError && (
                        <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-200 text-sm text-center flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
                            กำลังเชื่อมต่อ LINE...
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="text-sm text-blue-200 mb-1 block">Employee ID <span className="text-red-400">*</span></label>
                            <input 
                                type="text" 
                                {...register("EmployeeId", { required: "Employee ID is required" })} 
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-400 outline-none" 
                                placeholder="Enter Employee ID" 
                            />
                            {errors.EmployeeId && <p className="text-red-400 text-xs mt-1">{errors.EmployeeId.message as string}</p>}
                        </div>
                        <div>
                            <label className="text-sm text-blue-200 mb-1 block">Password <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    {...register("Password", { required: "Password is required" })} 
                                    className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-400 outline-none" 
                                    placeholder="Enter password" 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.Password && <p className="text-red-400 text-xs mt-1">{errors.Password.message as string}</p>}
                        </div>
                        <button type="submit" disabled={loading || !liffReady} className="w-full py-3 bg-nv-violet hover:bg-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 mt-4">
                            {loading ? "กำลังเชื่อมต่อ..." : "Connect LINE"}
                        </button>
                        
                        {process.env.NODE_ENV === "development" && (
                            <button 
                                type="button" 
                                onClick={() => {
                                    setToken("dummy_dev_token_123");
                                    localStorage.setItem("username", "dev_user");
                                    localStorage.setItem("employeeId", "8");
                                    window.dispatchEvent(new Event("storage"));
                                    toast.success("Mock LINE Login successful!");
                                    router.push("/mobile/announcement");
                                }} 
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all mt-4 border border-emerald-400/50 shadow-lg shadow-emerald-500/20"
                            >
                                🧪 Simulate LINE Login (Employee 8)
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
