# 🚜 NexAsset — ระบบบริหารจัดการทรัพย์สิน (Asset & Maintenance)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexasset.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

ลงทะเบียนทรัพย์สิน บำรุงรักษาเชิงป้องกัน (PM) ติดตามค่าเสื่อมและประวัติการย้ายทรัพย์สิน

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Asset Dashboard
```text
├── ทรัพย์สินที่ต้องซ่อมบำรุงเร็วๆ นี้, ทรัพย์สินที่ใช้งานอยู่/ว่าง
```

### 📦 Asset Registry
```text
├── เครื่องจักร / อุปกรณ์ (Machinery / Equipments)
├── ยานพาหนะ (Vehicles)
├── อุปกรณ์ไอที (IT Assets)
```

### 🔧 Maintenance (PM)
```text
├── PM Calendar
├── Service History (ประวัติซ่อม)
├── Work Orders (ใบแจ้งซ่อม)
```

### 🔖 Tag & Transfer
```text
├── Asset Transfer (ใบย้ายทรัพย์สิน)
├── QR/Barcode Generator
```

### 📉 Finance Asset
```text
├── Depreciation Schedule (ตารางค่าเสื่อม)
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Asset Master:** ทะเบียนทรัพย์สิน, รูปภาพ, คู่มือ, วันที่รับประกัน
- **Vehicle Master:** สำหรับรถบรรทุก: บันทึกเลขทะเบียนตัวถัง, รอบต่อ พ.ร.บ./ภาษีรถ

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Preventive Maintenance (PM):** กำหนดรอบเข้าซ่อมตาม Date (เดือน/ปี) หรือ Meter (กม./ชั่วโมงการทำงาน)
- **Tagging System:** ปริ้นต์แท็ก QR แปะทรัพย์สิน ใช้มือถือยิงดูประวัติซ่อมทันที

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Logistics:** ใช้ Vehicle Master คุมทะเบียนรถ, ทะเบียนหางลาก (Trailer), วันหมดอายุใบอนุญาตขนส่ง
- **Real Estate:** ใช้คุมทรัพย์สินรายย่อยในแต่ละห้องพัก/ห้องเช่า (แอร์, เฟอร์นิเจอร์) ว่าเสียหายไหมเมื่อคืนห้อง

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexSpeed:** ส่ง Vehicle List ที่พร้อมวิ่งไปให้จัดคิว หากซ่อมอยู่จะถูกห้ามวิ่ง
- **เชื่อมต่อ NexMaint:** ทำงานร่วมกัน โดย NexAsset เก็บประวัติส่วนตัว, NexMaint จัดการทีมช่างและตารางออกใบงาน
- **เชื่อมต่อ NexFinance:** ส่งตัวเลขค่าเสื่อมบัญชีทุกสิ้นเดือนไปลง GL

---

## 🛠️ Technical Stack & Notes
```text
QR/Barcode Generator System
Cron Jobs for PM Alerts
```

---

_NexOne Development Team | NexAsset Specification | April 2026_
