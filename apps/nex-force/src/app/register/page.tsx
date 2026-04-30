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
import { useMessages } from "@/hooks/use-messages";
import { usePageTranslation } from "@/lib/language";
import type { RegisterRequest } from "@/types/auth";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterRequest>();
    const { showSuccess } = useMessages();
    const { t } = usePageTranslation("register");

    async function onSubmit(values: RegisterRequest) {
        setLoading(true);
        try {
            await authService.register(values);
            await showSuccess("REG_SUCCESS", "Registration Successful", "Your account has been created. Please sign in to continue.");
            router.push(ROUTES.login);
        } catch (err) {
            toast.error(getApiErrorMessage(err, "Failed to register. Please try again."));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12">
            <div className="w-full max-w-lg mx-4">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
                    <h1 className="text-3xl font-bold text-white text-center mb-2">NEXT-FORCE</h1>
                    <p className="text-blue-200 text-center mb-8">{t('Create your account', 'Create your account')}</p>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-sm text-blue-200 mb-1 block">{t('Employee ID', 'Employee ID')}</label>
                            <input type="text" autoComplete="off" {...register("EmployeeId", { required: t('Employee ID is required', 'Employee ID is required') })} className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-400 outline-none" placeholder={t('Enter Employee ID', 'Enter Employee ID (e.g. 2312-002)')} />
                            {errors.EmployeeId && <p className="text-red-400 text-xs mt-1">{errors.EmployeeId.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm text-blue-200 mb-1 block">{t('Email', 'Email')}</label>
                            <input type="email" autoComplete="email" {...register("Email", { required: t('Email is required', 'Email is required') })} className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-400 outline-none" placeholder={t('Enter email', 'Enter email')} />
                            {errors.Email && <p className="text-red-400 text-xs mt-1">{errors.Email.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm text-blue-200 mb-1 block">{t('Password', 'Password')}</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} autoComplete="new-password" {...register("Password", { required: t('Password is required', 'Password is required'), minLength: { value: 6, message: t('Password min length', 'Password must be at least 6 characters') } })} className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-400 outline-none" placeholder={t('Enter password', 'Enter password')} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.Password && <p className="text-red-400 text-xs mt-1">{errors.Password.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm text-blue-200 mb-1 block">{t('Confirm Password', 'Confirm Password')}</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} autoComplete="new-password" {...register("ConfirmPassword", { required: t('Confirm Password is required', 'Confirm Password is required') })} className="w-full px-4 py-3 pr-10 bg-white/5 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:ring-2 focus:ring-blue-400 outline-none" placeholder={t('Confirm password', 'Confirm password')} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors">
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.ConfirmPassword && <p className="text-red-400 text-xs mt-1">{errors.ConfirmPassword.message}</p>}
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 mt-4 bg-nv-violet hover:bg-nv-violet text-white font-semibold rounded-xl transition-all disabled:opacity-50">
                            {loading ? t('Creating...', 'Creating Account...') : t('Sign Up', 'Sign Up')}
                        </button>
                    </form>
                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-nv-violet">{t('Already have account', 'Already have an account?')} <Link href={ROUTES.login} className="text-blue-200 hover:text-white">{t('Sign In', 'Sign In')}</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
