# 🏭 NexOne Platform — คู่มือสำหรับธุรกิจรับจ้างผลิต (Contract Manufacturing)

**Document Version:** 1.0 | **Date:** April 2026  
**เป้าหมาย:** แสดงกระบวนการทำงานของธุรกิจรับจ้างผลิตแต่ละประเภท  
และการเชื่อมโยงระหว่างแอปใน NexOne Platform ตั้งแต่เริ่มจนจบ

---

## 🏢 ประเภทธุรกิจที่ครอบคลุม

| # | ประเภท | ลักษณะธุรกิจ | ตัวอย่างอุตสาหกรรม |
|---|---|---|---|
| **Type 1** | **Make-to-Order / Job Shop** | ผลิตตามสั่งทีละงาน ไม่มีสต็อก | เครื่องจักร, ชิ้นส่วนโลหะ, แม่พิมพ์ |
| **Type 2** | **OEM / Contract Manufacturing** | ผลิตตาม Design ลูกค้า เป็น Batch ใหญ่ | อิเล็กทรอนิกส์, เสื้อผ้า, บรรจุภัณฑ์ |
| **Type 3** | **Tolling / แปรรูปวัตถุดิบ** | ลูกค้าส่งวัตถุดิบมา เราแปรรูปแล้วคืน | โรงสี, แปรรูปอาหาร, ชุบโลหะ |
| **Type 4** | **Make-to-Stock / ผลิตขายเอง** | ผลิตเก็บสต็อก + ขายผ่าน Distributor | อาหาร, เครื่องสำอาง, ของใช้ทั่วไป |

---

## ⚙️ STEP 0 — ตั้งค่าระบบก่อนเริ่มใช้งาน (ทำครั้งเดียว)

> **ผู้รับผิดชอบ:** IT Admin / ผู้บริหาร / Production Manager

```
┌──────────────────────────────────────────────────────────────────┐
│  NexCore — ตั้งค่ากลาง                                           │
│  ├── ลงทะเบียนบริษัทและโรงงาน                                    │
│  ├── กำหนด Role & Permission                                     │
│  │     ├── MD / ผู้บริหาร          → ดูทุกอย่าง + Dashboard      │
│  │     ├── Sales / Account Mgr    → รับ Order, Quotation         │
│  │     ├── Production Planner     → วางแผนการผลิต + Work Order   │
│  │     ├── Production Supervisor  → ควบคุมหน้าพื้น + บันทึกงาน  │
│  │     ├── QC Inspector           → ตรวจคุณภาพ + บันทึก QC      │
│  │     ├── Warehouse / Store      → จัดการวัตถุดิบ + สำเร็จรูป  │
│  │     ├── Purchasing             → จัดซื้อวัตถุดิบ              │
│  │     ├── Maintenance            → ซ่อมบำรุงเครื่องจักร         │
│  │     └── Finance / Accounting   → บัญชี, ต้นทุน, ภาษี         │
│  └── SSO — พนักงานทุกคนใช้ Account เดียว                         │
│                                                                  │
│  NexForce — ข้อมูลพนักงาน                                        │
│  ├── พนักงานผลิต (ลงเวลาทำงาน, กะ)                               │
│  ├── ช่างเทคนิค, Operator, QC Inspector                          │
│  ├── กำหนด Shift (กะ A/B/C หรือ 2 กะ)                           │
│  └── บันทึกชั่วโมงแรงงานต่อ Work Order                           │
│                                                                  │
│  NexAsset — ทะเบียนเครื่องจักรและเครื่องมือ                       │
│  ├── ลงทะเบียนเครื่องจักรทุกตัว (รายละเอียด, กำลังผลิต)           │
│  ├── QR Code ติดเครื่องทุกตัว                                    │
│  ├── กำหนดรอบ PM (Preventive Maintenance)                        │
│  └── เชื่อม NexMaint: แจ้งซ่อมอัตโนมัติ                          │
│                                                                  │
│  NexProduce — ตั้งค่าการผลิต (ข้อมูลพื้นฐาน)                     │
│  ├── Work Center / เครื่องจักร / สถานีงาน                         │
│  ├── BOM (Bill of Materials) ต่อสินค้า                           │
│  │     └── สูตรส่วนผสม + สัดส่วนที่ใช้ต่อหน่วย                  │
│  ├── Routing (ลำดับขั้นตอนการผลิต)                                │
│  │     └── Op.1 → Op.2 → Op.3 → QC → บรรจุ                    │
│  └── Capacity (กำลังผลิตต่อวัน ต่อ Work Center)                 │
│                                                                  │
│  NexStock — ตั้งค่าคลัง                                          │
│  ├── วัตถุดิบ (Raw Material) Master Data                         │
│  ├── Work-in-Process (WIP) Location                              │
│  ├── Finished Goods (FG) Location                                │
│  └── Min Stock / Reorder Point ของวัตถุดิบแต่ละรายการ            │
└──────────────────────────────────────────────────────────────────┘
```

---

---

# 🔵 Type 1: Make-to-Order / Job Shop (ผลิตตามสั่ง)

> **ลักษณะ:** ทุก Order คือ "งานใหม่" — ไม่มีสต็อกสินค้าสำเร็จรูปล่วงหน้า  
> **ตัวอย่าง:** ชิ้นส่วนโลหะ CNC, แม่พิมพ์, งานเชื่อม + พ่นสี Custom, เฟอร์นิเจอร์ตามสั่ง  
> **ความซับซ้อน:** ทุก Job ต่างกัน BOM ต่างกัน ต้นทุนต้องคิดแยกต่อ Job

---

## 📋 กระบวนการ Make-to-Order — End to End

---

### 🟦 LANE A: ฝ่ายขาย — รับ Inquiry และเสนอราคา

```
ลูกค้าส่งแบบ/Spec/Drawing มาขอราคา
        │
        ▼
[NexSales] — Inquiry Management
        ├── บันทึก Inquiry + แนบไฟล์แบบ Drawing [NexLess]
        ├── ส่งรายละเอียดให้ฝ่ายผลิตประเมิน
        │       └── [NexProduce] BOM Management ← Engineering ประเมินสูตร:
        │               ├── วัตถุดิบที่ต้องใช้ (โครงสร้าง BOM หลายชั้น)
        │               ├── ชั่วโมงแรงงานที่ใช้
        │               ├── Machine Time ที่ต้องการ
        │               └── ระยะเวลาส่งมอบ (Lead Time)
        ├── [NexCost] ← คำนวณต้นทุนต่อ Job
        │               ├── ต้นทุนวัตถุดิบ (Material Cost)
        │               ├── ต้นทุนแรงงาน (Labor Cost)
        │               ├── ต้นทุนเครื่องจักร (Machine Cost)
        │               └── Overhead + กำไรที่ต้องการ
        ├── ออก Quotation พร้อมราคาและเงื่อนไข
        │       └── [NexApprove] ← ถ้าส่วนลด > X% ต้องอนุมัติก่อน
        │       └── [NexCore] Notification Engine ส่งแจ้งเตือนสถานะอนุมัติให้อัตโนมัติ
        └── ลูกค้าตกลง → สร้าง Sales Order (Job Order)
```

**ผู้รับผิดชอบ:** Sales / Account Manager, Engineering / Production Planner

---

### 🟩 LANE B: ฝ่ายวางแผนผลิต — Production Planning

```
[Sales Order] → [NexProduce] Production Planning
        │
        ├── สร้าง Work Order (WO) สำหรับ Job นี้
        │       ├── กำหนด BOM (สูตรวัตถุดิบหลัก)
        │       └── [NexProduce] Routing / Work Center ลำดับขั้นตอนผลิต + กำลังผลิตต่อสถานีงาน
        ├── ตรวจสต็อกวัตถุดิบ ← [NexStock]
        │       ├── [มีพอ] → จองวัตถุดิบไว้ให้ Job นี้
        │       └── [ไม่พอ] → ส่ง Alert → [NexProcure] สั่งซื้อ
        ├── จัดตารางการผลิต (Scheduling)
        │       ├── ดู Capacity เครื่องจักรว่าง (NexAsset)
        │       ├── ดู Workload คนงานว่าง (NexForce/Shift)
        │       └── กำหนดวันเริ่ม-เสร็จ ต่อแต่ละ Work Center
        └── Release WO → แจ้ง Production Floor เริ่มงาน
```

**ผู้รับผิดชอบ:** Production Planner

---

### 🟡 LANE C: ฝ่ายจัดซื้อ — วัตถุดิบ (คู่ขนาน)

```
[NexProcure] รับ Alert วัตถุดิบขาด
        │
        ├── สร้าง Purchase Request (PR) → [NexApprove]
        ├── ส่ง RFQ → เลือก Vendor
        ├── ออก PO
        ├── รับสินค้าเข้าคลัง (GR) → [NexStock]
        ├── AP Invoice → [NexFinance]
        └── [NexFinance] 3-Way Matching จับคู่ PO + Goods Receipt + Invoice ก่อนจ่ายเงินอัตโนมัติ
```

**ผู้รับผิดชอบ:** Purchasing Officer

---

### 🟨 LANE D: พื้นงานผลิต (Shop Floor) — ปฏิบัติการจริง

```
[NexProduce] Shop Floor Control
        │
├── Op.1: ขั้นตอนแรก (เช่น ตัด/กลึง/ปั้ม)
│       ├── คนงาน สแกน QR Work Order → บันทึก Start/Stop/Output/Scrap แบบ Real-time
│       ├── เบิกวัตถุดิบจากคลัง ← [NexStock] ตัดสต็อกและหักวัตถุดิบด้วย FEFO + Expiry Alert จ่ายล็อตเก่าก่อน
│       ├── ทำงาน → กด "เสร็จ" → บันทึกจำนวนที่ทำได้
│       └── บันทึก Scrap / Waste
│
├── Op.2: ขั้นตอนถัดไป (เช่น เจาะ/งาน/ประกอบ)
│       ├── รับงานต่อจาก Op.1
│       └── [NexForce] Timesheet ต่อ Work Order บันทึกชั่วโมงเพื่อคำนวณ Labor Cost ครบคู่กับ Machine Time จริง
│
├── [NexProduce] QC Module (3 ระดับ) — ในที่นี้ใช้ In-Process QC
│       ├── QC Inspector สแกน QR → บันทึกผลตรวจและ AQL Sampling Plan
│       ├── [ผ่าน] → ส่งต่อ Op.ถัดไป
│       └── [ไม่ผ่าน] → Reject / Rework
│               ├── Rework → กลับไปซ่อม
│               └── Scrap → บันทึกของเสีย → ต้นทุนเพิ่ม
│
└── Op.สุดท้าย: บรรจุ + ตรวจสอบขั้นสุดท้าย
        └── [NexStock] ← บันทึก Finished Goods เข้าคลัง
```

**ผู้รับผิดชอบ:** Operator, Production Supervisor, QC Inspector

---

### 🟥 LANE E: QC ขั้นสุดท้าย + ส่งมอบ

```
[NexProduce — Final QC]
        │
        ├── ตรวจสินค้าตาม Spec ลูกค้า
        ├── วัดขนาด / ทดสอบ Function / ถ่ายรูป
        ├── ออก QC Report + Certificate of Conformance
        │       └── [NexLess] ← จัดเก็บเอกสาร QC
        ├── [ผ่าน] → สินค้าพร้อมส่ง
        └── ออก Delivery Note + นัดส่งมอบ
                └── [NexSpeed] ← ถ้ามีรถส่งเอง
                    [NexSales] ← ลูกค้ามารับ / 3rd Party ขนส่ง
```

---

### 🟪 LANE F: ต้นทุนและการเงิน (คู่ขนาน)

```
[NexCost] — Job Costing (ต้นทุนต่อ Job)
        │
        ├── รับข้อมูล Actual จาก NexProduce:
        │       ├── วัตถุดิบที่เบิกจริง (จาก NexStock)
        │       ├── ชั่วโมงแรงงานจริง (จาก NexForce/Timesheet)
        │       └── Machine Time จริง (จาก NexAsset)
        ├── คำนวณ:
        │       ├── Standard vs Actual Variance
        │       └── กำไร/ขาดทุน ต่อ Job จริง
        └── [NexFinance] ← Journal Entry ต้นทุนการผลิต

[NexFinance] — เมื่อส่งมอบแล้ว
        ├── ออก Invoice ลูกค้า (ตาม SO)
        ├── [NexTax] ← ออก e-Tax Invoice ดิจิทัลส่งกรมสรรพากรพร้อมหัก VAT ขาย
        └── ติดตามเก็บเงิน (AR)
```

**ผู้รับผิดชอบ:** Cost Accountant, Finance

---

## 🔄 Flow ย่อ Make-to-Order (สรุป)

```
ลูกค้าส่ง Spec → [NexSales] Inquiry
        ↓ (คู่ขนาน)
[NexProduce] ประเมิน + [NexCost] คิดราคา
        ↓
Quotation ออก → ลูกค้าอนุมัติ → Sales Order
        ↓ (คู่ขนาน)
[NexProduce] Work Order + [NexProcure] ซื้อวัตถุดิบ
        ↓
Shop Floor: Op1 → QC → Op2 → ... → Final QC
        ↓ (บันทึก Actual ตลอด)
[NexCost] คำนวณต้นทุนจริง vs ที่ Quoted
        ↓
[NexStock] FG เข้าคลัง → ส่งมอบลูกค้า
        ↓
[NexFinance] Invoice + เก็บเงิน
        ↓
[NexBI] กำไร/ขาดทุนต่อ Job
```

---

---

# 🟡 Type 2: OEM / Contract Manufacturing (ผลิต Batch ใหญ่)

> **ลักษณะ:** ลูกค้ากำหนด Design, เราผลิตตาม Spec เป็น Batch ใหญ่ซ้ำๆ  
> **ตัวอย่าง:** OEM อิเล็กทรอนิกส์, เสื้อผ้า Fashion, บรรจุภัณฑ์พลาสติก, อาหารแบรนด์ลูกค้า  
> **ความซับซ้อน:** ต้องควบคุม Lot, Traceability สูง, มีมาตรฐาน ISO/GMP

---

## 📋 กระบวนการ OEM / Contract Mfg — End to End

---

### 🟦 LANE A: สัญญาและแผนการผลิต (Blanket Order)

```
ลูกค้า OEM ส่ง Forecast รายเดือน/ไตรมาส
        │
        ▼
[NexSales] — Contract Order
        ├── [NexSales] Blanket Order สร้างสัญญา OEM ล่วงหน้าและทยอย Pull เป็น Work Order ตามแผนการผลิต
        │       └── [NexLess] ← จัดเก็บสัญญา + NDA + Spec Sheet
        ├── กำหนด Delivery Schedule (ส่งสัปดาห์ไหน เดือนไหน)
        └── ส่งแผนให้ Production Planner

[NexProduce — Demand Planning]
        ├── รับ Forecast → วางแผนล่วงหน้า 1-3 เดือน
        └── [NexProduce] MRP / MPS คำนวณวัตถุดิบที่ต้องสั่งซื้อตามแผน Production อัตโนมัติ
```

---

### 🟩 LANE B: จัดซื้อวัตถุดิบล่วงหน้า (คู่ขนาน)

```
[NexProcure] — รับ MRP Plan จาก NexProduce
        │
        ├── [NexFinance] Multi-Currency + FX: ออก PO วัตถุดิบนำเข้าล่วงหน้าเป็นสกุลเงิน USD/EUR (ตาม Lead Time Vendor)
        ├── ติดตามการส่งมอบ Vendor
        ├── รับสินค้า (GR) + ตรวจคุณภาพวัตถุดิบ (Incoming QC)
        │       ├── [ผ่าน] → [NexStock] เข้าคลัง
        │       └── [ไม่ผ่าน] → Reject / Claim Vendor
        └── AP Invoice → [NexFinance]
```

---

### 🟡 LANE C: การผลิตเป็น Batch

```
[NexProduce — Batch Production]
        │
        ├── สร้าง Production Order ต่อ Batch
        │       ├── กำหนด Batch No. / Lot No.
        │       └── ระบุ FG ที่ต้องผลิต + จำนวน
        ├── เบิกวัตถุดิบ → [NexStock] (Backflush ตาม BOM)
        ├── การผลิตตาม Routing:
        │       ├── Op.1: Mix / ผสม / ตัด / ขึ้นรูป
        │       ├── Op.2: ประกอบ / ประกับ / อบ / ชุบ
        │       ├── Op.3: ตรวจสอบ (In-Process)
        │       └── Op.4: บรรจุ + ติด Label (OEM Label ลูกค้า)
        └── บันทึก Output จริงต่อ Batch
```

---

### 🟨 LANE D: QC ทุกขั้นตอน + Traceability

```
[NexProduce — QC Module]
        │
        ├── Incoming QC: ตรวจวัตถุดิบขาเข้า
        ├── In-Process QC: ตรวจระหว่างขั้นตอน
        │       └── บันทึกผล: ค่า Parameter, ภาพถ่าย
        ├── Final QC: ตรวจสินค้าสำเร็จรูปก่อนบรรจุ
        │       ├── AQL Sampling (ISO 2859)
        │       ├── ผลตรวจ: ขนาด, น้ำหนัก, ฟังก์ชัน
        │       └── ถ่ายรูปเก็บเป็นหลักฐานต่อ Batch
        └── [NexProduce] Lot / Batch Traceability:
                └── จาก Batch สินค้า → ย้อนกลับถึง:
                        ├── Lot วัตถุดิบที่ใช้
                        ├── เครื่องจักรที่ผลิต
                        └── สกิลของคนงานที่รับผิดชอบและตรวจสอบใบรับรองด้วย [NexForce] Skill Matrix + Certificate
```

**ผู้รับผิดชอบ:** QC Inspector, QC Manager

---

### 🟥 LANE E: บรรจุ + ส่งมอบตาม Schedule

```
[NexStock] Finished Goods
        │
        ├── บรรจุตาม OEM Label (ชื่อแบรนด์ลูกค้า)
        ├── บันทึก: Batch No, Mfg Date, Exp Date, จำนวน
        ├── จัดเตรียมตาม Delivery Schedule
        └── ส่งมอบ
                ├── [NexSpeed] รถบริษัทจัดส่ง
                └── ลูกค้าส่งรถมารับ → บันทึกใน [NexSales]

[NexSales / NexLess]
        ├── ออก Delivery Note + Lot Certificate
        └── [NexFinance] Invoice ตาม Delivery
```

---

### 🟪 LANE F: เครื่องจักร — ซ่อมบำรุง (คู่ขนาน ตลอดเวลา)

```
[NexMaint — Preventive Maintenance]
        │
        ├── PM Schedule ตามแผน (ทุกกี่ชม. / กี่วัน)
        ├── แจ้งเตือนล่วงหน้าก่อนถึงรอบ
        ├── Production Planner จัดเวลาหยุดเครื่อง (Downtime)
        │       └── [NexProduce] บันทึก Planned Downtime
        ├── ช่างรับ Work Order → ซ่อม / เปลี่ยนอะไหล่
        │       └── [NexProcure] ← เบิกอะไหล่ / ซื้ออะไหล่
        └── บันทึกต้นทุนซ่อม → [NexCost]

[NexProduce] OEE Dashboard / [NexIoT] IoT Integration
        ├── Machine Sensor รับส่งข้อมูล OEE Real-time เพื่อทำ Predictive Maintenance
        ├── Availability: เครื่องจักรพร้อมใช้ %
        ├── Performance: ความเร็วจริง vs มาตรฐาน %
        └── Quality: ของดี vs ทั้งหมด %
```

---

## 🔄 Flow ย่อ OEM (สรุป)

```
ลูกค้าส่ง Blanket Order → [NexSales] สัญญา
        ↓ (คู่ขนาน)
[NexProduce] Demand Plan → MRP
        ↓
[NexProcure] ซื้อวัตถุดิบล่วงหน้า
        ↓
Incoming QC → [NexStock] วัตถุดิบเข้าคลัง
        ↓
[NexProduce] สร้าง Batch Production Order
        ↓ (คู่ขนาน)
Shop Floor ผลิต + [NexMaint] ดูแลเครื่องจักร
        ↓
In-Process QC ทุกขั้นตอน + Lot Traceability
        ↓
Final QC → บรรจุ OEM Label → [NexStock] FG
        ↓
ส่งมอบตาม Schedule → [NexFinance] Invoice
        ↓
[NexCost] กำไร/ขาดทุนต่อ Batch + OEE Dashboard
```

---

---

# 🟢 Type 3: Tolling / แปรรูปวัตถุดิบ (ลูกค้าส่งวัตถุดิบมาให้)

> **ลักษณะ:** ลูกค้าส่งวัตถุดิบหรือสินค้ากึ่งสำเร็จมา เราทำการแปรรูปและส่งคืน  
> **ตัวอย่าง:** โรงสีข้าว (รับข้าวเปลือก → สีเป็นข้าวสาร), ชุบโลหะ, ย้อมผ้า, บรรจุ Liquid  
> **ความซับซ้อน:** ต้องแยกสต็อกของแต่ละลูกค้า, คิดค่าบริการตาม น้ำหนัก/ปริมาตร/เวลา

---

## 📋 กระบวนการ Tolling — End to End

---

### 🟦 LANE A: รับวัตถุดิบจากลูกค้า

```
ลูกค้าส่งวัตถุดิบมาที่โรงงาน
        │
        ▼
[NexStock] — Consigned Stock Mode รับวัตถุดิบเข้า
        │
        ├── ชั่งน้ำหนัก / วัดปริมาตร → บันทึก
        ├── ตรวจคุณภาพวัตถุดิบขาเข้า (สภาพ, ความชื้น, เกรด)
        │       └── QC Report ส่งให้ลูกค้าทราบ
        ├── แยก Location ต่อลูกค้า (ห้ามปะปน)
        └── ออก "ใบรับฝาก" → [NexLess] / [NexSales]
                └── ลูกค้าได้รับยืนยันการรับเข้าระบบ
```

**จุดสำคัญ:** สต็อกนี้เป็นของลูกค้า ไม่ใช่ของบริษัทเรา — แยก Account ชัดเจน

---

### 🟩 LANE B: วางแผนและเข้าคิวการผลิต

```
[NexProduce — Production Scheduling]
        │
        ├── รับ Job จากหลายลูกค้าพร้อมกัน
        ├── จัดลำดับคิว (Queue):
        │       ├── ตาม Priority (ด่วน / ปกติ)
        │       ├── ตามวันที่สัญญาส่งมอบ
        │       └── ตาม Batch Size ที่เหมาะสมของเครื่อง
        └── กำหนดวันเริ่มผลิต + เวลาที่ใช้
```

---

### 🟡 LANE C: กระบวนการแปรรูป

```
[NexProduce — Shop Floor]
        │
        ├── เบิกวัตถุดิบของลูกค้านั้นๆ ← [NexStock]
        ├── บันทึก: Lot ลูกค้า + เวลาเริ่ม
        ├── เดินกระบวนการแปรรูป
        │       ├── บันทึก Machine Time จริง
        │       ├── บันทึกพลังงาน / สารเคมีที่ใช้ (ถ้ามี)
        │       └── บันทึก Yield จริง (ได้กี่ % จากที่รับมา)
        └── [คู่ขนาน] QC ระหว่างและหลังกระบวนการ
                └── Temperature, Moisture, Spec ตามที่ลูกค้ากำหนด
```

---

### 🟨 LANE D: ส่งมอบสินค้าคืนลูกค้า

```
[NexStock] — สินค้าแปรรูปแล้ว
        │
        ├── แยก Location: สำเร็จรูป ต่อลูกค้า
        ├── รายงานให้ลูกค้าทราบว่าพร้อมรับได้
        ├── ลูกค้ามารับ / ส่งรถมารับ
        │       └── ชั่งน้ำหนัก / นับจำนวนขาออก
        └── ออก Delivery Note + Yield Report
                └── [NexLess] จัดเก็บ + ส่งให้ลูกค้า

[NexSales] — ออกบิลค่าแปรรูป
        ├── ค่าบริการ = น้ำหนักที่แปรรูป × ราคาต่อหน่วย
        │           หรือ = เวลาเครื่องจักรที่ใช้ × Rate
        └── [NexFinance] Invoice → เก็บเงิน
```

---

### 🟥 LANE E: วัตถุดิบของบริษัทเอง (สารเคมี/บรรจุภัณฑ์)

```
[คู่ขนาน — วัตถุดิบเสริมของเรา]
        │
        ├── [NexStock] ดูสต็อกสารเคมี/บรรจุภัณฑ์ที่ใช้
        ├── Low Stock → [NexProcure] สั่งซื้อ
        └── ต้นทุนวัตถุดิบเสริม → รวมใน Job Cost [NexCost]
```

---

## 🔄 Flow ย่อ Tolling (สรุป)

```
ลูกค้าส่งวัตถุดิบมา → [NexStock] รับ + ชั่ง + QC
        ↓
บันทึกเป็น Consigned Stock (แยกต่อลูกค้า)
        ↓
[NexProduce] จัดคิว + กำหนดวันผลิต
        ↓
Shop Floor แปรรูป → บันทึก Yield จริง + QC
        ↓
[NexStock] สินค้าพร้อมคืน ← Delivery Note
        ↓
ลูกค้ามารับ + ชั่งน้ำหนักขาออก
        ↓
[NexSales] คิดค่าแปรรูป → [NexFinance] Invoice
        ↓
[NexCost] ต้นทุนจริงต่อ Batch → กำไร Tolling Job
        ↓
[NexBI] Yield Rate / Throughput / กำไรต่อลูกค้า
```

---

---

# 🟠 Type 4: Make-to-Stock (ผลิตเก็บสต็อก + ขายเอง)

> **ลักษณะ:** ผลิตล่วงหน้าตาม Forecast เก็บสต็อก รอขายเมื่อได้รับ Order  
> **ตัวอย่าง:** อาหารแปรรูป, เครื่องสำอาง, อุปกรณ์ไฟฟ้า, ผลิตภัณฑ์ทำความสะอาด  
> **ความซับซ้อน:** ต้องทายยอดขายให้แม่น ไม่ผลิตมากไม่น้อยเกิน

---

## 📋 กระบวนการ Make-to-Stock — End to End

---

### 🟦 LANE A: วางแผนการผลิตล่วงหน้า (Demand Planning)

```
[NexBI + NexSales — Demand Forecast]
        │
        ├── วิเคราะห์ยอดขายย้อนหลัง (Historical Sales)
        ├── Seasonality: สินค้าขายดีช่วงไหน
        ├── Pipeline: คำสั่งซื้อที่รอยืนยัน
        └── กำหนด Production Forecast รายเดือน

[NexProduce — Master Production Schedule (MPS)]
        ├── ตั้งเป้าผลิตต่อสัปดาห์ ต่อเดือน
        ├── คำนวณ MRP: วัตถุดิบที่ต้องการทั้งหมด
        └── ส่งแผนให้ [NexProcure] จัดซื้อล่วงหน้า
```

---

### 🟩 LANE B: ผลิตตามแผน (คู่ขนาน)

```
[NexProduce — Production Orders] (Batch ต่อเนื่อง)
        │
        ├── Batch 1: วัตถุดิบพร้อม → เริ่มผลิต
        ├── Shop Floor Control:
        │       ├── Op.1 → Op.2 → Op.3 → บรรจุ
        │       ├── บันทึก Output จริงทุก Shift
        │       └── Scrap/Rework บันทึกทันที
        ├── QC ทุก Batch → Batch Release
        └── [NexStock] FG เข้าคลัง (ตาม Batch/Lot)

[คู่ขนาน]
        ├── [NexMaint] ดูแลเครื่องจักรไม่หยุด
        └── [NexProcure] ซื้อวัตถุดิบรอบถัดไปล่วงหน้า
```

---

### 🟡 LANE C: การขาย + ส่งมอบ (คู่ขนาน)

```
[NexSales] — Order Management
        │
        ├── Distributor / ร้านค้า สั่ง Order
        ├── ตรวจสต็อก ← [NexStock] Real-time
        ├── ยืนยัน Order + กำหนด Delivery Date
        └── [NexStock] Picking → จัดส่ง → [NexSpeed]

[NexPOS] — ถ้ามีหน้าร้าน / Showroom
        └── ขายปลีกตรง + ตัดสต็อก FG อัตโนมัติ
```

---

### 🟨 LANE D: จัดการ Batch/Lot + วันหมดอายุ (FEFO)

```
[NexStock] FEFO + Expiry Alert และ Lot Recall
        │
        ├── บันทึก Mfg Date + Exp Date ทุก Lot
        ├── FEFO: จ่ายสินค้าล็อตเก่าหรือหมดอายุก่อนออกก่อน
        ├── แจ้งเตือนสินค้าใกล้หมดอายุ (ล่วงหน้า X วัน)
        │       └── Sales Promotion / Recall
        └── [NexStock] Lot Recall: ถ้ามีปัญหาคุณภาพ
                └── ระบบแจ้ง Recall ฉุกเฉินเพื่อย้อนหาว่า Lot X ถูกส่งให้ลูกค้าใดไปแล้วบ้าง
```

---

### 🟥 LANE E: ต้นทุน + การเงิน + ภาษี

```
[NexCost — Standard Costing]
        │
        ├── ตั้ง Standard Cost ต่อหน่วย
        ├── เปรียบเทียบ Actual vs Standard ทุก Batch
        └── Variance Report: อะไรทำให้ต้นทุนเปลี่ยน

[NexFinance]
        ├── สต็อกสำเร็จรูปบันทึกเป็น Asset ในงบดุล
        ├── เมื่อขาย → โอนเป็น COGS
        ├── AR: เก็บเงินจาก Distributor
        └── AP: จ่ายเงิน Vendor วัตถุดิบ
```

---

## 🔄 Flow ย่อ Make-to-Stock (สรุป)

```
[NexBI] Dashboard Builder วางมุมมอง Yield/Scrap ให้ผู้บริหาร เพื่อวิเคราะห์ Demand
        ↓
[NexProduce] MPS + MRP
        ↓ (คู่ขนาน)
[NexProcure] ซื้อวัตถุดิบ → [NexStock]
        ↓
[NexProduce] Batch ผลิต → QC → [NexStock] FG
        ↓ (คู่ขนาน)
[NexMaint] ดูเครื่องจักร + [NexCost] ต้นทุน Standard
        ↓
[NexSales] Order เข้า → [NexStock] Picking (FEFO)
        ↓
[NexSpeed] จัดส่ง → [NexFinance] Invoice → เก็บเงิน
        ↓
[NexBI] กำไรต่อ SKU / OEE / Forecast Accuracy
```

---

---

# 🗺️ Master Integration Map (ธุรกิจรับจ้างผลิต)

```
                       [NexCore]
                   SSO / Role / Config
              ↙️         ↓         ↘️
       [NexForce]   [NexAsset]   [NexSales]
       พนักงาน/กะ   เครื่องจักร   CRM/Job Order
       Timesheet    รอบซ่อม       Quotation
           ↓            ↓            ↓
      [NexPayroll]  [NexMaint]  [NexApprove]
       เงินเดือน    ซ่อมบำรุง    อนุมัติงาน
                        │            │
                        ↓            ↓
               ┌──────────────────────────┐
               │       [NexProduce]       │
               │  Production Planning     │
               │  MPS / MRP               │
               │  Work Order / BOM        │
               │  Shop Floor Control      │
               │  QC / Traceability       │
               │  OEE Dashboard           │
               └──────────┬───────────────┘
                          │
           ┌──────────────┼──────────────┐
           ↓              ↓              ↓
     [NexProcure]    [NexStock]    [NexCost]
     จัดซื้อวัตถุดิบ   RM/WIP/FG    Job/Batch Cost
     Vendor Eval      FEFO          Variance
           │              │              │
           └──────────────┼──────────────┘
                          ↓
                   [NexFinance]
                   AR / AP / GL
                   Inventory Value
                          │
               ┌──────────┼──────────┐
               ↓          ↓          ↓
           [NexTax]  [NexPayroll]  [NexLess]
            ภาษี     เงินเดือน     เอกสาร QC
                                   สัญญา/Certificate

[NexSpeed]   ← ส่งสินค้า FG ให้ลูกค้า
[NexPortal]  ← Customer Portal ให้ลูกค้า OEM ตรวจสอบ Production Status, QC Report, และ Delivery Schedule
[NexApprove] ← อนุมัติ: Quotation, PO, Scrap Write-off
[NexAudit]   ← บันทึก Log ทุก Action
[NexBI]      ← Dashboard OEE / กำไร / Yield / Forecast
```

---

# ⚡ Trigger Events อัตโนมัติ — Manufacturing

| เหตุการณ์ | แอปต้นทาง | แอปปลายทาง | ผลที่ได้ |
|---|---|---|---|
| SO / Job Order ยืนยัน | NexSales | NexProduce | สร้าง Work Order อัตโนมัติ |
| Work Order สร้างแล้ว | NexProduce | NexStock | ตรวจสต็อกวัตถุดิบ + ขอ Reserve |
| วัตถุดิบไม่พอ | NexStock | NexProcure | สร้าง PR อัตโนมัติ |
| PO อนุมัติ | NexApprove | NexProcure | ส่ง PO Vendor |
| GR วัตถุดิบเข้า | NexProcure | NexStock | เพิ่มสต็อก + ตรวจ Incoming QC |
| เบิกวัตถุดิบ ← WO | NexProduce | NexStock | ตัดสต็อก RM |
| Output บันทึกแล้ว | NexProduce | NexStock | เพิ่ม WIP/FG |
| QC ผ่าน Final | NexProduce | NexStock | FG พร้อมขาย |
| ส่งมอบ FG แล้ว | NexStock/NexSpeed | NexFinance | ออก Invoice |
| เครื่องถึงรอบ PM | NexAsset | NexMaint | สร้าง Work Order ซ่อม |
| Unplanned Downtime | NexProduce | NexMaint + Alert | แจ้ง Supervisor ทันที |
| สต็อก FG เกิน Max | NexStock | NexProduce | หยุด/ชะลอ Production Order |
| สินค้าใกล้หมดอายุ | NexStock | NexSales | แจ้งให้ระบาย + โปรโมชัน |
| Payroll สิ้นเดือน | NexForce | NexPayroll | สรุปชั่วโมงแรงงาน |
| ทุก Transaction | ทุกแอป | NexBI + NexAudit | อัปเดต Dashboard + Log |

---

# 👤 ใครใช้แอปไหน — Manufacturing Business

| ตำแหน่ง | แอปหลัก | แอปรอง | Mobile |
|---|---|---|---|
| **MD / ผู้บริหาร** | NexBI | NexCost, NexFinance, NexApprove | ✅ Dashboard |
| **Sales / Account Mgr** | NexSales | NexSite, NexLess | ✅ ดู Job Status |
| **Production Planner** | NexProduce (Planning) | NexStock, NexProcure, NexBI | — Desktop |
| **Production Supervisor** | NexProduce (Shop Floor) | NexAsset, NexForce | ✅ Tablet หน้าพื้น |
| **Operator / คนงาน** | NexProduce (Scan/บันทึก) | — | ✅ สแกน QR |
| **QC Inspector** | NexProduce (QC Module) | NexLess | ✅ สแกน + ถ่ายรูป |
| **Warehouse / Store** | NexStock | NexProduce, NexProcure | ✅ สแกน Barcode |
| **Purchasing** | NexProcure | NexStock, NexApprove | ⚡ อนุมัติ |
| **Maintenance (ช่าง)** | NexMaint | NexAsset, NexProcure | ✅ Technician App |
| **Cost Accountant** | NexCost | NexFinance, NexProduce | — |
| **Finance / Accounting** | NexFinance | NexTax, NexPayroll | ⚡ อนุมัติ |
| **HR / Admin** | NexForce | NexPayroll, NexLearn | — |
| **ลูกค้า OEM/Tolling** | NexSite (Portal) | — | ✅ ดูสถานะ Job |

---

# 📊 KPI Dashboard สำหรับ Manufacturing

| KPI | คำนวณจาก | ความหมาย |
|---|---|---|
| **OEE %** (Overall Equipment Effectiveness) | NexProduce + NexAsset | ประสิทธิภาพเครื่องจักรรวม |
| **Yield Rate %** | NexProduce | ของดีได้กี่ % จากที่ผลิต |
| **Scrap Rate %** | NexProduce | ของเสียต่อ Production Order |
| **On-Time Delivery %** | NexSales + NexSpeed | ส่งตรงเวลาลูกค้ากี่ % |
| **Production Attainment %** | NexProduce | ผลิตได้ตามแผนกี่ % |
| **Capacity Utilization %** | NexProduce + NexAsset | ใช้กำลังผลิตเต็ม % ไหม |
| **Material Variance %** | NexCost | ใช้วัตถุดิบเกิน/น้อยกว่า Standard |
| **Labor Variance %** | NexCost + NexForce | ชั่วโมงแรงงานจริง vs Budget |
| **Downtime Hours** | NexMaint + NexAsset | เครื่องหยุดรวมกี่ชั่วโมงต่อเดือน |
| **Job Cost vs Quoted** | NexCost vs NexSales | กำไรจริง vs กำไรที่ Quoted |
| **Inventory Turnover (RM/FG)** | NexStock | สต็อกหมุนกี่รอบต่อเดือน/ปี |
| **Incoming Quality Rate %** | NexProduce (QC) | วัตถุดิบผ่าน QC กี่ % |
| **Rework Rate %** | NexProduce | งานที่ต้องแก้ไขต่อรอบ |
| **PM Compliance %** | NexMaint | ซ่อมบำรุงตามแผน vs ฉุกเฉิน |

---

# ⏱️ Timeline ตัวอย่าง — Job Shop (Make-to-Order)

```
วันที่ 1 ─── ลูกค้าส่ง Drawing + Spec มาขอราคา
             └── [NexSales] บันทึก Inquiry + [NexLess] แนบ Drawing

วันที่ 1-2 ── [NexProduce] Engineering ประเมิน:
              ├── BOM เบื้องต้น (วัตถุดิบ)
              └── Machine Time + Labor Hour ที่ต้องใช้
              [NexCost] คำนวณต้นทุน → กำหนดราคาขาย

วันที่ 2 ─── [NexSales] ส่ง Quotation → ลูกค้าพิจารณา

วันที่ 3 ─── ลูกค้าตกลง → Sales Order (Job Order)
             └── [NexProduce] สร้าง Work Order

วันที่ 3-4 ── [NexStock] ตรวจวัตถุดิบ
              └── ขาด: [NexProcure] สั่งซื้อ PO ด่วน

วันที่ 5 ─── วัตถุดิบมาถึง → เข้าคลัง [NexStock]

วันที่ 5 ─── [NexProduce] เริ่ม Shop Floor
              ├── Op.1: ตัด/กลึง → บันทึก Output
              └── In-Process QC: ผ่าน ✅

[คู่ขนาน] ── [NexMaint] ตรวจสภาพเครื่อง → OK

วันที่ 6 ─── Op.2: เจาะ/ประกอบ
              └── Rework: 2 ชิ้นต้องแก้ไข → กลับซ่อม

วันที่ 7 ─── Op.3: ชุบ/พ่นสี/ขัดเงา
              Final QC: ผ่านทุกชิ้น ✅
              [NexStock] FG เข้าคลัง

วันที่ 7 ─── ลูกค้ามารับสินค้า
              [NexSales] ออก Delivery Note
              [NexFinance] ออก Invoice → ส่ง Email

วันที่ 7 ─── [NexCost] สรุปต้นทุน Job จริง:
              ├── วัตถุดิบจริง: XXX บาท
              ├── แรงงานจริง: XXX บาท
              ├── Machine Time: XXX บาท
              └── กำไร/ขาดทุนจริง vs Quoted: +/- XXX %
```

---

# ⏱️ Timeline ตัวอย่าง — OEM Batch (ครบวงจรรายเดือน)

```
ต้นเดือน ─── ลูกค้า OEM ส่ง Monthly Forecast
              └── [NexProduce] MPS + MRP คำนวณวัตถุดิบ 1 เดือน

สัปดาห์ 1 ─  [NexProcure] ออก PO ทั้งหมด → Vendor
              [คู่ขนาน] [NexMaint] PM เครื่องจักรก่อนเริ่ม Batch

สัปดาห์ 1-2 ─ วัตถุดิบทะยอยมาถึง
               Incoming QC → [NexStock] เข้าคลัง

สัปดาห์ 1-4 ─ [NexProduce] Batch 1, 2, 3, 4 ผลิตต่อเนื่อง
               ├── Shop Floor: 3 Shift ต่อวัน
               ├── In-Process QC: บันทึกทุก Batch
               └── [NexCost] บันทึก Actual ต่อเนื่อง

สัปดาห์ 2 ─── ส่งมอบ Batch 1 ตาม Delivery Schedule
               └── [NexFinance] Invoice ส่ง Email ลูกค้าทันที

สัปดาห์ 3 ─── ส่งมอบ Batch 2
สัปดาห์ 4 ─── ส่งมอบ Batch 3 + Batch 4

สิ้นเดือน ─── [NexPayroll] เงินเดือน + ค่ากะพนักงานผลิต
              [NexCost] Monthly Report:
               ├── OEE เฉลี่ยเดือนนี้: XX%
               ├── Yield Rate: XX%
               └── กำไรต่อ Batch: XX บาท
              [NexBI] Dashboard: Production vs Plan, กำไร, Downtime
```

---

# 🏗️ แผนการพัฒนา (Priority สำหรับ Manufacturing)

| Phase | แอป | สิ่งที่ได้ทันที |
|---|---|---|
| **Phase 0** | NexCore | SSO, Role, Permission พร้อม |
| **Phase 1** | NexProduce, NexStock, NexForce | ระบบผลิต + คลัง + HR พื้นฐาน |
| **Phase 2** | NexSales, NexProcure, NexFinance | รับ Job + จัดซื้อ + บัญชีครบ |
| **Phase 2** | NexCost | ต้นทุน Job/Batch ชัดเจน |
| **Phase 3** | NexAsset, NexMaint | เครื่องจักรไม่หยุดกะทันหัน |
| **Phase 3** | NexTax, NexPayroll, NexApprove | ภาษีถูกต้อง + เงินเดือน + Workflow |
| **Phase 4** | NexBI, NexSite, NexLess, NexAudit | Dashboard + Portal ลูกค้า + เอกสาร |

---

---

_เอกสารจัดทำโดย: NexOne Development Team_  
_กรณีศึกษา: ธุรกิจรับจ้างผลิต (Make-to-Order / OEM / Tolling / Make-to-Stock)_  
_ปรับปรุงล่าสุด: April 2026_

---

## 🎯 สรุปฟีเจอร์หลักที่ต้องพัฒนา (Master Plan)
รายการฟีเจอร์ด้านล่างคือ **Gap Features** ที่ต้องพัฒนาเข้าสู่ระบบ NexOne เพื่อให้รองรับธุรกิจ Manufacturing (โรงงานผลิต) ได้อย่างสมบูรณ์:

### 1. ฟีเจอร์หลัก (Core Extensions)
- **Blanket Order / Framework Contract (NexSales)**: สั่งซื้อล่วงหน้า ทยอยส่งของ
- **MRP / MPS (NexProduce)**: คำนวณวัตถุดิบและวางแผนจาก Forecast
- **BOM & Routing (NexProduce)**: สูตรการผลิต และ ลำดับสถานีงาน
- **Shop Floor Control (NexProduce)**: QR บันทึกงานบนสายพานการผลิต
- **QC Module (NexProduce)**: ตรวจสอบคุณภาพ และ บันทึกของเสีย
- **Lot / Batch Traceability (NexProduce)**: แกะรอยล็อตวัตถุดิบและสินค้า
- **OEE Dashboard (NexProduce)**: วิเคราะห์ประสิทธิภาพเครื่องจักร
- **Lot Recall (NexStock)**: เรียกคืนสินค้ากรณีมีปัญหา
- **Consigned Stock Mode (NexStock)**: คลังฝากขาย หรือ คลังวัตถุดิบของลูกค้า
- **FEFO Management & Expiry Alert (NexStock)**: ตัดสต็อกตามอายุสำหรับงานอาหารอุตสาหกรรม
- **Skill Matrix + Certification (NexForce)**: ตรวจสอบความพร้อมพนักงานรายวัน

### 2. ฟีเจอร์ข้ามแอป (Cross-cutting)
- **Customer Portal Login (NexPortal)**: ลูกค้า B2B ดูสถานะการผลิต
- **3-Way Matching (NexFinance)**: สำหรับแผนกจัดซื้อชิ้นส่วน
- **e-Tax Invoice (NexTax)**: การวางบิลอัตโนมัติ

