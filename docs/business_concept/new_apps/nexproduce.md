# 🏭 NexProduce — ระบบวางแผนและควบคุมการผลิต (Production & MRP)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexproduce.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

จัดการกระบวนการผลิิต รวบรวมสูตร (BOM) การวางแผนวัตถุดิบ (MRP) และสั่งงาน Shop floor

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Production Dashboard
```text
├── OEE, ยอดผลิตเทียบเป้า, อัตราของเสีย
```

### 📋 Engineering
```text
├── Bill of Materials (BOM)
├── Routing & Work Centers (สถานีและวิธีการ)
```

### 📅 Planning
```text
├── Production Plan (MPS)
├── Material Requirement (MRP)
```

### 🛠️ Executing
```text
├── Work Orders (ใบสั่งผลิต)
├── Shop Floor Control (เดินเครื่อง)
```

### ✅ Quality
```text
├── QC Inspection
├── Scrap & Rework
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **BOM & Routing:** สูตรมาตรฐานของผลิตภัณฑ์ว่าจะต้องใช้ทรัพยากรอะไรบ้าง มีกี่ขั้นตอน
- **Work Centers:** เครื่องจักร/ทีมงานที่มีกำลังผลิต (Capacity) กำหนดชั่วโมง

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **MRP Engine:** ระบบคำนวณเปรียบเทียบ ยอดขาย/ออเดอร์ - สต็อกที่มี - คาดการณ์ เพื่อระบุสิ่งที่ต้องซื้อ
- **Shop Floor Reporting:** เทอร์มินัลหน้าเตาหรือหน้าไลน์ สำหรับสแกนบาร์โค้ดแจ้งเริ่มผลิต / พัก / เสร็จ / ของเสีย

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **F&B:** BOM สำหรับงานครัวกลาง (Central Kitchen) การจัดแจงแบทช์น้ำซุป, สูตรแป้ง
- **Manufacturing:** เน้น Work Order และการแทร็ก Lot/Serial ตลอดสายพาน

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexProcure:** MRP ผลิตส่ง PR ไปหาฝ่ายจัดซื้ออัตโนมัติเมื่อวัตถุดิบขาด
- **เชื่อมต่อ NexCost:** คำนวณต้นทุนต่อหน่วย (Standard Cost vs Actual Cost) และบวก Overhead

---

## 🛠️ Technical Stack & Notes
```text
Graph/Tree Database for Multi-level BOM
Calculation Engine
```

---

_NexOne Development Team | NexProduce Specification | April 2026_
