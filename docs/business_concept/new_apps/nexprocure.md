# 🛒 NexProcure — ระบบบริหารจัดการจัดซื้อจัดจ้าง (Procurement)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexprocure.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

วัฏจักรการจัดซื้อมีประสิทธิภาพ ตั้งแต่คัดเลือก Vendor, ขออนุมัติซื้อ (PR), สั่งซื้อ (PO) รวมถึงประเมินผู้ค้า

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Procurement Dashboard
```text
├── ยอดซื้อแยกตาม Vendor, กำหนดส่งสินค้าสัปดาห์นี้, สถานะ PR รออนุมัติ
```

### 🤝 Vendor Management
```text
├── Vendor Directory
├── Vendor Price List / Catalog
├── Vendor Evaluation
```

### 📝 Request (PR)
```text
├── Purchase Request (PR) สร้างใบขอซื้อ
```

### 📄 Order (PO)
```text
├── Purchase Order (PO)
├── PO Blanket (สัญญาเปิด)
```

### 🛠️ Subcontractor
```text
├── ผู้รับเหมาช่วง
├── การแบ่งงวดงานซับคอนแทรค
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Vendor Master:** ข้อมูลผู้ผลิต Supplier, เครดิตเทอม, เอกสาร ภ.พ.20
- **Approval Matrix:** ตั้งค่าลำดับการอนุมัติใบขอซื้อตามวงเงิน

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **PR to PO Conversion:** คลิกเพื่อรวม PR หลายใบเป็น PO ใบเดียวเพื่อต่องานง่าย
- **Subcontractor Tracking:** ออกแบบมาเพื่อหน้างานที่มีการจ้างซ่างนอก หรือจ้างรถร่วม จัดทำใบแบ่งงวดงาน

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Construction:** ต้องอ้างอิง BOQ ในการดึงงบสั่งงซื้อวัสดุ และจัดการงวดงานจ้างซับ (Sub-contractor) จ่ายตาม Progress
- **F&B:** รองรับการซื้อสินค้าเน่าเสียด่วนจากตลาด (Petty Cash/Market Purchase) แบบ Fast-track

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexStock:** เมื่อ Vendor ส่งของ PO จะเป็นเอกสารตั้งต้นในการทำ Goods Receipt Note (GRN)
- **เชื่อมต่อ NexFinance:** ส่ง PO และ GRN ไปทำ 3-Way Matching ออกเป็น AP (ตั้งหนี้ผู้ค้า)

---

## 🛠️ Technical Stack & Notes
```text
Workflow / Status Transition Engine
PDF Generation Engine
```

---

_NexOne Development Team | NexProcure Specification | April 2026_
