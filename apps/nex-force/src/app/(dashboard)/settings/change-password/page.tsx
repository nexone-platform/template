"use client";

import { useForm } from "react-hook-form";
import { useChangePassword } from "@/hooks/use-auth";
import { Lock, ShieldCheck, Key } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { PageHeader, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useMessages } from "@/hooks/use-messages";

export default function ChangePasswordPage() {
    const { t } = usePageTranslation();
    const { msg } = useMessages();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const mutation = useChangePassword();

    const onSubmit = (data: any) => {
        mutation.mutate({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword,
            email: localStorage.getItem("email") // In Angular it fetches email from AuthService
        });
    };

    const newPassword = watch("newPassword");

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Change Password', 'Change Password')}
                breadcrumbs={[{ label: t('Dashboard', 'Dashboard'), href: ROUTES.adminDashboard }, { label: t('Change Password', 'Change Password') }]}
            />

            <div className="max-w-lg mx-auto">
                <div className="mb-6 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-nv-violet-light rounded-2xl mb-3">
                        <ShieldCheck className="w-8 h-8 text-nv-violet" />
                    </div>
                    <p className="text-sm text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
                </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            Old Password
                        </label>
                        <input
                            type="password"
                            {...register("oldPassword", { required: msg('VAL_OLD_PASSWORD_REQUIRED', 'Old password is required') })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-nv-violet transition-all outline-none"
                            placeholder="••••••••"
                        />
                        {errors.oldPassword && <p className="text-xs text-red-500 mt-1">{errors.oldPassword.message as string}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-gray-400" />
                            New Password
                        </label>
                        <input
                            type="password"
                            {...register("newPassword", {
                                required: msg('VAL_NEW_PASSWORD_REQUIRED', 'New password is required'),
                                minLength: { value: 6, message: msg('VAL_PASSWORD_MIN_LENGTH', 'Must be at least 6 characters') }
                            })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-nv-violet transition-all outline-none"
                            placeholder="••••••••"
                        />
                        {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message as string}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-gray-400" />
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            {...register("confirmPassword", {
                                required: msg('VAL_CONFIRM_PASSWORD_REQUIRED', 'Please confirm your password'),
                                validate: (val: string) => val === newPassword || msg('VAL_PASSWORD_NOT_MATCH', 'Passwords do not match')
                            })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-nv-violet transition-all outline-none"
                            placeholder="••••••••"
                        />
                        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message as string}</p>}
                    </div>

                    <button
                        disabled={mutation.isPending}
                        type="submit"
                        className="w-full py-4 bg-nv-violet hover:bg-nv-violet-dark text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {mutation.isPending ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
            </div>
        </div>
    );
}
