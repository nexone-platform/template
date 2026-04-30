"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { getUserProfile } from "@/lib/auth";
import { useEmployeeById, useUpdateEmployee, useBankData, useDepartments, useDesignations, useEmployees } from "@/features/employees/hooks/use-employees";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";
import {
    Pencil, Plus, Trash2, Save, X, RefreshCw
} from "lucide-react";
import { FormField, ui } from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";

/* ── Types ── */
interface EducationRow { institution: string; subject: string; startingDate: string; completeDate: string; degree: string; grade: string; }
interface ExperienceRow { companyName: string; location: string; jobPosition: string; periodFrom: string; periodTo: string; }
interface FamilyRow { name: string; relationship: string; dateOfBirth: string; phone: string; }

interface ProfileFormData {
    firstNameEn: string; lastNameEn: string; birthDate: string; gender: string;
    address: string; state: string; country: string; pinCode: string; phone: string;
    departmentId: number | string; designationId: number | string; reportsTo: number | string;
    employeeId: string; email: string; roleId: number | string; organizationCode: string;
}
interface PersonalFormData {
    passportNo: string; passportExpiryDate: string; tel: string; nationality: string;
    religion: string; maritalStatus: number | string; employmentOfSpouse: string; numberOfChildren: string;
}
interface EmergencyFormData {
    primaryContactName: string; primaryContactRelationship: string; primaryContactPhone1: string; primaryContactPhone2: string;
    secondaryContactName: string; secondaryContactRelationship: string; secondaryContactPhone1: string; secondaryContactPhone2: string;
}
interface BankFormData { bankId: number | string; bankAccountNo: string; bankName: string; bankCode: string; branch: string; }
interface EmploymentFormData { paymentTypeId: string; employeeTypeId: string; effectiveDate: string; salary: string; designationId: string; }

type TabKey = "profile" | "personal" | "emergency" | "bank" | "education" | "experience" | "family" | "employment" | "assets";

/* ── Component ── */
export default function EmployeeProfilePage() {
    const { t, currentLang } = usePageTranslation('employee-profile');
    const { showSuccess, showError } = useMessages();
    const params = useParams();
    const router = useRouter();
    const employeeId = Number(params.id);
    const isNew = employeeId === 0 || isNaN(employeeId);

    const { data: employee, isLoading } = useEmployeeById(employeeId);
    const updateMutation = useUpdateEmployee();
    const { data: departments } = useDepartments();
    const { data: designations } = useDesignations();
    const { data: employeesData } = useEmployees();
    const { data: bankData } = useBankData();

    // Master data
    const { data: genders } = useQuery({ queryKey: ["genders"], queryFn: async () => { const { data } = await apiClient.get<unknown[]>("gender/getAllGender"); return data as { genderId: number; genderName: string }[]; } });
    const { data: maritalStatuses } = useQuery({ queryKey: ["maritalStatuses"], queryFn: async () => { const { data } = await apiClient.get<unknown[]>("maritalStatus/getAllMaritalStatus"); return data as { maritalStatusId: number; maritalStatusName: string }[]; } });
    const { data: roles } = useQuery({ 
        queryKey: ["roles"], 
        queryFn: async () => { 
            const { data } = await apiClient.get<any>("role"); 
            if (Array.isArray(data)) return data;
            if (data?.data && Array.isArray(data.data)) return data.data;
            if (data?.Data && Array.isArray(data.Data)) return data.Data;
            return [];
        } 
    });
    const { data: paymentTypes } = useQuery({ queryKey: ["paymentTypes"], queryFn: async () => { const { data } = await apiClient.get<{ data: unknown[] }>("paymentType"); return (data?.data || []) as { paymentTypeId: number; paymentTypeNameEn: string }[]; } });
    const { data: employeeTypes } = useQuery({ queryKey: ["employeeTypes"], queryFn: async () => { const { data } = await apiClient.get<{ data: unknown[] }>("employees/getEmployeeType"); return (data?.data || []) as { employeeTypeId: number; employeeTypeNameEn: string }[]; } });
    const { data: employment } = useQuery({ queryKey: ["employment", employeeId], queryFn: async () => { const { data } = await apiClient.get<Record<string, unknown>>(`employment/${employeeId}`); return data; }, enabled: employeeId > 0 });
    const { data: employmentHistory } = useQuery({ queryKey: ["employmentHistory", employeeId], queryFn: async () => { const { data } = await apiClient.get<{ data: unknown[] }>(`employment/histories/${employeeId}`); return (data?.data || []) as Record<string, unknown>[]; }, enabled: employeeId > 0 });
    const { data: organizations } = useQuery({ queryKey: ["organizations"], queryFn: async () => { const { data } = await apiClient.get<unknown[]>("organizations/getMasterOrganization"); return data as { organizationId: number; organizationCode: string; organizationName: string; clientId: number }[]; } });
    const { data: assetsList } = useQuery({ queryKey: ["assets", employeeId], queryFn: async () => { const { data } = await apiClient.get<Record<string, unknown>[]>(`asset/getAssets/${employeeId}`); return data || []; }, enabled: employeeId > 0 });

    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<TabKey>("profile");
    const [editModal, setEditModal] = useState<TabKey | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string>("");
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // ── Local display state (Angular: this.employee, this.personalInfo, this.emergencyContacts, this.bankInfo) ──
    // Updated when user clicks "Apply" in modal — mirrors form values for immediate display.
    const [displayData, setDisplayData] = useState<Record<string, unknown>>({});

    // ── Forms ──
    const profileForm = useForm<ProfileFormData>();
    const personalForm = useForm<PersonalFormData>();
    const emergencyForm = useForm<EmergencyFormData>();
    const bankForm = useForm<BankFormData>();
    const employmentForm = useForm<EmploymentFormData>();
    const educationForm = useForm<{ educations: EducationRow[] }>({ defaultValues: { educations: [] } });
    const experienceForm = useForm<{ experiences: ExperienceRow[] }>({ defaultValues: { experiences: [] } });
    const familyForm = useForm<{ familyMembers: FamilyRow[] }>({ defaultValues: { familyMembers: [] } });

    const eduFields = useFieldArray({ control: educationForm.control, name: "educations" });
    const expFields = useFieldArray({ control: experienceForm.control, name: "experiences" });
    const famFields = useFieldArray({ control: familyForm.control, name: "familyMembers" });

    const deptList = useMemo(() => (departments as unknown as { data?: unknown[] })?.data as { departmentId: number; departmentNameEn: string }[] || [], [departments]);
    const desigList = useMemo(() => (designations as unknown as { data?: unknown[] })?.data as { designationId: number; designationNameEn: string }[] || [], [designations]);
    const reportToList = useMemo(() => (employeesData as unknown as { data?: unknown[] })?.data as { id: number; firstNameEn: string; lastNameEn: string }[] || [], [employeesData]);
    const bankList = Array.isArray(bankData) ? bankData as unknown as { bankId: number; bankNameEn: string; abbreviation: string }[] : ((bankData as unknown as { data?: unknown[] })?.data || []) as { bankId: number; bankNameEn: string; abbreviation: string }[];

    // ── Role ↔ Department filter (Angular: onDepartmentChange) ──
    const watchedDepartmentId = profileForm.watch("departmentId");
    const watchedRoleId = profileForm.watch("roleId");
    const filteredRoles = useMemo(() => {
        if (!roles || roles.length === 0) return [];
        let rList = roles;

        // 1. Exclude Super Admin globally
        rList = rList.filter((r: any) => {
            const rName = (r.roleName || "").toLowerCase();
            return rName !== 'super admin' && rName !== 'superadmin';
        });

        // 2. Filter by department if a department is selected
        if (watchedDepartmentId) {
            rList = rList.filter((r: { departmentId?: number; roleId?: number | string }) => 
                r.departmentId === Number(watchedDepartmentId) || 
                String(r.roleId) === String(watchedRoleId) // Keep currently selected role valid
            );
        }

        return rList;
    }, [roles, watchedDepartmentId, watchedRoleId]);

    // ── Designation ↔ Department filter ──
    const watchedDesignationId = profileForm.watch("designationId");
    const filteredDesignations = useMemo(() => {
        if (!desigList || desigList.length === 0) return [];
        let dList = desigList;

        if (watchedDepartmentId) {
            dList = dList.filter((d: { departmentId?: number; designationId?: number | string }) => 
                Number(d.departmentId) === Number(watchedDepartmentId) || 
                String(d.designationId) === String(watchedDesignationId)
            );
        }

        return dList;
    }, [desigList, watchedDepartmentId, watchedDesignationId]);

    // ── Reactivate Employee ──
    const reactivateMutation = useMutation({
        mutationFn: async () => {
            const { data } = await apiClient.post(`employees/reactivate/${employeeId}`, { Username: getUserProfile() });
            return data;
        },
        onSuccess: () => {
            showSuccess('SAVE_SUCCESS', 'Success', t('Employee reactivated successfully', 'Employee reactivated successfully'));
            queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
        },
        onError: (err) => {
            showError('SAVE_ERROR', 'Error', getApiErrorMessage(err, t('Failed to reactivate', 'Failed to reactivate')));
        },
    });

    // ── Patch data on load ──
    useEffect(() => {
        if (!employee) return;
        const emp = employee as unknown as Record<string, unknown>;

        profileForm.reset({
            firstNameEn: (emp.firstNameEn as string) || "", lastNameEn: (emp.lastNameEn as string) || "",
            birthDate: (emp.birthDate as string) || "", gender: String(emp.gender || ""),
            address: (emp.address as string) || "", state: (emp.state as string) || "",
            country: (emp.country as string) || "", pinCode: (emp.pinCode as string) || "",
            phone: (emp.phone as string) || "", departmentId: String(emp.departmentId || ""),
            designationId: String(emp.designationId || ""), reportsTo: String(emp.reportsTo || ""),
            employeeId: (emp.employeeId as string) || "", email: (emp.email as string) || "",
            roleId: String(emp.roleId || ""), organizationCode: (emp.organizationCode as string) || "",
        });

        personalForm.reset({
            passportNo: (emp.passportNo as string) || "", passportExpiryDate: (emp.passportExpiryDate as string) || "",
            tel: (emp.tel as string) || "", nationality: (emp.nationality as string) || "",
            religion: (emp.religion as string) || "", maritalStatus: emp.maritalStatus as number || "",
            employmentOfSpouse: (emp.employmentOfSpouse as string) || "", numberOfChildren: String(emp.noOfChildren || ""),
        });

        emergencyForm.reset({
            primaryContactName: (emp.primaryContactName as string) || "", primaryContactRelationship: (emp.primaryContactRelationship as string) || "",
            primaryContactPhone1: (emp.primaryContactPhone1 as string) || "", primaryContactPhone2: (emp.primaryContactPhone2 as string) || "",
            secondaryContactName: (emp.secondaryContactName as string) || "", secondaryContactRelationship: (emp.secondaryContactRelationship as string) || "",
            secondaryContactPhone1: (emp.secondaryContactPhone1 as string) || "", secondaryContactPhone2: (emp.secondaryContactPhone2 as string) || "",
        });

        bankForm.reset({
            bankId: emp.bankId as number || "", bankAccountNo: (emp.bankAccountNo as string) || "",
            bankName: (emp.bankName as string) || "", bankCode: (emp.bankCode as string) || "",
            branch: (emp.branch as string) || "",
        });

        setPreviewImage((emp.imgPath as string) || "");
        // Initialize displayData from API data (Angular: patchValue sets this.employee)
        setDisplayData({ ...emp });

        try { const edu = JSON.parse((emp.educationInformations as string) || "[]"); educationForm.reset({ educations: edu }); } catch { /* empty */ }
        try { const exp = JSON.parse((emp.experience as string) || "[]"); experienceForm.reset({ experiences: exp }); } catch { /* empty */ }
        try { const fam = JSON.parse((emp.familyInformations as string) || "[]"); familyForm.reset({ familyMembers: fam }); } catch { /* empty */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employee]);

    // Patch employment
    useEffect(() => {
        if (!employment) return;
        const emp = employment as Record<string, unknown>;
        employmentForm.reset({
            paymentTypeId: String(emp.paymentTypeId || ""), employeeTypeId: String(emp.employeeTypeId || ""),
            effectiveDate: (emp.effectiveDate as string) || "", salary: String(emp.salary || ""),
            designationId: String(emp.designationId || ""),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employment]);


    // ── File handler ──
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // ── Date range validators (Angular: isEducationDateInvalid / isExperienceDateInvalid) ──
    const validateDateRanges = useCallback(() => {
        const errors: string[] = [];
        const eduData = educationForm.getValues().educations;
        eduData.forEach((edu, i) => {
            if (edu.startingDate && edu.completeDate && new Date(edu.startingDate) > new Date(edu.completeDate)) {
                errors.push(`Education #${i + 1}: Starting date must not be later than complete date`);
            }
        });
        const expData = experienceForm.getValues().experiences;
        expData.forEach((exp, i) => {
            if (exp.periodFrom && exp.periodTo && new Date(exp.periodFrom) > new Date(exp.periodTo)) {
                errors.push(`Experience #${i + 1}: Period From must not be later than Period To`);
            }
        });
        return errors;
    }, [educationForm, experienceForm]);

    // ── Multi-form validation (Angular: onSave formMap validation) ──
    const validateAllForms = useCallback(() => {
        const errors: string[] = [];
        const profile = profileForm.getValues();
        if (!profile.firstNameEn) errors.push(t('First Name is required', 'First Name is required'));
        if (!profile.lastNameEn) errors.push(t('Last Name is required', 'Last Name is required'));
        if (!profile.employeeId) errors.push(t('Employee ID is required', 'Employee ID is required'));
        if (!profile.email) errors.push(t('Email is required', 'Email is required'));
        if (!profile.departmentId) errors.push(t('Department is required', 'Department is required'));
        if (!profile.designationId) errors.push(t('Designation is required', 'Designation is required'));
        if (!profile.roleId) errors.push(t('Role is required', 'Role is required'));

        const personal = personalForm.getValues();
        if (!personal.nationality) errors.push(t('Nationality is required', 'Nationality is required'));
        if (!personal.maritalStatus) errors.push(t('Marital Status is required', 'Marital Status is required'));

        // Date range checks
        errors.push(...validateDateRanges());
        return errors;
    }, [profileForm, personalForm, validateDateRanges, t]);

    // ── Save all ──
    const onSave = useCallback(() => {
        // Step 1: validate all forms (Angular: formMap check)
        const errors = validateAllForms();
        if (errors.length > 0) {
            setValidationErrors(errors);
            showError('VAL_ERROR', 'Error', t('Please fix the following errors', 'Please fix the following errors'));
            return;
        }
        setValidationErrors([]);

        const profile = profileForm.getValues();
        const personal = personalForm.getValues();
        const emergency = emergencyForm.getValues();
        const bank = bankForm.getValues();
        const empForm = employmentForm.getValues();
        const eduData = educationForm.getValues().educations;
        const expData = experienceForm.getValues().experiences;
        const famData = familyForm.getValues().familyMembers;

        const org = organizations?.find(o => o.organizationCode === profile.organizationCode);

        const formData = new FormData();
        formData.append("username", getUserProfile() || "");
        formData.append("id", String(isNew ? 0 : employeeId));

        Object.entries(profile).forEach(([k, v]) => {
            if (k === "organizationCode" && org) {
                formData.append("organizationId", String(org.organizationId));
                formData.append("clientId", String(org.clientId));
            }
            if (v !== undefined && v !== null) formData.append(k, String(v));
        });

        Object.entries(personal).forEach(([k, v]) => {
            if (k === "passportExpiryDate" && v) {
                formData.append(k, new Date(v).toISOString());
            } else if (v !== undefined && v !== null) {
                formData.append(k, String(v));
            }
        });

        // Handle birthDate separately
        if (profile.birthDate) {
            formData.set("birthDate", new Date(profile.birthDate).toISOString());
        }

        Object.entries(emergency).forEach(([k, v]) => { if (v) formData.append(k, String(v)); });
        Object.entries(bank).forEach(([k, v]) => { if (v) formData.append(k, String(v)); });

        // Sync designationId from profile to employment (Angular: line 851-853)
        const empFormData = { ...empForm, designationId: String(profile.designationId || empForm.designationId) };
        Object.entries(empFormData).forEach(([k, v]) => {
            if (k === "effectiveDate" && v) {
                formData.append(k, new Date(v).toISOString());
            } else if (v) {
                formData.append(k, String(v));
            }
        });

        formData.append("educationInformations", JSON.stringify(eduData));
        formData.append("experience", JSON.stringify(expData));
        formData.append("familyInformations", JSON.stringify(famData));

        if (selectedFile) formData.append("File", selectedFile);

        updateMutation.mutate(formData, {
            onSuccess: async () => {
                await showSuccess("SAVE_SUCCESS", "Success", "Employee profile has been saved successfully.");
                router.push(ROUTES.employeePage);
            },
            onError: (err) => {
                showError('SAVE_ERROR', 'Error', getApiErrorMessage(err, t('Something went wrong', 'Something went wrong')));
            },
        });
    }, [employeeId, isNew, profileForm, personalForm, emergencyForm, bankForm, employmentForm, educationForm, experienceForm, familyForm, selectedFile, organizations, updateMutation, router, validateAllForms, t, showSuccess, showError]);

    // ── Apply handler — updates local displayData from form values (Angular: onSubmitProfile, onSubmitInformation, etc.) ──
    const handleApply = useCallback(() => {
        const profile = profileForm.getValues();
        const personal = personalForm.getValues();
        const emergency = emergencyForm.getValues();
        const bank = bankForm.getValues();

        // Resolve names from master data lists (Angular: onSubmitProfile resolves department/designation/gender names)
        const dept = deptList.find(d => String(d.departmentId) === String(profile.departmentId));
        const desig = desigList.find(d => String(d.designationId) === String(profile.designationId));
        const genderObj = genders?.find(g => String(g.genderId) === String(profile.gender));
        const msObj = maritalStatuses?.find(m => String(m.maritalStatusId) === String(personal.maritalStatus));
        const reportToObj = reportToList.find(e => String(e.id) === String(profile.reportsTo));
        const org = organizations?.find(o => o.organizationCode === profile.organizationCode);

        setDisplayData(prev => ({
            ...prev,
            // Profile fields
            firstNameEn: profile.firstNameEn,
            lastNameEn: profile.lastNameEn,
            employeeId: profile.employeeId,
            email: profile.email,
            phone: profile.phone,
            birthDate: profile.birthDate,
            address: profile.address,
            state: profile.state,
            country: profile.country,
            pinCode: profile.pinCode,
            department: dept?.departmentNameEn || "",
            designation: desig?.designationNameEn || "",
            genderName: genderObj?.genderName || "",
            reportToData: reportToObj ? { name: `${reportToObj.firstNameEn} ${reportToObj.lastNameEn}` } : null,
            organization: org?.organizationName || "",
            roleId: profile.roleId,
            // Personal info fields
            passportNo: personal.passportNo,
            passportExpiryDate: personal.passportExpiryDate,
            tel: personal.tel,
            nationality: personal.nationality,
            religion: personal.religion,
            maritalStatusName: msObj?.maritalStatusName || "",
            employmentOfSpouse: personal.employmentOfSpouse,
            // Emergency contacts
            primaryContactName: emergency.primaryContactName,
            primaryContactRelationship: emergency.primaryContactRelationship,
            primaryContactPhone1: emergency.primaryContactPhone1,
            primaryContactPhone2: emergency.primaryContactPhone2,
            secondaryContactName: emergency.secondaryContactName,
            secondaryContactRelationship: emergency.secondaryContactRelationship,
            secondaryContactPhone1: emergency.secondaryContactPhone1,
            secondaryContactPhone2: emergency.secondaryContactPhone2,
            // Bank info
            bankName: bank.bankName,
            bankAccountNo: bank.bankAccountNo,
            bankCode: bank.bankCode,
            branch: bank.branch,
            bankId: bank.bankId,
        }));

        setEditModal(null);
    }, [profileForm, personalForm, emergencyForm, bankForm, deptList, desigList, genders, maritalStatuses, reportToList, organizations]);

    if (isLoading) return <div className="flex items-center justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

    // Use displayData (updated on Apply) falling back to original API data
    const emp = { ...((employee || {}) as Record<string, unknown>), ...displayData };


    return (
        <div className={ui.pageContainer}>
            {/* ── Page Header ── */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t('Profile', 'Profile')}</h1>
                    <nav className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Link href={ROUTES.employeePage} className="hover:text-nv-violet">{t('Dashboard', 'Dashboard')}</Link>
                        <span>/</span>
                        <span className="text-gray-400">{t('Profile', 'Profile')}</span>
                    </nav>
                </div>
                <div className="flex items-center gap-2">
                    {!isNew && !emp.isActive && (
                        <button
                            onClick={() => reactivateMutation.mutate()}
                            disabled={reactivateMutation.isPending}
                            className={`flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-sm`}
                        >
                            <RefreshCw className={`w-4 h-4 ${reactivateMutation.isPending ? 'animate-spin' : ''}`} />
                            {t('Reactivate', 'Reactivate')}
                        </button>
                    )}
                    <button onClick={onSave} disabled={updateMutation.isPending} className={`flex items-center gap-2 ${ui.btnPrimary}`}>
                        <Save className="w-4 h-4" /> {updateMutation.isPending ? t('Saving...', 'Saving...') : t('Save', 'Save')}
                    </button>
                </div>
            </div>

            {/* ── Validation Errors ── */}
            {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-semibold text-red-700 mb-2">{t('Please fix the following errors', 'Please fix the following errors')}:</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((err, i) => (
                            <li key={i} className="text-sm text-red-600">{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── Profile Card (top) ── */}
            <div className="bg-white rounded-xl shadow-sm border mb-4">
                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left: Avatar + Name */}
                        <div className="flex items-start gap-4 md:w-2/5">
                            <div className="relative shrink-0">
                                {previewImage ? (
                                    <img src={previewImage} alt="profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" onError={() => setPreviewImage("")} />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                                        {(emp.firstNameEn as string)?.charAt(0) || "?"}{(emp.lastNameEn as string)?.charAt(0) || ""}
                                    </div>
                                )}
                                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-nv-violet rounded-full flex items-center justify-center cursor-pointer shadow hover:bg-nv-violet">
                                    <Pencil className="w-3 h-3 text-white" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {(emp.firstNameEn as string) || t('New Employee', 'New Employee')} {emp.lastNameEn as string || ""}
                                </h2>
                                <p className="text-sm text-gray-500">{emp.department as string || "—"}</p>
                                <p className="text-sm text-gray-500">{emp.designation as string || "—"}</p>
                                {typeof emp.organization === 'string' && emp.organization && <p className="text-sm text-gray-400">{emp.organization}</p>}
                                <p className="text-sm text-gray-600 mt-1">{t('Employee ID', 'Employee ID')}: {(emp.employeeId as string) || "—"}</p>
                                <p className="text-sm text-gray-400">{t('Date of Join', 'Date of Join')}: {formatDate(emp.joinDate as string) || "—"}</p>
                                {typeof emp.resignationDate === 'string' && emp.resignationDate && <p className="text-sm text-red-400">{t('Resignation Date', 'Resignation Date')}: {formatDate(emp.resignationDate)}</p>}
                                {!isNew && !emp.isActive && (
                                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-red-100 text-red-600">{t('Inactive', 'Inactive')}</span>
                                )}
                            </div>
                        </div>
                        {/* Right: Quick Info */}
                        <div className="md:w-3/5">
                            <ul className="space-y-2 text-sm">
                                <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Phone', 'Phone')}:</span><span className="text-gray-800">{emp.phone as string || "—"}</span></li>
                                <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Email', 'Email')}:</span><span className="text-nv-violet">{emp.email as string || "—"}</span></li>
                                <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Birth Date', 'Birth Date')}:</span><span className="text-gray-800">{formatDate(emp.birthDate as string) || "—"}</span></li>
                                <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Address', 'Address')}:</span><span className="text-gray-800">{`${emp.address || ""} ${emp.state || ""} ${emp.country || ""} ${emp.pinCode || ""}`.trim() || "—"}</span></li>
                                <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Gender', 'Gender')}:</span><span className="text-gray-800">{emp.genderName as string || "—"}</span></li>
                                <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Reports To', 'Reports To')}:</span><span className="text-gray-800">{emp.reportToData ? `${(emp.reportToData as Record<string, string>).name || ""}` : "—"}</span></li>
                            </ul>
                        </div>
                        {/* Edit icon */}
                        <button onClick={() => setEditModal("profile")} className="absolute top-4 right-4 text-gray-400 hover:text-nv-violet" style={{position:'relative'}}><Pencil className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="bg-white rounded-xl shadow-sm border mb-4">
                <div className="flex border-b overflow-x-auto">
                    {([
                        { key: "profile" as TabKey, label: t('Profile', 'Profile') },
                        { key: "assets" as TabKey, label: t('Assets', 'Assets') },
                        { key: "employment" as TabKey, label: t('Employment', 'Employment') },
                    ] as { key: TabKey; label: string }[]).map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? "border-orange-500 text-nv-danger" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ── */}
            {activeTab === "profile" && (
                <div className="space-y-4">
                    {/* Row 1: Personal Info + Emergency Contacts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Personal Information */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-base font-semibold text-gray-800">{t('Personal Info', 'Personal Information')}</h3>
                                    <button onClick={() => setEditModal("personal")} className="text-gray-400 hover:text-nv-violet"><Pencil className="w-4 h-4" /></button>
                                </div>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex"><span className="w-40 text-gray-500 shrink-0">{t('Passport No', 'Passport No')}</span><span className="text-gray-800">{emp.passportNo as string || "—"}</span></li>
                                    <li className="flex"><span className="w-40 text-gray-500 shrink-0">{t('Passport Expiry', 'Passport Expiry')}</span><span className="text-gray-800">{formatDate(emp.passportExpiryDate as string) || "—"}</span></li>
                                    <li className="flex"><span className="w-40 text-gray-500 shrink-0">{t('Tel', 'Tel')}</span><span className="text-gray-800">{emp.tel as string || "—"}</span></li>
                                    <li className="flex"><span className="w-40 text-gray-500 shrink-0">{t('Nationality', 'Nationality')}</span><span className="text-gray-800">{emp.nationality as string || "—"}</span></li>
                                    <li className="flex"><span className="w-40 text-gray-500 shrink-0">{t('Religion', 'Religion')}</span><span className="text-gray-800">{emp.religion as string || "—"}</span></li>
                                    <li className="flex"><span className="w-40 text-gray-500 shrink-0">{t('Marital Status', 'Marital Status')}</span><span className="text-gray-800">{emp.maritalStatusName as string || "—"}</span></li>
                                    <li className="flex"><span className="w-40 text-gray-500 shrink-0">{t('Employment of Spouse', 'Employment of Spouse')}</span><span className="text-gray-800">{emp.employmentOfSpouse as string || "—"}</span></li>
                                </ul>
                            </div>
                        </div>

                        {/* Emergency Contacts */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-base font-semibold text-gray-800">{t('Emergency Contact', 'Emergency Contacts')}</h3>
                                    <button onClick={() => setEditModal("emergency")} className="text-gray-400 hover:text-nv-violet"><Pencil className="w-4 h-4" /></button>
                                </div>
                                <h4 className="text-sm font-medium text-nv-violet mb-2">{t('Primary Contact', 'Primary Contact')}</h4>
                                <ul className="space-y-2 text-sm mb-4">
                                    <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Name', 'Name')}</span><span className="text-gray-800">{emp.primaryContactName as string || "—"}</span></li>
                                    <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Relationship', 'Relationship')}</span><span className="text-gray-800">{emp.primaryContactRelationship as string || "—"}</span></li>
                                    <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Phone', 'Phone')}</span><span className="text-gray-800">{[emp.primaryContactPhone1, emp.primaryContactPhone2].filter(Boolean).join(", ") || "—"}</span></li>
                                </ul>
                                <hr className="my-3" />
                                <h4 className="text-sm font-medium text-nv-violet mb-2">{t('Secondary Contact', 'Secondary Contact')}</h4>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Name', 'Name')}</span><span className="text-gray-800">{emp.secondaryContactName as string || "—"}</span></li>
                                    <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Relationship', 'Relationship')}</span><span className="text-gray-800">{emp.secondaryContactRelationship as string || "—"}</span></li>
                                    <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Phone', 'Phone')}</span><span className="text-gray-800">{[emp.secondaryContactPhone1, emp.secondaryContactPhone2].filter(Boolean).join(", ") || "—"}</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Bank Info + Family Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Bank Information */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-base font-semibold text-gray-800">{t('Bank Information', 'Bank Information')}</h3>
                                    <button onClick={() => setEditModal("bank")} className="text-gray-400 hover:text-nv-violet"><Pencil className="w-4 h-4" /></button>
                                </div>
                                <ul className="space-y-3 text-sm">
                                    <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Bank', 'Bank')}</span><span className="text-gray-800">{emp.bankName as string || "—"}</span></li>
                                    <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Account No', 'Account No')}</span><span className="text-gray-800">{emp.bankAccountNo as string || "—"}</span></li>
                                    <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Bank Code', 'Bank Code')}</span><span className="text-gray-800">{emp.bankCode as string || "—"}</span></li>
                                    <li className="flex"><span className="w-32 text-gray-500 shrink-0">{t('Branch', 'Branch')}</span><span className="text-gray-800">{emp.branch as string || "—"}</span></li>
                                </ul>
                            </div>
                        </div>

                        {/* Family Information */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-base font-semibold text-gray-800">{t('Family Information', 'Family Information')}</h3>
                                    <button onClick={() => setEditModal("family")} className="text-gray-400 hover:text-nv-violet"><Pencil className="w-4 h-4" /></button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b">
                                            <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium">{t('Name', 'Name')}</th>
                                            <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium">{t('Relationship', 'Relationship')}</th>
                                            <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium">{t('Date of Birth', 'Date of Birth')}</th>
                                            <th className="text-left py-2 px-2 text-xs text-gray-500 font-medium">{t('Phone', 'Phone')}</th>
                                        </tr></thead>
                                        <tbody>
                                            {familyForm.getValues().familyMembers.map((f, i) => (
                                                <tr key={i} className="border-b last:border-0">
                                                    <td className="py-2 px-2 text-gray-800">{f.name || "—"}</td>
                                                    <td className="py-2 px-2 text-gray-800">{f.relationship || "—"}</td>
                                                    <td className="py-2 px-2 text-gray-800">{formatDate(f.dateOfBirth) || "—"}</td>
                                                    <td className="py-2 px-2 text-gray-800">{f.phone || "—"}</td>
                                                </tr>
                                            ))}
                                            {familyForm.getValues().familyMembers.length === 0 && (
                                                <tr><td colSpan={4} className="py-4 text-center text-gray-400">—</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Education + Experience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Education (timeline style) */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-base font-semibold text-gray-800">{t('Education', 'Education')}</h3>
                                    <button onClick={() => setEditModal("education")} className="text-gray-400 hover:text-nv-violet"><Pencil className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-4">
                                    {educationForm.getValues().educations.map((edu, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-nv-violet mt-1.5" />
                                                {i < educationForm.getValues().educations.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                                            </div>
                                            <div className="pb-2">
                                                <p className="font-medium text-sm text-gray-800">{edu.institution}</p>
                                                <p className="text-sm text-gray-600">{edu.degree}</p>
                                                <p className="text-xs text-gray-400">{formatDate(edu.startingDate)} - {formatDate(edu.completeDate)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {educationForm.getValues().educations.length === 0 && <p className="text-sm text-gray-400 text-center py-4">—</p>}
                                </div>
                            </div>
                        </div>

                        {/* Experience (timeline style) */}
                        <div className="bg-white rounded-xl shadow-sm border">
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-base font-semibold text-gray-800">{t('Experience', 'Experience')}</h3>
                                    <button onClick={() => setEditModal("experience")} className="text-gray-400 hover:text-nv-violet"><Pencil className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-4">
                                    {experienceForm.getValues().experiences.map((exp, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-nv-violet mt-1.5" />
                                                {i < experienceForm.getValues().experiences.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                                            </div>
                                            <div className="pb-2">
                                                <p className="font-medium text-sm text-gray-800">{exp.jobPosition} at {exp.companyName}</p>
                                                <p className="text-xs text-gray-400">{formatDate(exp.periodFrom)} - {formatDate(exp.periodTo)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {experienceForm.getValues().experiences.length === 0 && <p className="text-sm text-gray-400 text-center py-4">—</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Employment Tab ── */}
            {/* ── Assets Tab ── */}
            {activeTab === "assets" && (
                <div className="bg-white rounded-xl shadow-sm border">
                    <div className="p-5">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">{t('Assets', 'Assets')}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('Asset Name', 'Asset Name')}</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('Asset ID', 'Asset ID')}</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('Assigned Date', 'Assigned Date')}</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">{t('Assignee', 'Assignee')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {assetsList && (assetsList as Record<string, unknown>[]).map((asset, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-gray-800">{asset.assetName as string || "—"}</span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{asset.assetCode as string || "—"}</td>
                                            <td className="py-3 px-4 text-gray-600">{formatDate(asset.assignedDate as string) || "—"}</td>
                                            <td className="py-3 px-4">
                                                {asset.assignee ? (
                                                    <div>
                                                        <span className="font-medium text-gray-800">{(asset.assignee as Record<string, string>).name}</span>
                                                        <p className="text-xs text-gray-400">{(asset.assignee as Record<string, string>).email}</p>
                                                    </div>
                                                ) : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!assetsList || (assetsList as Record<string, unknown>[]).length === 0) && (
                                        <tr><td colSpan={4} className="py-8 text-center text-gray-400">{t('No assets assigned', 'No assets assigned')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Employment Tab ── */}
            {activeTab === "employment" && (
                <div className="bg-white rounded-xl shadow-sm border">
                    <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-semibold text-gray-800">{t('Employment', 'Employment')}</h3>
                            <button onClick={() => setEditModal("employment")} className="text-gray-400 hover:text-nv-violet"><Pencil className="w-4 h-4" /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <InfoField label={t('Salary', 'Salary')} value={employment ? String((employment as Record<string, unknown>).salary || "—") : "—"} />
                            <InfoField label={t('Effective Date', 'Effective Date')} value={formatDate((employment as Record<string, unknown>)?.effectiveDate as string)} />
                            <InfoField label={t('Payment Type', 'Payment Type')} value={(employment as Record<string, unknown>)?.paymentTypeNameEn as string} />
                            <InfoField label={t('Employee Type', 'Employee Type')} value={(employment as Record<string, unknown>)?.employeeTypeNameEn as string} />
                        </div>
                        {employmentHistory && employmentHistory.length > 0 && (
                            <div>
                                <h4 className="font-medium text-sm mb-2 text-gray-500">{t('Employment History', 'Employment History')}</h4>
                                <ArrayTable headers={[t('Start', 'Start'), t('End', 'End'), t('Department', 'Department'), t('Designation', 'Designation'), t('Salary', 'Salary')]}
                                    rows={employmentHistory.map(h => [formatDate(h.effectiveDateStart as string), formatDate(h.effectiveDateEnd as string), h.departmentName as string, h.designationName as string, String(h.salary || "")])} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── EDIT MODALS ── */}
            {editModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setEditModal(null)} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
                            <h2 className="text-lg font-semibold capitalize">{t('Edit', 'Edit')} {editModal}</h2>
                            <button onClick={() => setEditModal(null)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6">
                            {/* Profile Edit */}
                            {editModal === "profile" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label={t('First Name', 'First Name')} required><input type="text" {...profileForm.register("firstNameEn", { required: true })} className={ui.input} /></FormField>
                                    <FormField label={t('Last Name', 'Last Name')} required><input type="text" {...profileForm.register("lastNameEn", { required: true })} className={ui.input} /></FormField>
                                    <FormField label={t('Employee ID', 'Employee ID')} required><input type="text" {...profileForm.register("employeeId", { required: true })} className={isNew ? ui.input : ui.inputDisabled} disabled={!isNew} /></FormField>
                                    <FormField label={t('Email', 'Email')} required><input type="email" {...profileForm.register("email", { required: true })} className={isNew ? ui.input : ui.inputDisabled} disabled={!isNew} /></FormField>
                                    <FormField label={t('Phone', 'Phone')}><input type="text" {...profileForm.register("phone")} className={ui.input} /></FormField>
                                    <FormField label={t('Birth Date', 'Birth Date')}><input type="date" {...profileForm.register("birthDate")} className={ui.input} /></FormField>
                                    <FormField label={t('Gender', 'Gender')}>
                                        <select {...profileForm.register("gender")} className={ui.select}>
                                            <option value="">{t('Select', 'Select')}</option>
                                            {genders?.map(g => <option key={g.genderId} value={g.genderId}>{g.genderName}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Department', 'Department')} required>
                                        <select {...profileForm.register("departmentId", { required: true })} className={ui.select}>
                                            <option value="">{t('Select', 'Select')}</option>
                                            {deptList.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentNameEn}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Designation', 'Designation')} required>
                                        <select {...profileForm.register("designationId", { required: true })} className={ui.select}>
                                            <option value="">{t('Select', 'Select')}</option>
                                            {filteredDesignations.map((d: any) => <option key={d.designationId} value={d.designationId}>{d.designationNameEn}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Reports To', 'Reports To')}>
                                        <select {...profileForm.register("reportsTo")} className={ui.select}>
                                            <option value="">{t('Select', 'Select')}</option>
                                            {reportToList.map(e => <option key={e.id} value={e.id}>{e.firstNameEn} {e.lastNameEn}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Role', 'Role')} required>
                                        <select {...profileForm.register("roleId", { required: true })} className={ui.select}>
                                            <option value="">{t('Select', 'Select')}</option>
                                            {filteredRoles.map((r: { roleId?: number | string; roleName?: string }) => <option key={r.roleId} value={r.roleId!}>{r.roleName}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Organization', 'Organization')}>
                                        <select {...profileForm.register("organizationCode")} className={ui.select}>
                                            <option value="">{t('Select', 'Select')}</option>
                                            {organizations?.map((o: { organizationCode: string; organizationName: string }) => <option key={o.organizationCode} value={o.organizationCode}>{o.organizationName}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Address', 'Address')}><input type="text" {...profileForm.register("address")} className={ui.input} /></FormField>
                                    <FormField label={t('State', 'State')}><input type="text" {...profileForm.register("state")} className={ui.input} /></FormField>
                                    <FormField label={t('Country', 'Country')}><input type="text" {...profileForm.register("country")} className={ui.input} /></FormField>
                                    <FormField label={t('Pin Code', 'Pin Code')}><input type="text" {...profileForm.register("pinCode")} className={ui.input} /></FormField>
                                </div>
                            )}
                            {/* Personal Info Edit */}
                            {editModal === "personal" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label={t('Passport No', 'Passport No')}>
                                        <input 
                                            type="text" 
                                            {...personalForm.register("passportNo", {
                                                onChange: (e) => {
                                                    let v = e.target.value.replace(/[^A-Za-z0-9]/g, "");
                                                    if (/^\d+$/.test(v)) {
                                                        const parts = [];
                                                        if (v.length > 0) parts.push(v.substring(0, 1));
                                                        if (v.length > 1) parts.push(v.substring(1, 5));
                                                        if (v.length > 5) parts.push(v.substring(5, 10));
                                                        if (v.length > 10) parts.push(v.substring(10, 12));
                                                        if (v.length > 12) parts.push(v.substring(12, 13));
                                                        e.target.value = parts.join('-');
                                                    } else {
                                                        e.target.value = v;
                                                    }
                                                }
                                            })} 
                                            maxLength={20}
                                            className={ui.input} 
                                        />
                                    </FormField>
                                    <FormField label={t('Passport Expiry', 'Passport Expiry')}><input type="date" {...personalForm.register("passportExpiryDate")} className={ui.input} /></FormField>
                                    <FormField label={t('Tel', 'Tel')}><input type="text" {...personalForm.register("tel")} className={ui.input} /></FormField>
                                    <FormField label={t('Nationality', 'Nationality')} required>
                                        <select {...personalForm.register("nationality", { required: true })} className={ui.select}>
                                            <option value="">{t('Select', 'Select')}</option>
                                            <option value="Thai">Thai</option>
                                            <option value="English">English</option>
                                            <option value="Japanese">Japanese</option>
                                            <option value="Chinese">Chinese</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </FormField>
                                    <FormField label={t('Religion', 'Religion')}>
                                        <select {...personalForm.register("religion")} className={ui.select}>
                                            <option value="">{t('Select', 'Select')}</option>
                                            <option value="Buddhism">Buddhism</option>
                                            <option value="Christianity">Christianity</option>
                                            <option value="Islam">Islam</option>
                                            <option value="Hinduism">Hinduism</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </FormField>
                                    <FormField label={t('Marital Status', 'Marital Status')} required>
                                        <select {...personalForm.register("maritalStatus", { required: true })} className={ui.select}>
                                            <option value="">{t('Select', 'Select')}</option>
                                            {maritalStatuses?.map(m => <option key={m.maritalStatusId} value={m.maritalStatusId}>{m.maritalStatusName}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Employment of Spouse', 'Employment of Spouse')}><input type="text" {...personalForm.register("employmentOfSpouse")} className={ui.input} /></FormField>
                                    <FormField label={t('No. of Children', 'No. of Children')}><input type="text" {...personalForm.register("numberOfChildren")} className={ui.input} /></FormField>
                                </div>
                            )}
                            {/* Emergency Contact Edit */}
                            {editModal === "emergency" && (
                                <div className="space-y-4">
                                    <h3 className="font-medium text-nv-violet">{t('Primary Contact', 'Primary Contact')}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label={t('Name', 'Name')} required><input type="text" {...emergencyForm.register("primaryContactName", { required: true })} className={ui.input} /></FormField>
                                        <FormField label={t('Relationship', 'Relationship')} required><input type="text" {...emergencyForm.register("primaryContactRelationship", { required: true })} className={ui.input} /></FormField>
                                        <FormField label={t('Phone 1', 'Phone 1')} required><input type="text" {...emergencyForm.register("primaryContactPhone1", { required: true })} className={ui.input} /></FormField>
                                        <FormField label={t('Phone 2', 'Phone 2')}><input type="text" {...emergencyForm.register("primaryContactPhone2")} className={ui.input} /></FormField>
                                    </div>
                                    <h3 className="font-medium text-nv-violet pt-2">{t('Secondary Contact', 'Secondary Contact')}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label={t('Name', 'Name')} required><input type="text" {...emergencyForm.register("secondaryContactName", { required: true })} className={ui.input} /></FormField>
                                        <FormField label={t('Relationship', 'Relationship')} required><input type="text" {...emergencyForm.register("secondaryContactRelationship", { required: true })} className={ui.input} /></FormField>
                                        <FormField label={t('Phone 1', 'Phone 1')} required><input type="text" {...emergencyForm.register("secondaryContactPhone1", { required: true })} className={ui.input} /></FormField>
                                        <FormField label={t('Phone 2', 'Phone 2')}><input type="text" {...emergencyForm.register("secondaryContactPhone2")} className={ui.input} /></FormField>
                                    </div>
                                </div>
                            )}
                            {/* Bank Edit — auto-fills bankName/bankCode (Angular: onSubmitBank) */}
                            {editModal === "bank" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label={t('Bank', 'Bank')} required>
                                        <select
                                            {...bankForm.register("bankId", { required: true })}
                                            onChange={(e) => {
                                                const id = Number(e.target.value);
                                                bankForm.setValue("bankId", id);
                                                const bank = bankList.find(b => b.bankId === id);
                                                if (bank) {
                                                    bankForm.setValue("bankName", bank.bankNameEn);
                                                    bankForm.setValue("bankCode", bank.abbreviation);
                                                }
                                            }}
                                            className={ui.select}
                                        >
                                            <option value="">{t('Select', 'Select')}</option>
                                            {bankList.map(b => (
                                                <option key={b.bankId} value={b.bankId}>
                                                    {currentLang === 'th' && (b as any).bankNameTh ? (b as any).bankNameTh : b.bankNameEn}
                                                </option>
                                            ))}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Account No', 'Account No')} required><input type="text" {...bankForm.register("bankAccountNo", { required: true })} className={ui.input} /></FormField>
                                    <FormField label={t('Bank Code', 'Bank Code')}><input type="text" {...bankForm.register("bankCode")} className={ui.inputDisabled} disabled /></FormField>
                                    <FormField label={t('Branch', 'Branch')}><input type="text" {...bankForm.register("branch")} className={ui.input} /></FormField>
                                </div>
                            )}
                            {/* Education Edit */}
                            {editModal === "education" && (
                                <div>
                                    <div className="flex justify-end mb-3">
                                        <button type="button" onClick={() => eduFields.append({ institution: "", subject: "", startingDate: "", completeDate: "", degree: "", grade: "" })} className="text-sm text-nv-violet hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> {t('Add', 'Add')}</button>
                                    </div>
                                    {eduFields.fields.map((f, i) => (
                                        <div key={f.id} className="border rounded-lg p-4 mb-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">{t('Education', 'Education')} #{i + 1}</span>
                                                <button type="button" onClick={() => eduFields.remove(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormField label={t('Institution', 'Institution')} required><input type="text" {...educationForm.register(`educations.${i}.institution`)} className={ui.input} /></FormField>
                                                <FormField label={t('Subject', 'Subject')}><input type="text" {...educationForm.register(`educations.${i}.subject`)} className={ui.input} /></FormField>
                                                <FormField label={t('Start', 'Start')} required><input type="date" {...educationForm.register(`educations.${i}.startingDate`)} className={ui.input} /></FormField>
                                                <FormField label={t('Complete', 'Complete')} required><input type="date" {...educationForm.register(`educations.${i}.completeDate`)} className={ui.input} /></FormField>
                                                <FormField label={t('Degree', 'Degree')} required><input type="text" {...educationForm.register(`educations.${i}.degree`)} className={ui.input} /></FormField>
                                                <FormField label={t('Grade', 'Grade')}><input type="text" {...educationForm.register(`educations.${i}.grade`)} className={ui.input} /></FormField>
                                            </div>
                                        </div>
                                    ))}
                                    {eduFields.fields.length === 0 && <p className="text-gray-400 text-center py-4">{t('No education records', 'No education records')}</p>}
                                </div>
                            )}
                            {/* Experience Edit */}
                            {editModal === "experience" && (
                                <div>
                                    <div className="flex justify-end mb-3">
                                        <button type="button" onClick={() => expFields.append({ companyName: "", location: "", jobPosition: "", periodFrom: "", periodTo: "" })} className="text-sm text-nv-violet hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> {t('Add', 'Add')}</button>
                                    </div>
                                    {expFields.fields.map((f, i) => (
                                        <div key={f.id} className="border rounded-lg p-4 mb-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">{t('Experience', 'Experience')} #{i + 1}</span>
                                                <button type="button" onClick={() => expFields.remove(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormField label={t('Company', 'Company')} required><input type="text" {...experienceForm.register(`experiences.${i}.companyName`)} className={ui.input} /></FormField>
                                                <FormField label={t('Location', 'Location')} required><input type="text" {...experienceForm.register(`experiences.${i}.location`)} className={ui.input} /></FormField>
                                                <FormField label={t('Position', 'Position')} required><input type="text" {...experienceForm.register(`experiences.${i}.jobPosition`)} className={ui.input} /></FormField>
                                                <FormField label={t('From', 'From')}><input type="date" {...experienceForm.register(`experiences.${i}.periodFrom`)} className={ui.input} /></FormField>
                                                <FormField label={t('To', 'To')}><input type="date" {...experienceForm.register(`experiences.${i}.periodTo`)} className={ui.input} /></FormField>
                                            </div>
                                        </div>
                                    ))}
                                    {expFields.fields.length === 0 && <p className="text-gray-400 text-center py-4">{t('No experience records', 'No experience records')}</p>}
                                </div>
                            )}
                            {/* Family Edit */}
                            {editModal === "family" && (
                                <div>
                                    <div className="flex justify-end mb-3">
                                        <button type="button" onClick={() => famFields.append({ name: "", relationship: "", dateOfBirth: "", phone: "" })} className="text-sm text-nv-violet hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> {t('Add', 'Add')}</button>
                                    </div>
                                    {famFields.fields.map((f, i) => (
                                        <div key={f.id} className="border rounded-lg p-4 mb-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">{t('Family', 'Family')} #{i + 1}</span>
                                                <button type="button" onClick={() => famFields.remove(i)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormField label={t('Name', 'Name')}><input type="text" {...familyForm.register(`familyMembers.${i}.name`)} className={ui.input} /></FormField>
                                                <FormField label={t('Relationship', 'Relationship')}><input type="text" {...familyForm.register(`familyMembers.${i}.relationship`)} className={ui.input} /></FormField>
                                                <FormField label={t('Date of Birth', 'Date of Birth')}><input type="date" {...familyForm.register(`familyMembers.${i}.dateOfBirth`)} className={ui.input} /></FormField>
                                                <FormField label={t('Phone', 'Phone')}><input type="text" {...familyForm.register(`familyMembers.${i}.phone`)} className={ui.input} /></FormField>
                                            </div>
                                        </div>
                                    ))}
                                    {famFields.fields.length === 0 && <p className="text-gray-400 text-center py-4">{t('No family members', 'No family members')}</p>}
                                </div>
                            )}
                            {/* Employment Edit */}
                            {editModal === "employment" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label={t('Salary', 'Salary')}><input type="number" {...employmentForm.register("salary")} className={ui.input} /></FormField>
                                    <FormField label={t('Effective Date', 'Effective Date')}><input type="date" {...employmentForm.register("effectiveDate")} className={ui.input} /></FormField>
                                    <FormField label={t('Payment Type', 'Payment Type')}>
                                        <select {...employmentForm.register("paymentTypeId")} className={ui.select}>
                                            <option value="">{t('Select', 'Select')}</option>
                                            {paymentTypes?.map(p => <option key={p.paymentTypeId} value={p.paymentTypeId}>{p.paymentTypeNameEn}</option>)}
                                        </select>
                                    </FormField>
                                    <FormField label={t('Employee Type', 'Employee Type')}>
                                        <select {...employmentForm.register("employeeTypeId")} className={ui.select}>
                                            <option value="">{t('Select', 'Select')}</option>
                                            {employeeTypes?.map(e => <option key={e.employeeTypeId} value={e.employeeTypeId}>{e.employeeTypeNameEn}</option>)}
                                        </select>
                                    </FormField>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button onClick={() => setEditModal(null)} className={ui.btnSecondary}>{t('Close', 'Close')}</button>
                            <button onClick={handleApply} className={ui.btnPrimary}>{t('Apply', 'Apply')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Helper Components ── */
function InfoField({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-2">
            {icon && <span className="text-gray-400 mt-0.5 w-4 h-4">{icon}</span>}
            <div>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-medium">{value || "—"}</p>
            </div>
        </div>
    );
}

function ArrayTable({ headers, rows }: { headers: string[]; rows: (string | undefined | null)[][] }) {
    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                    <tr>{headers.map(h => <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            {row.map((cell, j) => <td key={j} className="px-4 py-2 text-gray-600">{cell || "—"}</td>)}
                        </tr>
                    ))}
                    {rows.length === 0 && <tr><td colSpan={headers.length} className="text-center py-6 text-gray-400">—</td></tr>}
                </tbody>
            </table>
        </div>
    );
}
