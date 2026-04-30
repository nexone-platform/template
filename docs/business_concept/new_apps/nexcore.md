# ⚙️ NexCore — ระบบจัดการส่วนกลาง (Central Management & Access)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexcore.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

เป็นแกนกลางของแพลตฟอร์ม NexOne ใช้สำหรับตั้งค่าข้อมูลบริษัท จัดการสิทธิ์การเข้าถึงแบบรวมศูนย์ (SSO) ระบบการแจ้งเตือน ยืนยันตัวตน และเป็นฐานในการต่อยอดฟีเจอร์ระดับองค์กรทุกแอป

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Dashboard & Portal
```text
├── Dashboard ภาพรวมระบบ (Active Users, Login Attempts)
├── App Launcher / Portal หน้าต่างเลือกแอป
```

### 🏢 Organization Mgmt
```text
├── Company Profile (นิติบุคคล, ที่อยู่, ภาษี)
├── Branches (สาขา)
├── Departments & Positions (แผนก/ตำแหน่ง)
```

### 👥 User & Security
```text
├── Users Directory
├── Role & Permission Builder
├── Single Sign-On (SSO) Setup
├── Audit Logs / Activity Monitor
```

### ⚙️ System Setup
```text
├── Notification Center (ตั้งค่าส่ง SMS, Email, Line)
├── API Gateway / Webhook Config
├── Business Industry Template (ตั้งค่าเริ่มต้นรูปแบบธุรกิจ)
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Company & Branch Master:** ข้อมูลนิติบุคคล สาขา ให้แอปอื่นนำไปใช้แยก Data Isolate
- **Organization Structure:** ระบุสายบังคับบัญชา และหน่วยงานภายใน

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Dynamic Role Matrix:** สร้าง Role พลิกแพลงได้อิสระ เช่น ให้ดูได้แต่แก้ไขไม่ได้ หรือดูได้เฉพาะเอกสารตัวเอง
- **Identity & Access Management:** หน้า Login กลาง รองรับ 2FA และ Google/Line SSO

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Logistics:** ใช้กำหนดสาขาเป็น "ศูนย์กระจายสินค้า (Hub)" เพื่อแบ่งเขตพื้นที่ Access
- **Real Estate / Construction:** ใช้กำหนดโครงสร้างบริษัทเป็นแยก "โครงการ (Projects)"

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ ทุกแอป (All Apps):** ดึง Role และ User Profile ไปแสดงผลในฐานผู้ใช้งาน
- **เชื่อมต่อ NexAudit:** ส่งการเข้าล็อกอินและการปรับแก้ผู้ใช้ ไปเก็บบันทึกประวัติ

---

## 🛠️ Technical Stack & Notes
```text
NestJS (Auth Module)
Redis Config Cache
JWT & OAuth2
```

---

_NexOne Development Team | NexCore Specification | April 2026_
