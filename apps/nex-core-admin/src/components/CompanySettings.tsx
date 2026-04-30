"use client";

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { Building2, MapPin, Globe, Save, RefreshCw, Link as LinkIcon, Building } from 'lucide-react';
import { useApiConfig } from '../contexts/ApiConfigContext';

const companySchema = z.object({
  company_code: z.string().min(1, 'ระบุรหัสบริษัท'),
  tax_id: z.string().regex(/^\d{13}$/, 'เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก').or(z.literal('')),
  name_th: z.string().min(1, 'ระบุชื่อบริษัทภาษาไทย'),
  name_en: z.string().optional(),
  contact_person: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  zipcode: z.string().regex(/^\d{5}$/, 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก').or(z.literal('')),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').or(z.literal('')),
  phone: z.string().optional(),
  fax: z.string().optional(),
  website: z.string().url('รูปแบบเว็บไซต์ไม่ถูกต้อง').or(z.literal('')),
  logo_path: z.string().optional(),
  favicon_path: z.string().optional(),
});

type CompanyFormErrors = Partial<Record<keyof z.infer<typeof companySchema>, string>>;

export default function CompanySettings() {
  const [formData, setFormData] = useState({
    company_code: '',
    tax_id: '',
    name_th: '',
    name_en: '',
    contact_person: '',
    address: '',
    country: '',
    city: '',
    province: '',
    zipcode: '',
    email: '',
    phone: '',
    fax: '',
    website: '',
    logo_path: '',
    favicon_path: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<CompanyFormErrors>({});

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const { getEndpoint } = useApiConfig();
    const coreApi = getEndpoint('NexCore', 'http://localhost:8001/api');
    const API_URL = `${coreApi}/v1/company`;

  const fetchCompanyData = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        if (data && data.data && Object.keys(data.data).length > 0) {
          setFormData(prev => ({ ...prev, ...data.data }));
        }
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof CompanyFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = async () => {
    try {
      companySchema.parse(formData);
      setErrors({});
      
      setSaving(true);
      setMessage('');
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage('บันทึกข้อมูลบริษัทสำเร็จ');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: CompanyFormErrors = {};
        error.issues.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof CompanyFormErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
        setMessage('');
      } else {
        console.error('Error saving company:', error);
        setMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-slate-500 font-medium">กำลังโหลดข้อมูลบริษัท...</div>;
  }

  const InputField = ({ label, name, type = "text", required = false, placeholder = "", value, onChange, error }: any) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border ${error ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'} text-slate-700 text-sm rounded-lg focus:ring-2 focus:border-transparent block p-3 outline-none transition-colors duration-200`}
      />
      {error && <span className="text-[11px] font-medium text-red-500">{error}</span>}
    </div>
  );

  return (
    <div style={{ maxWidth: "100%", overflowX: "hidden", display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "40px" }}>
      
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
            ข้อมูลบริษัท (Company Profile)
          </h2>
          <p style={{ fontSize: "15px", color: "#64748b", margin: 0 }}>
            จัดการข้อมูลพื้นฐานขององค์กร สำหรับใช้อ้างอิงในการออกรายงานและเอกสารทั้งหมด
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => fetchCompanyData()}
            disabled={saving}
            style={{
              background: "#f8fafc",
              color: "#475569",
              padding: "12px 20px",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "14px",
              border: "1px solid #e2e8f0",
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            <RefreshCw size={18} className={saving ? "animate-spin" : ""} /> ถอยกลับ
          </button>
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
              boxShadow: "0 4px 6px rgba(59, 130, 246, 0.2)",
              transition: "all 0.2s"
            }}
          >
            <Save size={18} /> {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`px-5 py-4 rounded-xl text-sm font-semibold flex items-center gap-3 border ${message.includes('สำเร็จ') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          <div className={`w-2 h-2 rounded-full ${message.includes('สำเร็จ') ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        
        {/* ── Section 1: ข้อมูลองค์กร ── */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>ข้อมูลองค์กร (Organization Info)</h3>
          </div>
          <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            <InputField label="รหัสบริษัท" name="company_code" value={formData.company_code} onChange={handleChange} error={errors.company_code} required />
            <InputField label="เลขประจำตัวผู้เสียภาษี" name="tax_id" value={formData.tax_id} onChange={handleChange} error={errors.tax_id} placeholder="ตัวเลข 13 หลัก" />
            <InputField label="ชื่อบริษัท (ภาษาไทย)" name="name_th" value={formData.name_th} onChange={handleChange} error={errors.name_th} required />
            <InputField label="ชื่อบริษัท (ภาษาอังกฤษ)" name="name_en" value={formData.name_en} onChange={handleChange} />
          </div>
        </div>

        {/* ── Section 2: ข้อมูลการติดต่อ ── */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fef2f2", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>ที่อยู่และการติดต่อ (Location & Contact)</h3>
          </div>
          <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="ผู้ติดต่อ (Contact Person)" name="contact_person" value={formData.contact_person} onChange={handleChange} />
              <InputField label="อีเมล (Email)" type="email" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="contact@company.com" />
              <InputField label="โทรศัพท์ (Phone)" type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              <InputField label="โทรสาร (Fax)" name="fax" value={formData.fax} onChange={handleChange} />
            </div>
            
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-semibold text-slate-700">ที่อยู่สำนักงาน (Address)</label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent block p-4 outline-none min-h-[100px] resize-y transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <InputField label="ประเทศ (Country)" name="country" value={formData.country} onChange={handleChange} />
              <InputField label="จังหวัด (Province)" name="province" value={formData.province} onChange={handleChange} />
              <InputField label="เมือง/อำเภอ (City)" name="city" value={formData.city} onChange={handleChange} />
              <InputField label="รหัสไปรษณีย์ (Zipcode)" name="zipcode" value={formData.zipcode} onChange={handleChange} error={errors.zipcode} />
            </div>
          </div>
        </div>

        {/* ── Section 3: ทรัพยากรระบบ ── */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", background: "#fafbfc", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fffbeb", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>เว็บไซต์และทรัพยากร (Website Apperance)</h3>
          </div>
          <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            <InputField label="เว็บไซต์ (URL)" name="website" value={formData.website} onChange={handleChange} error={errors.website} placeholder="https://www.example.com" />
            <InputField label="โลโก้ (Logo Path)" name="logo_path" value={formData.logo_path} onChange={handleChange} placeholder="/images/logo.png" />
            <InputField label="ฟาวิคอน (Favicon Path)" name="favicon_path" value={formData.favicon_path} onChange={handleChange} placeholder="/favicon.ico" />
          </div>
        </div>

      </div>
    </div>
  );
}

