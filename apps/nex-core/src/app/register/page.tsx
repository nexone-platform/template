'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Truck, ShoppingCart, Factory, Target, Utensils, Building2, HardHat } from 'lucide-react';
import './register.css';

/* ─── Business Data ─── */
const DEFAULT_BUSINESS_GROUPS = [
  {
    code: 'LOG', icon: Truck, color: '#3B82F6',
    nameTH: 'ขนส่ง', nameEN: 'Logistics',
    desc: 'บริหารงานขนส่ง รถบรรทุก พัสดุ คลังสินค้า',
    subTypes: [
      { num: 1, nameTH: 'FTL / LTL Trucking', nameEN: 'Full & Less Truckload', desc: 'รับจ้างขนส่งสินค้า B2B ระหว่างเมือง', examples: 'รถบรรทุก, รถพ่วง' },
      { num: 2, nameTH: 'Last-Mile Delivery', nameEN: 'Last-Mile', desc: 'ส่งพัสดุปลายทางถึงมือผู้รับ', examples: 'Kerry, Flash, J&T' },
      { num: 3, nameTH: 'Cold Chain / ห้องเย็น', nameEN: 'Cold Chain', desc: 'ขนส่งสินค้าควบคุมอุณหภูมิ', examples: 'อาหารแช่แข็ง, ยา, วัคซีน' },
      { num: 4, nameTH: 'Container / ท่าเรือ', nameEN: 'Container', desc: 'บริหารตู้สินค้า เข้า-ออก Port', examples: 'Freight Forwarder, Shipping' },
    ],
  },
  {
    code: 'TRD', icon: ShoppingCart, color: '#10B981',
    nameTH: 'ซื้อมาขายไป', nameEN: 'Trading',
    desc: 'ธุรกิจจัดจำหน่าย ค้าส่ง ค้าปลีก อีคอมเมิร์ซ',
    subTypes: [
      { num: 1, nameTH: 'ขายส่ง / Distributor', nameEN: 'Wholesale', desc: 'ซื้อจากโรงงาน กระจายให้ร้านค้าย่อย', examples: 'ตัวแทนจำหน่าย, ยี่ปั๊ว' },
      { num: 2, nameTH: 'ขายปลีก / Retail', nameEN: 'Retail', desc: 'หลายสาขา หน้าร้าน มีสต็อก', examples: '7-11, ร้านสะดวกซื้อ, Mini Mart' },
      { num: 3, nameTH: 'E-Commerce / ออนไลน์', nameEN: 'E-Commerce', desc: 'ขาย Shopee, Lazada, Website', examples: 'Shopee Seller, Social Commerce' },
      { num: 4, nameTH: 'Import / Export', nameEN: 'Import-Export', desc: 'นำเข้าจากต่างประเทศ หรือส่งออก', examples: 'ตัวแทนนำเข้า, ส่งออกสินค้าเกษตร' },
    ],
  },
  {
    code: 'MFG', icon: Factory, color: '#F59E0B',
    nameTH: 'รับจ้างผลิต', nameEN: 'Manufacturing',
    desc: 'โรงงานผลิต แปรรูป ประกอบสินค้า',
    subTypes: [
      { num: 1, nameTH: 'Make-to-Order / Job Shop', nameEN: 'Make-to-Order', desc: 'ผลิตตามสั่งทีละงาน ไม่มีสต็อก', examples: 'เครื่องจักร, ชิ้นส่วนโลหะ, แม่พิมพ์' },
      { num: 2, nameTH: 'OEM / Contract Mfg', nameEN: 'OEM', desc: 'ผลิตตาม Design ลูกค้าเป็น Batch ใหญ่', examples: 'อิเล็กทรอนิกส์, เสื้อผ้า, บรรจุภัณฑ์' },
      { num: 3, nameTH: 'Tolling / แปรรูปวัตถุดิบ', nameEN: 'Tolling', desc: 'ลูกค้าส่งวัตถุดิบมา เราแปรรูปคืน', examples: 'โรงสี, แปรรูปอาหาร, ชุบโลหะ' },
      { num: 4, nameTH: 'Make-to-Stock / ผลิตขายเอง', nameEN: 'Make-to-Stock', desc: 'ผลิตเก็บสต็อก ขายผ่าน Distributor', examples: 'อาหาร, เครื่องสำอาง, ของใช้ทั่วไป' },
    ],
  },
  {
    code: 'SVC', icon: Target, color: '#8B5CF6',
    nameTH: 'บริการ', nameEN: 'Service',
    desc: 'ที่ปรึกษา ซ่อมบำรุง งานรายเดือน สปา',
    subTypes: [
      { num: 1, nameTH: 'Professional Services', nameEN: 'Professional', desc: 'ขายความรู้และเวลา Man-Day/Project', examples: 'IT Consulting, กฎหมาย, บัญชี' },
      { num: 2, nameTH: 'Field Service / ซ่อมบำรุง', nameEN: 'Field Service', desc: 'รับแจ้งซ่อม ส่งช่างออกพื้นที่', examples: 'ซ่อมแอร์, ลิฟต์, IT Support' },
      { num: 3, nameTH: 'Retainer / รายเดือน', nameEN: 'Retainer', desc: 'บริการต่อเนื่อง Subscription', examples: 'รปภ., แม่บ้าน, Facility Mgt' },
      { num: 4, nameTH: 'Hospitality / Wellness', nameEN: 'Hospitality', desc: 'นัดหมายให้บริการ ณ สถานที่', examples: 'โรงแรม, สปา, คลินิก, ร้านเสริมสวย' },
    ],
  },
  {
    code: 'FNB', icon: Utensils, color: '#EF4444',
    nameTH: 'อาหาร & เครื่องดื่ม', nameEN: 'F&B',
    desc: 'ร้านอาหาร คาเฟ่ Cloud Kitchen จัดเลี้ยง',
    subTypes: [
      { num: 1, nameTH: 'ร้านอาหาร / Single', nameEN: 'Single Restaurant', desc: 'หน้าร้านเดียว Dine-in + Takeaway', examples: 'ร้านอาหาร, Café, Bistro' },
      { num: 2, nameTH: 'Chain / Franchise', nameEN: 'Chain Restaurant', desc: 'หลายสาขา ครัวกลาง มาตรฐานเดียว', examples: 'MK, The Pizza Company' },
      { num: 3, nameTH: 'Cloud Kitchen', nameEN: 'Cloud Kitchen', desc: 'ผลิตเพื่อ Delivery เท่านั้น', examples: 'Multi-Brand Kitchen, Delivery-Only' },
      { num: 4, nameTH: 'Catering / จัดเลี้ยง', nameEN: 'Catering', desc: 'รับจ้างทำอาหารสำหรับงานกิจกรรม', examples: 'งานแต่ง, Conference, Corporate' },
    ],
  },
  {
    code: 'RES', icon: Building2, color: '#14B8A6',
    nameTH: 'อสังหาริมทรัพย์', nameEN: 'Real Estate',
    desc: 'พัฒนาโครงการ บริหารอาคาร ให้เช่า นายหน้า',
    subTypes: [
      { num: 1, nameTH: 'Developer / ขายโครงการ', nameEN: 'Developer', desc: 'สร้างบ้าน/คอนโด แล้วขาย', examples: 'Residential Developer, Condo' },
      { num: 2, nameTH: 'Property Management', nameEN: 'Property Mgt', desc: 'บริหารโครงการที่สร้างแล้ว', examples: 'นิติบุคคล, Property Manager' },
      { num: 3, nameTH: 'เช่า / Rental', nameEN: 'Rental', desc: 'ให้เช่าพื้นที่ระยะยาว/สั้น', examples: 'ออฟฟิศ, Serviced Apartment' },
      { num: 4, nameTH: 'นายหน้า / Agency', nameEN: 'Agency', desc: 'เป็นตัวกลางซื้อ-ขาย-เช่า', examples: 'Real Estate Agent, Broker' },
    ],
  },
  {
    code: 'CON', icon: HardHat, color: '#D97706',
    nameTH: 'ก่อสร้าง', nameEN: 'Construction',
    desc: 'รับเหมาก่อสร้าง งานระบบ ออกแบบ',
    subTypes: [
      { num: 1, nameTH: 'รับเหมาก่อสร้างทั่วไป', nameEN: 'General Contractor', desc: 'รับงานก่อสร้างอาคารตามสัญญา', examples: 'บ้าน, อาคาร, โรงงาน' },
      { num: 2, nameTH: 'งานระบบ / MEP', nameEN: 'MEP', desc: 'ไฟฟ้า ประปา แอร์ อัคคีภัย', examples: 'Electrical, Plumbing, HVAC' },
      { num: 3, nameTH: 'รับเหมาช่วง / Sub', nameEN: 'Subcontractor', desc: 'รับงานช่วงจาก Main Contractor', examples: 'Work Package เฉพาะ' },
      { num: 4, nameTH: 'Design & Build', nameEN: 'Design & Build', desc: 'ออกแบบ + ก่อสร้าง ในองค์กรเดียว', examples: 'Turnkey Project' },
    ],
  },
];

const EMPLOYEE_RANGES = ['1-10 คน', '11-50 คน', '51-200 คน', '200+ คน'];

/* ─── Component ─── */
export default function RegisterPage() {
  const [businessGroups, setBusinessGroups] = useState<any[]>(DEFAULT_BUSINESS_GROUPS);

  useEffect(() => {
    const fetchBizTypes = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8101/api';
        const res = await fetch(`${API_BASE}/registration/business-types`);
        if (res.ok) {
          const data = await res.json();
          
          const iconMap: Record<string, any> = {
            'LOG': Truck,
            'TRD': ShoppingCart,
            'MFG': Factory,
            'SVC': Target,
            'FNB': Utensils,
            'RES': Building2,
            'CON': HardHat
          };

          const mappedData = data.map((d: any) => {
            const mappedSubTypes = d.subTypes?.map((st: any) => ({
              num: st.subTypeNumber,
              nameTH: st.nameTH,
              nameEN: st.nameEN,
              desc: st.descriptionTH,
              examples: st.examplesTH,
            })) || [];
            
            mappedSubTypes.sort((a: any, b: any) => a.num - b.num);

            return {
              code: d.code,
              icon: iconMap[d.code] || Target,
              color: d.color || '#8B5CF6',
              nameTH: d.nameTH,
              nameEN: d.nameEN,
              desc: d.descriptionTH,
              subTypes: mappedSubTypes
            };
          });
          setBusinessGroups(mappedData);
        }
      } catch (err) {
        console.error('Failed to fetch business types', err);
      }
    };
    fetchBizTypes();
  }, []);

  const [step, setStep] = useState(1);
  const [animDir, setAnimDir] = useState<'next' | 'prev'>('next');
  const [bizPage, setBizPage] = useState(0);

  /* form data */
  const [companyTitle, setCompanyTitle] = useState('');
  const [companyNameTH, setCompanyNameTH] = useState('');
  const [companyNameEN, setCompanyNameEN] = useState('');
  const [companyAbbreviation, setCompanyAbbreviation] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [employeeRange, setEmployeeRange] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSubType, setSelectedSubType] = useState(0);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [provisionDone, setProvisionDone] = useState(false);
  const [provisionStep, setProvisionStep] = useState(0);
  const [isFetchingDbd, setIsFetchingDbd] = useState(false);

  /* ─── Validation errors ─── */
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setError = (field: string, msg: string) => setErrors(prev => ({ ...prev, [field]: msg }));
  const clearError = (field: string) => setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  /* ─── Input handlers with validation ─── */
  const handleCompanyNameTH = (val: string) => {
    // Block English letters (a-z, A-Z)
    const filtered = val.replace(/[a-zA-Z]/g, '');
    setCompanyNameTH(filtered);
    if (val !== filtered && val.length > 0) {
      setError('companyNameTH', 'ไม่อนุญาตให้กรอกภาษาอังกฤษ');
    } else {
      clearError('companyNameTH');
    }
  };

  const handleCompanyNameEN = (val: string) => {
    // Block Thai characters (\u0E00-\u0E7F)
    let filtered = val.replace(/[\u0E00-\u0E7F]/g, '');
    
    // Auto-capitalize first letter of each word (Title Case)
    filtered = filtered.replace(/\b[a-zA-Z]/g, (char) => char.toUpperCase());

    setCompanyNameEN(filtered);
    if (/[\u0E00-\u0E7F]/.test(val)) {
      setError('companyNameEN', 'ไม่อนุญาตให้กรอกภาษาไทย');
    } else {
      clearError('companyNameEN');
    }
  };

  const handleCompanyAbbreviation = (val: string) => {
    // Only English letters. No numbers, spaces, no special chars. Force uppercase.
    const filtered = val.replace(/[^a-zA-Z]/g, '').toUpperCase();
    setCompanyAbbreviation(filtered);
    if (val.replace(/[^a-zA-Z]/g, '') !== val && val.length > 0) {
      setError('companyAbbreviation', 'อนุญาตเฉพาะตัวอักษรภาษาอังกฤษเท่านั้น');
    } else {
      clearError('companyAbbreviation');
    }
  };

  const handleTaxId = (val: string) => {
    // Strip everything except digits
    const digits = val.replace(/[^0-9]/g, '').slice(0, 13);
    // Auto-format as X-XXXX-XXXXX-XX-X
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i === 1 || i === 5 || i === 10 || i === 12) formatted += '-';
      formatted += digits[i];
    }
    setTaxId(formatted);
    if (digits.length > 0 && digits.length < 13) {
      setError('taxId', `กรอกเลขทะเบียนนิติบุคคลให้ครบ 13 หลัก (ขณะนี้ ${digits.length} หลัก)`);
    } else {
      clearError('taxId');
    }
  };

  const handleFetchDbd = async () => {
    const sanitized = taxId.replace(/[^0-9]/g, '');
    if (sanitized.length !== 13) return;
    
    setIsFetchingDbd(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8101/api';
      const res = await fetch(`${API_BASE}/registration/dbd/${sanitized}`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          if (result.data.companyTitle) setCompanyTitle(result.data.companyTitle);
          if (result.data.companyNameTH) {
            setCompanyNameTH(result.data.companyNameTH);
            clearError('companyNameTH');
          }
          if (result.data.companyNameEN) {
            setCompanyNameEN(result.data.companyNameEN);
            clearError('companyNameEN');
          }
        } else {
          alert(result.message || 'ไม่พบข้อมูลนิติบุคคล');
        }
      } else {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ API');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setIsFetchingDbd(false);
    }
  };

  const handleEmail = (val: string) => {
    setEmail(val);
    if (val.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setError('email', 'รูปแบบอีเมลไม่ถูกต้อง เช่น example@company.com');
      } else {
        clearError('email');
      }
    } else {
      clearError('email');
    }
  };

  const formatPhone = (val: string): { formatted: string; digits: string } => {
    // Strip everything except digits
    const digits = val.replace(/[^0-9]/g, '').slice(0, 10);
    let formatted = '';
    const isBangkok = digits.length >= 2 && digits.startsWith('02');
    if (isBangkok) {
      // Format: 02-XXX-XXXX (2-3-4)
      for (let i = 0; i < digits.length; i++) {
        if (i === 2 || i === 5) formatted += '-';
        formatted += digits[i];
      }
    } else {
      // Format: 0XX-XXX-XXXX (3-3-4)
      for (let i = 0; i < digits.length; i++) {
        if (i === 3 || i === 6) formatted += '-';
        formatted += digits[i];
      }
    }
    return { formatted, digits };
  };

  const handlePhone = (val: string) => {
    const { formatted, digits } = formatPhone(val);
    setPhone(formatted);
    if (digits.length > 0) {
      const minLen = digits.startsWith('02') ? 9 : 10;
      if (digits.length < minLen) {
        setError('phone', `เบอร์โทรศัพท์ต้องมี ${minLen} หลัก (ขณะนี้ ${digits.length} หลัก)`);
      } else {
        clearError('phone');
      }
    } else {
      clearError('phone');
    }
  };

  const handleAdminPhone = (val: string) => {
    const { formatted, digits } = formatPhone(val);
    setAdminPhone(formatted);
    if (digits.length > 0) {
      const minLen = digits.startsWith('02') ? 9 : 10;
      if (digits.length < minLen) {
        setError('adminPhone', `เบอร์โทรศัพท์ต้องมี ${minLen} หลัก (ขณะนี้ ${digits.length} หลัก)`);
      } else {
        clearError('adminPhone');
      }
    } else {
      clearError('adminPhone');
    }
  };

  const handleAdminEmail = (val: string) => {
    setAdminEmail(val);
    if (val.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        setError('adminEmail', 'รูปแบบอีเมลไม่ถูกต้อง');
      } else {
        clearError('adminEmail');
      }
    } else {
      clearError('adminEmail');
    }
  };

  const TOTAL_STEPS = 5;
  const group = businessGroups.find(g => g.code === selectedGroup);

  const goNext = useCallback(() => { setAnimDir('next'); setStep(s => Math.min(s + 1, TOTAL_STEPS)); }, []);
  const goPrev = useCallback(() => { setAnimDir('prev'); setStep(s => Math.max(s - 1, 1)); }, []);

  const hasErrors = (...fields: string[]) => fields.some(f => errors[f]);

  const canNext = (): boolean => {
    if (step === 1) {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const taxIdValid = taxId.replace(/[^0-9]/g, '').length === 13;
      const phoneValid = phone.replace(/[^0-9]/g, '').length >= 9;
      return companyTitle !== '' && 
             companyNameTH.trim().length > 0 && 
             companyNameEN.trim().length > 0 && 
             companyAbbreviation.trim().length > 0 && 
             taxIdValid && 
             phoneValid && 
             emailValid && 
             employeeRange !== '' &&
             !hasErrors('companyNameTH', 'companyNameEN', 'companyAbbreviation', 'taxId', 'email', 'phone');
    }
    if (step === 2) return selectedGroup !== '';
    if (step === 3) return selectedSubType > 0;
    if (step === 4) {
      const adminEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail);
      return adminName.trim().length > 0 && adminEmailValid && adminPassword.length >= 6 && !hasErrors('adminEmail', 'adminPhone');
    }
    return true;
  };

  const handleProvision = async () => {
    setProvisioning(true);
    setProvisionStep(0);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8101/api';

    try {
      // Step 0: สร้างฐานข้อมูล — call register API
      const payload = {
        companyTitle,
        companyNameTH,
        companyNameEN: companyNameEN || undefined,
        companyAbbreviation,
        taxId: taxId ? taxId.replace(/[^0-9]/g, '') : undefined,
        phone: phone ? phone.replace(/[^0-9]/g, '') : undefined,
        email,
        employeeRange: employeeRange || undefined,
        businessGroup: selectedGroup,
        businessSubType: selectedSubType,
        adminName,
        adminEmail,
        adminPassword,
        adminPhone: adminPhone ? adminPhone.replace(/[^0-9]/g, '') : undefined,
      };

      const regRes = await fetch(`${API_BASE}/registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!regRes.ok) {
        const errData = await regRes.json().catch(() => ({}));
        throw new Error(errData.message || `Registration failed (${regRes.status})`);
      }

      const regData = await regRes.json();
      const registrationId = regData.id;

      // Step 1-3: Poll status until completed
      setProvisionStep(1);
      await new Promise(r => setTimeout(r, 800));
      setProvisionStep(2);
      await new Promise(r => setTimeout(r, 800));

      // Poll provisioning status
      let attempts = 0;
      const maxAttempts = 30;
      let status = regData.status;

      while (status === 'provisioning' && attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000));
        try {
          const statusRes = await fetch(`${API_BASE}/registration/status/${registrationId}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            status = statusData.status;
          }
        } catch {
          // ignore polling errors, retry
        }
        attempts++;
      }

      setProvisionStep(3);
      await new Promise(r => setTimeout(r, 600));
      setProvisionStep(4);
      await new Promise(r => setTimeout(r, 600));

      if (status === 'failed') {
        throw new Error('การสร้างระบบล้มเหลว กรุณาลองใหม่อีกครั้ง');
      }

      setProvisioning(false);
      setProvisionDone(true);
    } catch (error: unknown) {
      setProvisioning(false);
      const msg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      alert(msg);
      console.error('Provisioning error:', error);
    }
  };

  /* ─── Render helpers ─── */
  const renderProgressBar = () => (
    <div className="reg-progress">
      {[1, 2, 3, 4, 5].map(i => (
        <React.Fragment key={i}>
          <div className={`reg-progress-step ${step >= i ? 'active' : ''} ${step === i ? 'current' : ''}`}>
            <div className="reg-progress-dot">{step > i ? '✓' : i}</div>
            <span className="reg-progress-label">
              {i === 1 && 'ข้อมูลธุรกิจ'}
              {i === 2 && 'กลุ่มธุรกิจ'}
              {i === 3 && 'ประเภทย่อย'}
              {i === 4 && 'ผู้ดูแลระบบ'}
              {i === 5 && 'ยืนยัน'}
            </span>
          </div>
          {i < 5 && <div className={`reg-progress-line ${step > i ? 'active' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="reg-step-content" key="step1">
      <h2 className="reg-step-title">ข้อมูลธุรกิจของคุณ</h2>
      <p className="reg-step-desc">กรอกข้อมูลเบื้องต้นเกี่ยวกับธุรกิจเพื่อเริ่มต้นใช้งาน NexCore</p>
      <div className="reg-form-grid">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className={`reg-field ${companyTitle === '' ? 'has-error' : ''}`}>
            <label>คำนำหน้านิติบุคคล <span className="required">*</span></label>
            <select value={companyTitle} onChange={e => setCompanyTitle(e.target.value)}>
              <option value="">-- เลือกคำนำหน้า --</option>
              <option value="บริษัท">บริษัท</option>
              <option value="บริษัทจำกัด (มหาชน)">บริษัทจำกัด (มหาชน)</option>
              <option value="ห้างหุ้นส่วนจำกัด">ห้างหุ้นส่วนจำกัด</option>
              <option value="ห้างหุ้นส่วนสามัญนิติบุคคล">ห้างหุ้นส่วนสามัญนิติบุคคล</option>
            </select>
          </div>
          <div className={`reg-field ${errors.companyAbbreviation ? 'has-error' : ''}`}>
            <label>ตัวย่อบริษัท <span className="required">*</span></label>
            <input value={companyAbbreviation} onChange={e => handleCompanyAbbreviation(e.target.value)} placeholder="NEXCORE" style={{ textTransform: 'uppercase' }} />
            {errors.companyAbbreviation && <span className="reg-field-error">{errors.companyAbbreviation}</span>}
          </div>
        </div>
        <div className={`reg-field ${errors.taxId ? 'has-error' : ''}`}>
          <label>เลขทะเบียนนิติบุคคล <span className="required">*</span></label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input value={taxId} onChange={e => handleTaxId(e.target.value)} placeholder="0-1234-56789-01-2" inputMode="numeric" style={{ flex: 1 }} />
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleFetchDbd}
              disabled={isFetchingDbd || taxId.replace(/[^0-9]/g, '').length !== 13}
              style={{ whiteSpace: 'nowrap' }}
            >
              {isFetchingDbd ? 'กำลังดึงข้อมูล...' : 'ดึงข้อมูลกรมพัฒฯ'}
            </button>
          </div>
          {errors.taxId && <span className="reg-field-error">{errors.taxId}</span>}
        </div>
        <div className={`reg-field ${errors.companyNameTH ? 'has-error' : ''}`}>
          <label>ชื่อบริษัท (ไทย) <span className="required">*</span></label>
          <input value={companyNameTH} onChange={e => handleCompanyNameTH(e.target.value)} placeholder="บริษัท ตัวอย่าง จำกัด" />
          {errors.companyNameTH && <span className="reg-field-error">{errors.companyNameTH}</span>}
        </div>
        <div className={`reg-field ${errors.companyNameEN ? 'has-error' : ''}`}>
          <label>ชื่อบริษัท (English) <span className="required">*</span></label>
          <input value={companyNameEN} onChange={e => handleCompanyNameEN(e.target.value)} placeholder="Example Co., Ltd." />
          {errors.companyNameEN && <span className="reg-field-error">{errors.companyNameEN}</span>}
        </div>
        <div className={`reg-field ${errors.phone ? 'has-error' : ''}`}>
          <label>เบอร์โทรศัพท์ <span className="required">*</span></label>
          <input value={phone} onChange={e => handlePhone(e.target.value)} placeholder="02-xxx-xxxx" inputMode="tel" />
          {errors.phone && <span className="reg-field-error">{errors.phone}</span>}
        </div>
        <div className={`reg-field ${errors.email ? 'has-error' : ''}`}>
          <label>อีเมลบริษัท <span className="required">*</span></label>
          <input type="text" inputMode="email" value={email} onChange={e => handleEmail(e.target.value)} placeholder="contact@company.com" />
          {errors.email && <span className="reg-field-error">{errors.email}</span>}
        </div>
        <div className={`reg-field ${employeeRange === '' ? 'has-error' : ''}`} style={{ gridColumn: '1 / -1' }}>
          <label>จำนวนพนักงาน <span className="required">*</span></label>
          <div className="reg-chip-group">
            {EMPLOYEE_RANGES.map(r => (
              <button key={r} className={`reg-chip ${employeeRange === r ? 'active' : ''}`} onClick={() => setEmployeeRange(r)}>{r}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    const ITEMS_PER_PAGE = 8;
    const totalBizPages = Math.ceil(businessGroups.length / ITEMS_PER_PAGE);
    const currentBizGroups = businessGroups.slice(bizPage * ITEMS_PER_PAGE, (bizPage + 1) * ITEMS_PER_PAGE);
    
    const paddedGroups = [...currentBizGroups];
    while (paddedGroups.length < ITEMS_PER_PAGE) {
      paddedGroups.push(null);
    }

    return (
      <div className="reg-step-content" key="step2">
        <h2 className="reg-step-title">เลือกกลุ่มธุรกิจของคุณ</h2>
        <p className="reg-step-desc">ระบบจะตั้งค่าเมนู สิทธิ์ และข้อมูลพื้นฐานให้เหมาะกับธุรกิจของคุณ</p>
        <div className="reg-biz-carousel-container">
          <button 
            className="reg-biz-nav" 
            disabled={bizPage === 0} 
            onClick={() => setBizPage(p => p - 1)}
            style={{ visibility: bizPage > 0 ? 'visible' : 'hidden' }}
          >
            &lt;
          </button>
          
          <div className="reg-biz-grid">
            {paddedGroups.map((g, idx) => g ? (
              <button key={g.code} className={`reg-biz-card ${selectedGroup === g.code ? 'selected' : ''}`} style={{ '--biz-color': g.color } as React.CSSProperties} onClick={() => { setSelectedGroup(g.code); setSelectedSubType(0); }}>
                <div className="reg-biz-icon">
                  {React.createElement(g.icon, { size: 48, strokeWidth: 1.5, color: g.color })}
                </div>
                <div className="reg-biz-code">{g.code}</div>
                <div className="reg-biz-name">{g.nameTH}</div>
                <div className="reg-biz-name-en">{g.nameEN}</div>
                <div className="reg-biz-desc">{g.desc}</div>
                {selectedGroup === g.code && <div className="reg-biz-check">✓</div>}
              </button>
            ) : (
              <div key={`empty-${idx}`} className="reg-biz-card empty" style={{ visibility: 'hidden' }} />
            ))}
          </div>

          <button 
            className="reg-biz-nav" 
            disabled={bizPage >= totalBizPages - 1} 
            onClick={() => setBizPage(p => p + 1)}
            style={{ visibility: bizPage < totalBizPages - 1 ? 'visible' : 'hidden' }}
          >
            &gt;
          </button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="reg-step-content" key="step3">
      <h2 className="reg-step-title">
        <span className="reg-step-icon" style={{ background: group?.color }}>
          {group?.icon && React.createElement(group.icon, { size: 20, color: '#fff' })}
        </span>
        เลือกประเภทย่อย — {group?.nameTH}
      </h2>
      <p className="reg-step-desc">เลือกรูปแบบธุรกิจที่ใกล้เคียงกับคุณมากที่สุด</p>
      <div className="reg-sub-grid">
        {group?.subTypes.map((st: any) => (
          <button key={st.num} className={`reg-sub-card ${selectedSubType === st.num ? 'selected' : ''}`} style={{ '--biz-color': group.color } as React.CSSProperties} onClick={() => setSelectedSubType(st.num)}>
            <div className="reg-sub-num">Type {st.num}</div>
            <div className="reg-sub-name">{st.nameTH}</div>
            <div className="reg-sub-name-en">{st.nameEN}</div>
            <div className="reg-sub-desc">{st.desc}</div>
            <div className="reg-sub-examples">ตัวอย่าง: {st.examples}</div>
            {selectedSubType === st.num && <div className="reg-sub-check">✓</div>}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="reg-step-content" key="step4">
      <h2 className="reg-step-title">ข้อมูลผู้ดูแลระบบ</h2>
      <p className="reg-step-desc">สร้างบัญชี Admin สำหรับเข้าใช้งานระบบ</p>
      <div className="reg-form-grid reg-form-narrow">
        <div className="reg-field">
          <label>ชื่อ-สกุล <span className="required">*</span></label>
          <input value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="ชื่อจริง นามสกุล" />
        </div>
        <div className={`reg-field ${errors.adminEmail ? 'has-error' : ''}`}>
          <label>อีเมล (ใช้เป็น Username) <span className="required">*</span></label>
          <input type="text" inputMode="email" value={adminEmail} onChange={e => handleAdminEmail(e.target.value)} placeholder="admin@company.com" />
          {errors.adminEmail && <span className="reg-field-error">{errors.adminEmail}</span>}
        </div>
        <div className="reg-field">
          <label>รหัสผ่าน <span className="required">*</span></label>
          <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" />
        </div>
        <div className={`reg-field ${errors.adminPhone ? 'has-error' : ''}`}>
          <label>เบอร์โทรศัพท์</label>
          <input value={adminPhone} onChange={e => handleAdminPhone(e.target.value)} placeholder="08x-xxx-xxxx" inputMode="tel" />
          {errors.adminPhone && <span className="reg-field-error">{errors.adminPhone}</span>}
        </div>
      </div>
    </div>
  );

  const subType = group?.subTypes.find((s: any) => s.num === selectedSubType);

  const renderStep5 = () => (
    <div className="reg-step-content" key="step5">
      {provisionDone ? (
        <div className="reg-done">
          <div className="reg-done-icon">🎉</div>
          <h2 className="reg-done-title">ระบบพร้อมใช้งานแล้ว!</h2>
          <p className="reg-done-desc">ฐานข้อมูลของ <strong>{companyNameTH}</strong> ถูกสร้างเรียบร้อย</p>
          <button className="btn btn-primary reg-done-btn" onClick={() => window.location.href = '/'}>เข้าสู่ระบบ</button>
        </div>
      ) : provisioning ? (
        <div className="reg-provisioning">
          <div className="reg-spinner" />
          <h2 className="reg-prov-title">กำลังสร้างระบบของคุณ...</h2>
          <div className="reg-prov-steps">
            {['กำลังสร้างฐานข้อมูล', 'ตั้งค่า Roles & Permissions', 'สร้างเมนูระบบ', 'ตั้งค่า Master Data', 'เสร็จสมบูรณ์'].map((label, i) => (
              <div key={i} className={`reg-prov-item ${provisionStep > i ? 'done' : provisionStep === i ? 'active' : ''}`}>
                <span className="reg-prov-dot">{provisionStep > i ? '✓' : provisionStep === i ? '⟳' : '○'}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <h2 className="reg-step-title">ยืนยันข้อมูลการลงทะเบียน</h2>
          <p className="reg-step-desc">ตรวจสอบข้อมูลก่อนสร้างระบบ</p>
          <div className="reg-summary-grid">
            {/* Left column: Company Info */}
            <div className="reg-summary">
              <div className="reg-summary-section">
                <h3>ข้อมูลธุรกิจ</h3>
                <div className="reg-summary-row"><span>ชื่อบริษัท</span><strong>{companyNameTH}</strong></div>
                {companyNameEN && <div className="reg-summary-row"><span>ชื่อ (EN)</span><strong>{companyNameEN}</strong></div>}
                <div className="reg-summary-row"><span>ตัวย่อบริษัท</span><strong>{companyAbbreviation}</strong></div>
                {taxId && <div className="reg-summary-row"><span>เลขทะเบียน</span><strong>{taxId}</strong></div>}
                <div className="reg-summary-row"><span>อีเมล</span><strong>{email}</strong></div>
                {phone && <div className="reg-summary-row"><span>เบอร์โทร</span><strong>{phone}</strong></div>}
                {employeeRange && <div className="reg-summary-row"><span>จำนวนพนักงาน</span><strong>{employeeRange}</strong></div>}
              </div>
            </div>
            {/* Right column: Business Type + Admin */}
            <div className="reg-summary">
              <div className="reg-summary-section">
                <h3>ประเภทธุรกิจ</h3>
                <div className="reg-summary-biz" style={{ '--biz-color': group?.color } as React.CSSProperties}>
                  <span className="reg-summary-biz-icon">{group?.icon && React.createElement(group.icon, { size: 24 })}</span>
                  <div>
                    <strong>{group?.nameTH} ({group?.code})</strong>
                    <div className="reg-summary-sub">{subType?.nameTH} — {subType?.nameEN}</div>
                  </div>
                </div>
              </div>
              <div className="reg-summary-section">
                <h3>ผู้ดูแลระบบ</h3>
                <div className="reg-summary-row"><span>ชื่อ</span><strong>{adminName}</strong></div>
                <div className="reg-summary-row"><span>อีเมล</span><strong>{adminEmail}</strong></div>
                {adminPhone && <div className="reg-summary-row"><span>เบอร์โทร</span><strong>{adminPhone}</strong></div>}
              </div>
            </div>
          </div>
          <button className="btn btn-primary reg-provision-btn" onClick={handleProvision}>
            🚀 สร้างระบบ
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="reg-page">
      {/* Background effects */}
      <div className="reg-bg-orb reg-bg-orb-1" />
      <div className="reg-bg-orb reg-bg-orb-2" />
      <div className="reg-bg-orb reg-bg-orb-3" />

      <div className="reg-container">
        {/* Header */}
        <div className="reg-header">
          <div className="reg-logo">
            <div className="reg-logo-icon">N</div>
            <div>
              <div className="reg-logo-name">NexCore</div>
              <div className="reg-logo-sub">Enterprise Registration</div>
            </div>
          </div>
        </div>

        {/* Progress */}
        {!provisionDone && renderProgressBar()}

        {/* Steps */}
        <div className={`reg-step-wrapper anim-${animDir}`}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>

        {/* Navigation */}
        {!provisioning && !provisionDone && (
          <div className="reg-nav">
            {step > 1 && <button className="btn btn-secondary" onClick={goPrev}>← ย้อนกลับ</button>}
            <div style={{ flex: 1 }} />
            {step < TOTAL_STEPS && (
              <button className="btn btn-primary" disabled={!canNext()} onClick={goNext}>
                ถัดไป →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
