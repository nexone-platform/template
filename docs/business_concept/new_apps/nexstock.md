# 📦 NexStock — ระบบบริหารจัดการสินค้าคงคลัง (Inventory Management)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexstock.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

บริหารสต็อก, วัตถุดิบ, งานระหว่างทำ (WIP), จัดการโซน/Bin, ระบบจองของ และการย้ายสาขา

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Inventory Dashboard
```text
├── ระดับสต็อกโดยรวม, สินค้าใกล้หมด (Low Stock Warning)
```

### 📦 Product Catalog
```text
├── Product Master (รหัสสินค้า)
├── UOM Configuration (หน่วยนับและราคาพหูคูณ)
```

### 🏢 Warehouse Setup
```text
├── Warehouse (คลัง)
├── Zone & Bin Location (ชั้นวาง)
```

### 📥 Inbound
```text
├── Goods Receipt Note (GRN) รับเข้า
├── Put-away Strategy
```

### 📤 Outbound & Transfer
```text
├── Goods Issue (เบิกออก)
├── Stock Transfer (โอนย้าย)
```

### 📋 Inventory Control
```text
├── Cycle Count (นับสต็อก)
├── Stock Adjustment (ปรับปรุง)
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Product / Material Master:** รายละเอียดสินค้า/วัตถุดิบ รองรับ Serial/Lot Number และ Barcode
- **Warehouse Structure:** การเซ็ตสถานที่เก็บ เพื่อให้พนักงานเดินหยิบ (Picking Route) ได้เร็ว

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Traceability (FIFO/FEFO):** จัดการ Stock เลือกล็อตที่หมดอายุก่อนมาจ่ายออก เสมอ (สำหรับ F&B และ Trading)
- **Real-time Stock Card:** ประวัติความเคลื่อนไหวสินค้าทุกรายการ (เข้า/ออก) ตรวจสอบย้อนหลังได้ทุก Transaction

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **F&B / Manufacturing:** มีการแปลงหน่วย (เช่น ซื้อเป็นถังแก้วลิตร เบิกจ่ายเป็นมิลลิลิตร) และตัดสต็อกแบบ Backflush (ตามสูตร BOM)
- **Construction:** การจัดการ Site Store ย้ายสต็อกจากคลังกลางไปตู้คอนเทนเนอร์หน้าไซต์

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexSales / NexPOS:** ลดสต็อกอัตโนมัติเมื่อขายสินค้า (GI อัตโนมัติ)
- **เชื่อมต่อ NexProduce:** ให้ฝ่ายผลิตลงเบิกวัตถุดิบ (Raw Mats) และรับเข้าสินค้าสำเร็จรูป (Finished Goods)

---

## 🛠️ Technical Stack & Notes
```text
Transaction Logging (Append-only)
Redis Inventory Check
```

---

_NexOne Development Team | NexStock Specification | April 2026_
