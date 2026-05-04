# 📑 NexLess — ระบบจัดการเอกสารดิจิทัลอัจฉริยะ (Paperless Vault & E-Sign)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexless.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

ลดการใช้กระดาษ เก็บแฟ้มอย่างมีระเบียบ และบริการลงนามออนไลน์อิเล็กทรอนิกส์ตามกฎหมาย

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Vault Board
```text
├── เอกสารเข้าใหม่, ไฟล์ใกล้หมดอายุ
```

### 🗄️ Document Vault
```text
├── My Folders & Shares
├── Policy / ISO Standard Library
```

### 🖊️ Signature Center
```text
├── E-Sign Request Inbox
├── Sign PDF Tool
```

### 🔍 Search Engine
```text
├── OCR Search (หาเอกสารจากคำในรูป)
```

### ♻️ Archive Rules
```text
├── Retention Setting (ตั้งทำลายอัตโนมัติ)
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Folder Permissions:** ระบบล็อกชั้นความลับ ตามแผนกหรือบุคคล
- **Document Metadata Attributes:** ฟิลด์ Tags ต่างๆ ประกอบเอกสาร เพื่อง่ายต่อการค้น

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **E-Sign Workflow:** อนุญาตส่ง PDF ให้ลูกค้าหรือคนในเซ็นผ่านหน้าเว็บ หรืออีเมล พร้อม Timestamp
- **Scan & OCR:** รับรูปใบเสร็จ และสกัดเป็นตัวอักษรเพื่อค้นได้ (Smart Text extraction)

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Trading / Procurement:** เอาไว้เก็บประวัติคู่สัญญากับต่างประเทศ ภาษี นำเข้า-ส่งออก
- **Service:** เก็บแฟ้ม Service Agreement (SLA) ให้ตรวจสอบอ้างอิงย้อนหลัง

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ ทุกแอประบบ (All apps):** NexLess เสียบฟังก์ชั่นเป็น Cloud Storage ให้คนอื่นๆ เรียกขอบันทึกไฟล์ PDF
- **เชื่อมต่อ NexApprove:** เมื่อถูกอนุมัติ สามารถสร้างเอกสารเซ็นและนำมาพับเก็บในเซฟอัตโนมัติ

---

## 🛠️ Technical Stack & Notes
```text
Tesseract OCR
PDF-LIB for E-signature Watermark
```

---

_NexOne Development Team | NexLess Specification | April 2026_
