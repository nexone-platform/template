"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Save } from "lucide-react";
import apiClient from "@/lib/api-client";
import { getUserProfile } from "@/lib/auth";
import { useMessages } from "@/hooks/use-messages";
import { getApiErrorMessage } from "@/lib/api-error";
import {
    PageHeader, ModalWrapper, FormField, ui,
} from "@/components/shared/ui-components";
import { usePageTranslation } from "@/lib/language";

/* ── Types ── */
interface SkillInfo { hardSkill: string; softSkill: string; }
interface EducationInfo { institution: string; subject: string; startingDate: string | null; completeDate: string | null; degree: string; grade: string; }
interface ExperienceInfo { companyName: string; location: string; jobPosition: string; periodFrom: string | null; periodTo: string | null; }
interface PersonalForm { title: string; firstName: string; lastName: string; phone: string; email: string; gender: string; position: string; location: string; }

/* ── Helpers ── */
const fmtDate = (d: string | null | undefined) => {
    if (!d) return ""; const dt = new Date(d); if (isNaN(dt.getTime())) return "";
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
};
const fmtPhone = (phone: string | null | undefined): string => {
    if (!phone) return ""; const c = phone.replace(/\D/g, "");
    if (c.length === 10) return `${c.slice(0, 3)}-${c.slice(3, 6)}-${c.slice(6)}`;
    return phone;
};
function safeParseArray<T>(json: any): T[] {
    try { const arr = typeof json === "string" ? JSON.parse(json) : json; return Array.isArray(arr) ? arr : []; } catch { return []; }
}
const genderData = [{ genderId: "M", genderName: "Male" }, { genderId: "F", genderName: "Female" }];

/* ── Page ── */
export default function ManageResumeProfilePage() {
    const { t } = usePageTranslation();
    const { showSuccess, showError } = useMessages();
    const params = useParams(); const router = useRouter();
    const resumeId = Number(params?.id) || 0;
    const userProfile = getUserProfile();

    const [personalInfo, setPersonalInfo] = useState<PersonalForm | null>(null);
    const [skillInfos, setSkillInfos] = useState<SkillInfo[]>([]);
    const [educationInfos, setEducationInfos] = useState<EducationInfo[]>([]);
    const [experienceInfos, setExperienceInfos] = useState<ExperienceInfo[]>([]);

    const [personalModalOpen, setPersonalModalOpen] = useState(false);
    const [skillModalOpen, setSkillModalOpen] = useState(false);
    const [educationModalOpen, setEducationModalOpen] = useState(false);
    const [experienceModalOpen, setExperienceModalOpen] = useState(false);

    const { data: positionOptions } = useQuery({ queryKey: ["jobPositions"], queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getAllDesignation"); return data || []; } });
    const { data: locationOptions } = useQuery({ queryKey: ["jobLocations"], queryFn: async () => { const { data } = await apiClient.get<any>("manageJobs/getAllLocationJob"); return data || []; } });
    const { data: titleOptions } = useQuery({ queryKey: ["resumeTitles"], queryFn: async () => { const { data } = await apiClient.get<any>("manageResume/getAllTitle"); return data || []; } });

    const { data: resumeData } = useQuery({
        queryKey: ["resumeById", resumeId],
        queryFn: async () => { const { data } = await apiClient.get<any>(`manageResume/getManageResumeById/${resumeId}`); return data; },
        enabled: resumeId > 0,
    });

    const personalForm = useForm<PersonalForm>({ defaultValues: { title: "", firstName: "", lastName: "", phone: "", email: "", gender: "", position: "", location: "" } });
    const skillForm = useForm<{ skillMembers: SkillInfo[] }>({ defaultValues: { skillMembers: [{ hardSkill: "", softSkill: "" }] } });
    const { fields: skillFields, append: appendSkill } = useFieldArray({ control: skillForm.control, name: "skillMembers" });
    const educationForm = useForm<{ educations: EducationInfo[] }>({ defaultValues: { educations: [{ institution: "", subject: "", startingDate: null, completeDate: null, degree: "", grade: "" }] } });
    const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: educationForm.control, name: "educations" });
    const experienceForm = useForm<{ experiences: ExperienceInfo[] }>({ defaultValues: { experiences: [{ companyName: "", location: "", jobPosition: "", periodFrom: null, periodTo: null }] } });
    const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: experienceForm.control, name: "experiences" });

    useEffect(() => {
        if (!resumeData) return;
        const d = resumeData;
        const titleName = (titleOptions || []).find((t: any) => t.titleId === (d.titleId ?? d.title))?.titleNameEn ?? d.title ?? "";
        const genderName = genderData.find(g => g.genderId === d.gender)?.genderName ?? d.gender ?? "";
        setPersonalInfo({ title: titleName, firstName: d.firstName || "", lastName: d.lastName || "", phone: d.phone || "", email: d.email || "", gender: genderName, position: d.positionName ?? d.position ?? "", location: d.locationName ?? d.location ?? "" });
        personalForm.reset({ title: d.titleId ?? d.title ?? "", firstName: d.firstName || "", lastName: d.lastName || "", phone: d.phone || "", email: d.email || "", gender: d.gender || "", position: d.positionId ?? d.position ?? "", location: d.locationId ?? d.location ?? "" });
        const skills = safeParseArray<SkillInfo>(d.skills); setSkillInfos(skills); skillForm.reset({ skillMembers: skills.length > 0 ? skills : [{ hardSkill: "", softSkill: "" }] });
        const educations = safeParseArray<EducationInfo>(d.educations); setEducationInfos(educations); educationForm.reset({ educations: educations.length > 0 ? educations : [{ institution: "", subject: "", startingDate: null, completeDate: null, degree: "", grade: "" }] });
        const experiences = safeParseArray<ExperienceInfo>(d.experiences); setExperienceInfos(experiences); experienceForm.reset({ experiences: experiences.length > 0 ? experiences : [{ companyName: "", location: "", jobPosition: "", periodFrom: null, periodTo: null }] });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resumeData, titleOptions]);

    const saveMutation = useMutation({
        mutationFn: async (payload: any) => { const { data } = await apiClient.post<any>("manageResume/update", payload); return data; },
        onSuccess: () => { showSuccess('SAVE_SUCCESS', 'Success!', 'Resume saved successfully.').then(() => router.push("/jobs/manage-resumes")); },
        onError: (err) => { showError('SAVE_ERROR', 'Error!', getApiErrorMessage(err, "Error saving resume.")); },
    });

    const onSubmitPersonal = useCallback(() => {
        const raw = personalForm.getValues();
        setPersonalInfo({
            title: (titleOptions || []).find((t: any) => String(t.titleId) === String(raw.title))?.titleNameEn ?? "",
            firstName: raw.firstName, lastName: raw.lastName, phone: raw.phone, email: raw.email,
            gender: genderData.find(g => g.genderId === raw.gender)?.genderName ?? "",
            position: (positionOptions || []).find((p: any) => String(p.designation_id) === String(raw.position))?.designation_name_en ?? "",
            location: (locationOptions || []).find((l: any) => String(l.client_id) === String(raw.location))?.client_name_en ?? "",
        });
        setPersonalModalOpen(false);
    }, [personalForm, positionOptions, titleOptions, locationOptions]);

    const onSubmitSkill = useCallback(() => { setSkillInfos([...skillForm.getValues().skillMembers]); setSkillModalOpen(false); }, [skillForm]);
    const onSubmitEducation = useCallback(() => { setEducationInfos([...educationForm.getValues().educations]); setEducationModalOpen(false); }, [educationForm]);
    const onSubmitExperience = useCallback(() => { setExperienceInfos([...experienceForm.getValues().experiences]); setExperienceModalOpen(false); }, [experienceForm]);

    const handleSave = () => {
        const raw = personalForm.getValues();
        if (!raw.firstName || !raw.lastName) { showError('SAVE_ERROR', 'Error!', 'First Name and Last Name are required.'); return; }
        const payload: any = {
            manageResumeId: resumeId, title: raw.title, firstName: raw.firstName, lastName: raw.lastName,
            email: raw.email, phone: raw.phone, gender: raw.gender, position: raw.position, location: raw.location,
            skills: JSON.stringify(skillInfos), educations: JSON.stringify(educationInfos), experiences: JSON.stringify(experienceInfos),
        };
        if (resumeId > 0) { payload.updateDate = new Date().toISOString(); payload.updateBy = userProfile; }
        else { payload.createDate = new Date().toISOString(); payload.createBy = userProfile; }
        saveMutation.mutate(payload);
    };

    const cardClass = `${ui.tableWrapper} p-6`;

    return (
        <div className={ui.pageContainer}>
            <PageHeader
                title={t('Profile', 'Profile')}
                breadcrumbs={[{ label: t('Resume', 'Resume'), href: "/jobs/manage-resumes" }, { label: t('Profile', 'Profile') }]}
                actionLabel={saveMutation.isPending ? "Saving..." : "Save"}
                onAction={handleSave}
                actionIcon={<Save className="w-4 h-4" />}
            />

            {/* Cards Row 1: Personal + Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className={cardClass}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                        <button onClick={() => setPersonalModalOpen(true)} className="text-nv-violet hover:text-blue-800 p-1.5 hover:bg-nv-violet-light rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                    </div>
                    <ul className="space-y-3 text-sm">
                        {([["Title", personalInfo?.title], ["First Name", personalInfo?.firstName], ["Last Name", personalInfo?.lastName], ["Phone", fmtPhone(personalInfo?.phone)], ["Email", personalInfo?.email], ["Gender", personalInfo?.gender], ["Position", personalInfo?.position], ["Location", personalInfo?.location]] as [string, string | undefined][]).map(([label, value]) => (
                            <li key={label} className="flex"><span className="w-28 text-gray-500 font-medium">{label}</span><span className="text-gray-800">{value || "-"}</span></li>
                        ))}
                    </ul>
                </div>

                <div className={cardClass}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Skills</h3>
                        <button onClick={() => setSkillModalOpen(true)} className="text-nv-violet hover:text-blue-800 p-1.5 hover:bg-nv-violet-light rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                    </div>
                    <table className="w-full text-sm">
                        <thead><tr className="border-b"><th className="text-left py-2 font-medium text-gray-600">{t('Hard Skill', 'Hard Skill')}</th><th className="text-left py-2 font-medium text-gray-600">{t('Soft Skill', 'Soft Skill')}</th></tr></thead>
                        <tbody>
                            {skillInfos.length > 0 ? skillInfos.map((s, i) => (
                                <tr key={i} className="border-b border-gray-50"><td className="py-2 text-gray-800">{s.hardSkill || "-"}</td><td className="py-2 text-gray-800">{s.softSkill || "-"}</td></tr>
                            )) : <tr><td colSpan={2} className="py-4 text-center text-gray-400">No skills added</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cards Row 2: Education + Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={cardClass}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Education</h3>
                        <button onClick={() => setEducationModalOpen(true)} className="text-nv-violet hover:text-blue-800 p-1.5 hover:bg-nv-violet-light rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-4">
                        {educationInfos.length > 0 ? educationInfos.map((e, i) => (
                            <div key={i} className="border-l-3 border-nv-violet pl-4">
                                <div className="font-medium text-gray-800">{e.institution}</div>
                                <div className="text-sm text-gray-600">{e.degree}</div>
                                <div className="text-xs text-gray-400">{fmtDate(e.startingDate)} - {fmtDate(e.completeDate)}</div>
                            </div>
                        )) : <div className="text-center text-gray-400 py-4">No education added</div>}
                    </div>
                </div>

                <div className={cardClass}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Experience</h3>
                        <button onClick={() => setExperienceModalOpen(true)} className="text-nv-violet hover:text-blue-800 p-1.5 hover:bg-nv-violet-light rounded-lg transition"><Pencil className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-4">
                        {experienceInfos.length > 0 ? experienceInfos.map((ex, i) => (
                            <div key={i} className="border-l-3 border-emerald-500 pl-4">
                                <div className="font-medium text-gray-800">{ex.jobPosition} at {ex.companyName}</div>
                                <div className="text-xs text-gray-400">{fmtDate(ex.periodFrom)} - {fmtDate(ex.periodTo)}</div>
                            </div>
                        )) : <div className="text-center text-gray-400 py-4">No experience added</div>}
                    </div>
                </div>
            </div>

            {/* Personal Info Modal */}
            <ModalWrapper open={personalModalOpen} onClose={() => setPersonalModalOpen(false)} title={t('Personal Information', 'Personal Information')} maxWidth="max-w-2xl"
                footer={<><button onClick={() => setPersonalModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button><button onClick={onSubmitPersonal} className={ui.btnPrimary}>{t('Submit', 'Submit')}</button></>}>
                <div className="grid grid-cols-2 gap-4">
                    <FormField label={t('Title', 'Title')} required>
                        <select {...personalForm.register("title")} className={ui.select}><option value="">{t('Select', 'Select')}</option>
                            {(titleOptions || []).map((t: any) => <option key={t.titleId} value={t.titleId}>{t.titleNameEn}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t('Gender', 'Gender')} required>
                        <select {...personalForm.register("gender")} className={ui.select}><option value="">{t('Select', 'Select')}</option>
                            {genderData.map(g => <option key={g.genderId} value={g.genderId}>{g.genderName}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t('First Name', 'First Name')} required><input {...personalForm.register("firstName", { required: true })} className={ui.input} /></FormField>
                    <FormField label={t('Last Name', 'Last Name')} required><input {...personalForm.register("lastName", { required: true })} className={ui.input} /></FormField>
                    <FormField label={t('Phone', 'Phone')}><input {...personalForm.register("phone")} className={ui.input} /></FormField>
                    <FormField label={t('Email', 'Email')}><input {...personalForm.register("email")} className={ui.input} /></FormField>
                    <FormField label={t('Position', 'Position')}>
                        <select {...personalForm.register("position")} className={ui.select}><option value="">{t('Select', 'Select')}</option>
                            {(positionOptions || []).map((p: any) => <option key={p.designation_id} value={p.designation_id}>{p.designation_name_en || p.designation_code}</option>)}
                        </select>
                    </FormField>
                    <FormField label={t('Location', 'Location')}>
                        <select {...personalForm.register("location")} className={ui.select}><option value="">{t('Select', 'Select')}</option>
                            {(locationOptions || []).map((l: any) => <option key={l.client_id} value={l.client_id}>{l.client_name_en || l.client_code}</option>)}
                        </select>
                    </FormField>
                </div>
            </ModalWrapper>

            {/* Skill Modal */}
            <ModalWrapper open={skillModalOpen} onClose={() => setSkillModalOpen(false)} title={t('Skills', 'Skills')} maxWidth="max-w-2xl"
                footer={<><button onClick={() => setSkillModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button><button onClick={onSubmitSkill} className={ui.btnPrimary}>{t('Submit', 'Submit')}</button></>}>
                <div className="space-y-4">
                    {skillFields.map((field, index) => (
                        <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label={t('Hard Skill', 'Hard Skill')}><input {...skillForm.register(`skillMembers.${index}.hardSkill`)} className={ui.input} /></FormField>
                                <FormField label={t('Soft Skill', 'Soft Skill')}><input {...skillForm.register(`skillMembers.${index}.softSkill`)} className={ui.input} /></FormField>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => appendSkill({ hardSkill: "", softSkill: "" })} className="text-nv-violet hover:text-blue-800 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add More</button>
                </div>
            </ModalWrapper>

            {/* Education Modal */}
            <ModalWrapper open={educationModalOpen} onClose={() => setEducationModalOpen(false)} title={t('Education Information', 'Education Information')} maxWidth="max-w-3xl"
                footer={<><button onClick={() => setEducationModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button><button onClick={onSubmitEducation} className={ui.btnPrimary}>{t('Submit', 'Submit')}</button></>}>
                <div className="space-y-4">
                    {eduFields.map((field, index) => (
                        <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold text-gray-700">Education #{index + 1}</h4>
                                {eduFields.length > 1 && <button onClick={() => removeEdu(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label={t('Institution', 'Institution')} required><input {...educationForm.register(`educations.${index}.institution`, { required: true })} className={ui.input} /></FormField>
                                <FormField label={t('Subject', 'Subject')}><input {...educationForm.register(`educations.${index}.subject`)} className={ui.input} /></FormField>
                                <FormField label={t('Starting Date', 'Starting Date')} required><input type="date" {...educationForm.register(`educations.${index}.startingDate`)} className={ui.input} /></FormField>
                                <FormField label={t('Complete Date', 'Complete Date')} required><input type="date" {...educationForm.register(`educations.${index}.completeDate`)} className={ui.input} /></FormField>
                                <FormField label={t('Degree', 'Degree')} required><input {...educationForm.register(`educations.${index}.degree`, { required: true })} className={ui.input} /></FormField>
                                <FormField label={t('Grade', 'Grade')}><input {...educationForm.register(`educations.${index}.grade`)} className={ui.input} /></FormField>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => appendEdu({ institution: "", subject: "", startingDate: null, completeDate: null, degree: "", grade: "" })} className="text-nv-violet hover:text-blue-800 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add More</button>
                </div>
            </ModalWrapper>

            {/* Experience Modal */}
            <ModalWrapper open={experienceModalOpen} onClose={() => setExperienceModalOpen(false)} title={t('Experience Information', 'Experience Information')} maxWidth="max-w-3xl"
                footer={<><button onClick={() => setExperienceModalOpen(false)} className={ui.btnSecondary}>{t('Cancel', 'Cancel')}</button><button onClick={onSubmitExperience} className={ui.btnPrimary}>{t('Submit', 'Submit')}</button></>}>
                <div className="space-y-4">
                    {expFields.map((field, index) => (
                        <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold text-gray-700">Experience #{index + 1}</h4>
                                {expFields.length > 1 && <button onClick={() => removeExp(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label={t('Company Name', 'Company Name')} required><input {...experienceForm.register(`experiences.${index}.companyName`, { required: true })} className={ui.input} /></FormField>
                                <FormField label={t('Location', 'Location')} required><input {...experienceForm.register(`experiences.${index}.location`, { required: true })} className={ui.input} /></FormField>
                                <FormField label={t('Job Position', 'Job Position')} required><input {...experienceForm.register(`experiences.${index}.jobPosition`, { required: true })} className={ui.input} /></FormField>
                                <div />
                                <FormField label={t('Period From', 'Period From')} required><input type="date" {...experienceForm.register(`experiences.${index}.periodFrom`)} className={ui.input} /></FormField>
                                <FormField label={t('Period To', 'Period To')} required><input type="date" {...experienceForm.register(`experiences.${index}.periodTo`)} className={ui.input} /></FormField>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => appendExp({ companyName: "", location: "", jobPosition: "", periodFrom: null, periodTo: null })} className="text-nv-violet hover:text-blue-800 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Add More</button>
                </div>
            </ModalWrapper>
        </div>
    );
}
