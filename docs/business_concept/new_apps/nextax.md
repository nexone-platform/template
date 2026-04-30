# 🧾 NexTax — ระบบจัดการภาษี VAT และหัก ณ ที่จ่าย (Tax Management)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nextax.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

บันทึกภาษีเพื่อยื่นกรมสรรพากร รองรับระบบ e-Tax Invoice และระบบใบหัก ณ ที่จ่าย ที่มีโครงสร้างซับซ้อน

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Tax Board
```text
├── รายการภาษีค้างยื่น
```

### 📥 VAT Forms
```text
├── Input Tax (ภาษีซื้อ ภพ.30)
├── Output Tax (ภาษีขาย ภพ.30)
├── Tax Reconciliation
```

### 📜 WHT Forms
```text
├── Withholding Tax (50 ทวิ)
├── ภ.ง.ด. 3, ภ.ง.ด. 53
├── ภ.ง.ด. 54
```

### 🌐 e-Tax
```text
├── e-Tax Invoice Gateway
├── XML/PDF Digital Signature
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Tax Rates & Conditions:** ประเภทภาษีต่างๆ ของไทย (ยกเว้น, 0%, 7%, หัก 3%, หัก 1%)
- **Company Certificates:** การผูกใบรับรองอิเล็กทรอนิกส์สำหรับเซ็น e-Tax

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Auto WHT Calculation:** เมื่อรับ/จ่ายเงิน ถ้าฝ่ายทำเรื่องกำหนดเงื่อนไขชำระบริการ ระบบจะสร้างเอกสาร หัก ณ ที่จ่ายอัตโนมัติ
- **e-Tax Generation:** ส่งเข้า Service Provider อัตโนมัติและรับ Response กลับมาเพื่อพิมพ์สัญลักษณ์ e-Tax บนหน้ากระดาษ PDF

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **ทุกอุตสาหกรรมในไทย:** ทำงานตามโครงสร้างกฎหมายกรมสรรพากรแห่งประเทศไทย 100%

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexFinance:** เมื่อจ่าย AP รับ AR เสร็จ ข้อมูลจะส่งทะลุมาออกเอกสารภาษีที่ NexTax (ลดการคีย์ซ้ำ)
- **เชื่อมต่อ API สรรพากร/Provider:** ยิงส่งข้อมูลสดเข้าระบบ

---

## 🛠️ Technical Stack & Notes
```text
XML Processor (ETDA Standard)
RSA/PKI XML Encryption
```

---

_NexOne Development Team | NexTax Specification | April 2026_
