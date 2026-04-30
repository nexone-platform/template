"use client";

/**
 * Asset Form — replaces Angular's reactive form in assets-main.component.
 *
 * Conversion:
 *   FormGroup + FormBuilder → useForm() from react-hook-form
 *   Validators → Zod schema (assetFormSchema)
 *   formControlName → register()
 *   .get('field')?.invalid && .touched → errors.fieldName
 *   (change)="onFileChange(...)" → separate file state management
 *   mat-select → native <select>
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    assetFormSchema,
    type AssetFormValues,
} from "@/lib/validations/asset.schema";
import type { AssetData } from "@/types/asset";
import type { EmployeeAutocomplete } from "@/types/employee";
import { useState } from "react";
import { getFileName } from "@/lib/utils";
import { getUserProfile } from "@/lib/auth";

interface AssetFormProps {
    asset?: AssetData | null;
    employees: EmployeeAutocomplete[];
    isViewOnly?: boolean;
    onSubmit: (formData: FormData) => void;
    onClose: () => void;
}

export function AssetForm({
    asset,
    employees,
    isViewOnly,
    onSubmit,
    onClose,
}: AssetFormProps) {
    const [files, setFiles] = useState<Record<string, File | null>>({
        assetImg1: null,
        assetImg2: null,
        assetImg3: null,
        assetImg4: null,
    });

    const form = useForm<AssetFormValues>({
        resolver: zodResolver(assetFormSchema) as any,
        defaultValues: asset
            ? {
                assetId: asset.assetId,
                assetName: asset.assetName,
                assetCode: asset.assetCode,
                type: asset.type,
                brand: asset.brand,
                warrantyStart: asset.warrantyStart?.split("T")[0] || "",
                warrantyEnd: asset.warrantyEnd?.split("T")[0] || "",
                warranty: asset.warranty || "",
                cost: String(asset.cost),
                assetUser: String(asset.assetUser),
                assetStatus: asset.status,
                vendor: asset.vendor || "",
                assetModel: asset.assetModel || "",
                serialNumber: asset.serialNumber || "",
                location: asset.location || "",
                condition: "",
                description: asset.description || "",
            }
            : {
                assetId: 0,
                assetName: "",
                assetCode: "",
                type: "",
                brand: "",
                warrantyStart: "",
                warrantyEnd: "",
                warranty: "",
                cost: "",
                assetUser: "",
                assetStatus: "",
                vendor: "",
                assetModel: "",
                serialNumber: "",
                location: "",
                condition: "",
                description: "",
            },
    });

    const { register, handleSubmit, formState: { errors } } = form;

    function handleFileChange(
        e: React.ChangeEvent<HTMLInputElement>,
        key: string
    ) {
        const file = e.target.files?.[0] || null;
        setFiles((prev) => ({ ...prev, [key]: file }));
    }

    function onFormSubmit(values: AssetFormValues) {
        const formData = new FormData();
        const userProfile = getUserProfile();

        // Append form values
        Object.entries(values).forEach(([key, value]) => {
            if (["warrantyStart", "warrantyEnd"].includes(key) && value) {
                formData.append(key, new Date(value as string).toISOString());
            } else if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        // Append files
        Object.entries(files).forEach(([key, file]) => {
            if (file) formData.append(key, file);
        });

        // Append user info
        if (values.assetId > 0) {
            formData.append("updateBy", userProfile || "");
        } else {
            formData.append("createBy", userProfile || "");
        }

        onSubmit(formData);
    }

    const inputClass =
        "w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-nv-violet outline-none transition-colors";
    const errorInputClass = "border-red-400 focus:ring-red-500";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            {/* Row 1: Name + Code */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>
                        Asset Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("assetName")}
                        className={`${inputClass} ${errors.assetName ? errorInputClass : ""}`}
                    />
                    {errors.assetName && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.assetName.message}
                        </p>
                    )}
                </div>
                <div>
                    <label className={labelClass}>
                        Asset Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("assetCode")}
                        className={`${inputClass} ${errors.assetCode ? errorInputClass : ""}`}
                    />
                    {errors.assetCode && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.assetCode.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Row 2: Type + Brand */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>
                        Type <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("type")}
                        className={`${inputClass} ${errors.type ? errorInputClass : ""}`}
                    />
                    {errors.type && (
                        <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
                    )}
                </div>
                <div>
                    <label className={labelClass}>
                        Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("brand")}
                        className={`${inputClass} ${errors.brand ? errorInputClass : ""}`}
                    />
                    {errors.brand && (
                        <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>
                    )}
                </div>
            </div>

            {/* Row 3: Warranty Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>
                        Warranty Start <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        {...register("warrantyStart")}
                        className={`${inputClass} ${errors.warrantyStart ? errorInputClass : ""}`}
                    />
                    {errors.warrantyStart && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.warrantyStart.message}
                        </p>
                    )}
                </div>
                <div>
                    <label className={labelClass}>
                        Warranty End <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        {...register("warrantyEnd")}
                        className={`${inputClass} ${errors.warrantyEnd ? errorInputClass : ""}`}
                    />
                    {errors.warrantyEnd && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.warrantyEnd.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Row 4: Vendor + Model */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Manufacturer</label>
                    <input {...register("vendor")} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Model</label>
                    <input {...register("assetModel")} className={inputClass} />
                </div>
            </div>

            {/* Row 5: Serial + Location */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>
                        Serial Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("serialNumber")}
                        className={`${inputClass} ${errors.serialNumber ? errorInputClass : ""}`}
                    />
                    {errors.serialNumber && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.serialNumber.message}
                        </p>
                    )}
                </div>
                <div>
                    <label className={labelClass}>Location</label>
                    <input {...register("location")} className={inputClass} />
                </div>
            </div>

            {/* Row 6: Condition + Warranty (months) */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Condition</label>
                    <input {...register("condition")} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>
                        Warranty (months) <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("warranty")}
                        placeholder="In Months"
                        className={`${inputClass} ${errors.warranty ? errorInputClass : ""}`}
                    />
                    {errors.warranty && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.warranty.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Row 7: Value + Asset User */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>
                        Value <span className="text-red-500">*</span>
                    </label>
                    <input
                        {...register("cost")}
                        placeholder="$"
                        className={`${inputClass} ${errors.cost ? errorInputClass : ""}`}
                    />
                    {errors.cost && (
                        <p className="text-red-500 text-xs mt-1">{errors.cost.message}</p>
                    )}
                </div>
                <div>
                    <label className={labelClass}>
                        Asset User <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register("assetUser")}
                        className={`${inputClass} ${errors.assetUser ? errorInputClass : ""}`}
                    >
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.firstNameEn} {emp.lastNameEn}
                            </option>
                        ))}
                    </select>
                    {errors.assetUser && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.assetUser.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div>
                <label className={labelClass}>Description</label>
                <textarea {...register("description")} rows={3} className={inputClass} />
            </div>

            {/* Status */}
            <div className="w-1/2">
                <label className={labelClass}>
                    Status <span className="text-red-500">*</span>
                </label>
                <select
                    {...register("assetStatus")}
                    className={`${inputClass} ${errors.assetStatus ? errorInputClass : ""}`}
                >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Deployed">Deployed</option>
                </select>
                {errors.assetStatus && (
                    <p className="text-red-500 text-xs mt-1">
                        {errors.assetStatus.message}
                    </p>
                )}
            </div>

            {/* Image uploads */}
            <div className="grid grid-cols-2 gap-4">
                {(["assetImg1", "assetImg2", "assetImg3", "assetImg4"] as const).map(
                    (key, idx) => (
                        <div key={key}>
                            <label className={labelClass}>Asset Image {idx + 1}</label>
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, key)}
                                className={inputClass}
                                accept="image/*"
                            />
                            {(files[key] || asset?.[key as keyof AssetData]) && (
                                <p className="text-xs text-nv-violet mt-1">
                                    {getFileName(
                                        files[key] ||
                                        (asset?.[key as keyof AssetData] as string) ||
                                        null
                                    )}
                                </p>
                            )}
                        </div>
                    )
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
                {isViewOnly && (
                    <button
                        type="submit"
                        className="px-6 py-2 text-sm bg-nv-violet text-white rounded-lg hover:bg-nv-violet-dark transition-colors"
                    >
                        Submit
                    </button>
                )}
            </div>
        </form>
    );
}
