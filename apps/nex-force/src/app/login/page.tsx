"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { setToken } from "@/lib/auth";
import { jwtDecode } from "jwt-decode";
import type { LoginRequest } from "@/types/auth";

interface TokenPayload {
    sub: string;
    nameid: string;
    isSuperadmin?: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();

    async function onSubmit(values: LoginRequest) {
        setLoading(true);
        try {
            const res = await authService.login(values);
            setToken(res.token);
            if (values.Email) {
                localStorage.setItem("email", values.Email);
            }

            if (res.token) {
                try {
                    const decoded = jwtDecode<TokenPayload>(res.token);
                    localStorage.setItem("username", decoded.sub);
                    localStorage.setItem("employeeId", decoded.nameid);
                    localStorage.setItem("isSuperadmin", decoded.isSuperadmin === "true" ? "true" : "false");
                } catch (e) {
                    console.error("Token decode failed", e);
                }
            }

            toast.success("Login successful!");
            router.push(ROUTES.dashboard);
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Invalid Email or password."));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            <div className="w-full max-w-md mx-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
                    <h1 className="text-3xl font-bold text-white text-center mb-2">NEXT-FORCE</h1>
                    <p className="text-blue-200 text-center mb-8">Sign in to your account</p>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="text-sm text-blue-200 mb-1 block">Email</label>
                            <input type="email" {...register("Email", { required: "Email is required" })} className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Enter email" />
                            {errors.Email && <p className="text-red-400 text-xs mt-1">{errors.Email.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm text-blue-200 mb-1 block">Password</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} {...register("Password", { required: "Password is required" })} className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Enter password" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.Password && <p className="text-red-400 text-xs mt-1">{errors.Password.message}</p>}
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 bg-nv-violet hover:bg-nv-violet text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                    <div className="mt-6 text-center space-y-2">
                        <Link href={ROUTES.forgotPassword} className="text-sm text-blue-300 hover:text-white transition-colors">Forgot Password?</Link>
                        <p className="text-sm text-nv-violet">Don&apos;t have an account? <Link href={ROUTES.register} className="text-blue-200 hover:text-white">Register</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
