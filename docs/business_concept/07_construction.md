# 🏗️ NexOne Platform — คู่มือสำหรับธุรกิจก่อสร้าง (Construction)

**Document Version:** 1.0 | **Date:** April 2026
**Path:** `docs/business_concept/07_construction.md`

---

## 🏢 ประเภทธุรกิจที่ครอบคลุม

| # | ประเภท | ลักษณะธุรกิจ | ตัวอย่าง |
|---|---|---|---|
| **Type 1** | **รับเหมาก่อสร้างทั่วไป** | รับงานก่อสร้างอาคาร ตามสัญญาโครงการ | บ้าน, อาคาร, โรงงาน |
| **Type 2** | **งานระบบ / MEP** | ไฟฟ้า, ประปา, แอร์, อัคคีภัย | Electrical, Plumbing, HVAC |
| **Type 3** | **รับเหมาช่วง (Subcontractor)** | รับงานช่วงจาก Main Contractor | Work Package เฉพาะ |
| **Type 4** | **Design & Build** | ออกแบบ + ก่อสร้าง ในองค์กรเดียว | Turnkey Project |

---

## ⚙️ STEP 0 — ตั้งค่าระบบ

```
NexCore:
├── ลงทะเบียนบริษัท
├── Role: MD, Estimator, PM, Site Engineer, Foreman, QC, Purchasing, Finance
└── Multi-Project: แต่ละโครงการแยกข้อมูล

NexSales:
├── Service Catalog: ประเภทงานก่อสร้าง
├── Rate Card: ราคา BOQ ต่อหน่วย
└── Document Template: ใบเสนอราคา BOQ, สัญญา

NexProduce:
├── WBS (Work Breakdown Structure) ต่อ Project
├── Milestone และ % งาน
└── Resource Planning

NexForce:
├── พนักงานประจำ + แรงงานรายวัน
├── กะหน้างาน
└── Timesheet ต่อ Project/Phase

NexAsset:
├── เครื่องจักร: รถแบ็คโฮ, ปั้นจั่น, Generator
├── อุปกรณ์ก่อสร้าง
└── Depreciation ต่อเครื่อง
```

---

## 🔵 Type 1: รับเหมาก่อสร้างทั่วไป

### LANE A: ประมูล → ชนะงาน → เซ็นสัญญา

```
เจ้าของโครงการแจก TOR / ชวนประมูล
        │
        ▼
[NexSales — Bid Management]
        ├── รับ TOR + แบบก่อสร้าง → [NexLess] Document Control (บริหารแบบก่อสร้าง Version ล่าสุด)
        ├── ทำ BOQ (Bill of Quantities):
        │       ├── ถอดแบบ: ปริมาณวัสดุแต่ละรายการ
        │       └── ราคาต่อหน่วย × ปริมาณ = BOQ รวม
        ├── [NexCost] คำนวณต้นทุน:
        │       ├── Material Cost (วัสดุ)
        │       ├── Labor Cost (แรงงาน)
        │       ├── Equipment Cost (เครื่องจักร)
        │       └── Overhead + Profit Margin
        ├── ออก Quotation/ใบเสนอราคา → [NexApprove] วิ่งผ่าน Approval Workflow อนุมัติ
        ├── ยื่นซอง → ชนะประมูล
        └── เซ็นสัญญา → [NexLess] สัญญา + Bond

[NexProduce — สร้าง Project และ WBS]
        ├── WBS: แบ่งงานเป็น Phase/Work Package
        ├── Timeline: บริหารผ่าน Gantt Chart และ Critical Path
        └── Resource Assignment
```

**ผู้รับผิดชอบ:** Estimator, MD, PM

---

### LANE B: วางแผนและจัดซื้อวัสดุ (คู่ขนาน)

```
[NexProduce → NexProcure — Material Planning]
        │
        ├── Material Request (MR): หน้าไซต์ขอวัสดุดึงข้อมูลเข้าส่วนกลาง
        ├── Material Schedule: วัสดุไหน ต้องเมื่อไหร่
        ├── [NexProcure] ออก PO วัสดุตาม Schedule (รองรับ Multi-Currency กรณีนำเข้าวัสดุต่างประเทศ)
        │       ├── Vendor: ซิเมนต์, เหล็ก, อิฐ, ทราย
        │       └── [NexApprove] อนุมัติ PO ตามวงเงินผ่าน Approval Workflow Builder
        ├── ส่งวัสดุไป Site → [NexStock] บันทึกรับเข้า (Goods Receipt)
        └── [NexFinance] AP Invoice Vendor → ทำ 3-Way Matching (PO + GR + Invoice)

[NexProcure — Sub-contractor Management]
        ├── RFQ ส่ง Sub ที่สนใจ
        ├── เลือก Sub → สัญญาจ้างเหมาช่วง
        ├── [NexLess] สัญญา Sub
        └── เลื่อนการจ่ายเงินตาม Milestone การทำงานตรวจรับของ Sub-contractor
```

**ผู้รับผิดชอบ:** Purchasing, PM

---

### LANE C: ก่อสร้างหน้างาน — Shop Floor (คู่ขนาน)

```
[NexProduce — Construction Progress ผ่าน NexField]
        │
        ├── รายวัน: Site Engineer / Foreman อัปเดตผ่าน Mobile App (NexField):
        │       ├── % งาน Complete ต่อ Activity → ซิงก์เข้าระบบ Customer Portal (NexPortal) ให้ลูกค้าดู
        │       ├── วัสดุที่ใช้ไปวันนี้ → [NexStock] ตัด
        │       ├── GPS Check-in/out → หน้าไซต์ลงเวลาด้วย GPS ป้องกัน Ghost Attendance
        │       ├── แรงงานวันนี้กี่คน → [NexForce] Timesheet ต่อ Project สำหรับเก็บค่าแรง (Labor Cost)
        │       └── Daily Photo Log → [NexLess] (แนบเข้าระบบ Document Control อัตโนมัติ)
        ├── เบิกวัสดุจากคลัง Site ← [NexStock]
        │       └── บันทึก Cost ต่อ Work Package
        ├── เครื่องจักรเข้า-ออก Site ← [NexAsset] Equipment Tracking บนแผนที่และคุมเวลาใช้งาน
        └── แจ้งปัญหา: RFI / Change Order → [NexApprove] ยิงเข้า Approval Workflow
```

**ผู้รับผิดชอบ:** Site Engineer, Foreman, Operator

---

### LANE D: QC / ตรวจงาน (คู่ขนาน)

```
[NexProduce — QC Inspection ผ่าน NexField]
        │
        ├── Inspection Checklist ต่อ Work Package (เปิดเช็คใน Mobile)
        ├── QC Inspector ตรวจ:
        │       ├── งานฐานราก: ขนาด, เหล็ก, Slump Test
        │       ├── งานคอนกรีต: Mix Design, Curing
        │       └── งานสถาปัตย์: ฉาบ, ทาสี, วัสดุตกแต่ง
        ├── ตรวจพบข้อบกพร่อง → บันทึก Defect Punch List พร้อมแนบรูปถ่าย
        ├── [ผ่าน] → เจ้าของ Sign → เบิกงวดเงิน
        └── [ไม่ผ่าน] → ติดตามแก้ไขจากลิสต์ Defect → ตรวจซ้ำ
```

---

### LANE E: เบิกเงินงวด + การเงิน

```
[NexSales + NexFinance — Progress-based Billing]
        │
        ├── งานเสร็จตาม Milestone/งวด
        ├── ยื่น "ใบขอเบิกเงิน" (Payment Application)
        │       ├── % งานจริงที่เสร็จ × มูลค่าสัญญา
        │       └── หักเงินประกันผลงาน (Retention Management)
        ├── เจ้าของตรวจรับ → ออก Invoice → ออก e-Tax Invoice ดิจิทัลส่งกรมสรรพากร (NexTax)
        ├── รับเงิน → [NexFinance] AR
        └── Retention Release: หลังงานแล้วเสร็จสิ้น คืนเงินประกันตามระยะเวลา

[NexCost — Budget vs Actual / Job Cost Tracking]
        ├── ต้นทุนจริงสะสมต่อ Project วิ่งชนงบ Estimate แบบ Real-time
        ├── Earned Value Management (EVM):
        │       ├── Planned Value vs Earned Value vs Actual Cost
        │       └── CPI (Cost Performance Index) + SPI (Schedule Performance)
        └── Notification Engine: จ่าย Alert แจ้งเตือนเมื่อต้นทุนเกิน Budget หรือ Schedule ล่าช้า
```

**ผู้รับผิดชอบ:** PM, Finance, MD

---

## 🟢 Type 2: งานระบบ MEP

```
[เพิ่มเติมจาก Type 1]
        │
        ├── [NexStock] สต็อกอุปกรณ์เฉพาะ:
        │       ├── Electrical: Switchboard, Cable, DB
        │       ├── Plumbing: ท่อPVC, Fitting, วาล์ว
        │       └── HVAC: Chiller, AHU, Duct
        ├── [NexAsset] อุปกรณ์ทดสอบ: Megger, Flow Meter
        └── As-Built Drawing → [NexLess] Handover Package
```

---

## 🟠 Type 4: Design & Build

```
[NexProduce — Phase 1: Design]
        ├── Architect / Engineer ทำงาน
        ├── Timesheet ต่อ Design Phase ← [NexForce]
        ├── [NexCost] ต้นทุน Design (Man-hour × Rate)
        └── ส่งแบบให้ลูกค้าอนุมัติ → [NexLess]

[NexProduce — Phase 2: Construct]
        └── ดำเนินการตาม Type 1
```

---

## 🔄 Flow ย่อ Construction

```
ประมูล → [NexSales] BOQ + [NexCost] คำนวณต้นทุน
        ↓
ชนะ → เซ็นสัญญา → [NexProduce] สร้าง Project + WBS
        ↓ (คู่ขนาน)
[NexProcure] Material + Sub + [NexAsset] เครื่องจักร
        ↓
Site Work: Progress + Timesheet + Material ← NexProduce/Stock/Force
        ↓ (คู่ขนาน)
QC แต่ละ Phase + [NexFinance] เบิกงวดเงิน
        ↓
ก่อสร้างเสร็จ → Handover → Defect Warranty Period
        ↓
[NexCost] EVM Report: ต้นทุนจริง vs Budget
[NexBI] กำไรต่อ Project + ประสิทธิภาพทีม
```

---

## ⚡ Trigger Events อัตโนมัติ

| เหตุการณ์ | แอปต้นทาง | แอปปลายทาง | ผล |
|---|---|---|---|
| Milestone เสร็จ + QC ผ่าน | NexProduce | NexFinance | ออก Invoice เบิกงวด + e-Tax Invoice |
| วัสดุใน Site ต่ำกว่า Min | NexStock | NexProcure | สร้าง Material Request (MR) หรือ PR อัตโนมัติ |
| ต้นทุน > Budget X% หรือ PO เกินวงเงิน | NexCost/NexProcure | Notification Engine | จ่าย Alert แจ้งเตือน PM + MD ทันที |
| Schedule ช้ากว่าแผน X วัน | NexProduce | Notification Engine | แจ้งเตือนความล่าช้าให้ลูกค้าบน NexPortal และผู้บริหาร |
| PM เครื่องจักรถึงรอบ | NexAsset | NexMaint | Work Order ซ่อมบำรุงผ่าน Equipment Tracking |
| Change Order ต้องการอนุมัติ | NexProduce | NexApprove | วิ่งเข้า Approval Workflow Builder |
| สัญญา Retention ครบกำหนด | NexSales | NexFinance | เรียกเก็บ / คืน Retention |

---

## 📊 KPI Dashboard Construction

โดยข้อมูลทั้งหมดจะถูกดึงไปแสดงผลผ่านทาง **Dashboard Builder (NexBI)**

| KPI | ความหมาย |
|---|---|
| **Cost Performance Index (CPI)** | Earned Value / Actual Cost (>1 = ดี) |
| **Schedule Performance Index (SPI)** | Earned Value / Planned Value (>1 = ตรงเวลา) |
| **Budget Variance %** | งบเกิน/น้อยกว่าแผน |
| **On-Time Delivery %** | โครงการส่งมอบตรงเวลา |
| **Material Waste %** | วัสดุเหลือทิ้ง vs ที่สั่งซื้อ |
| **Defect Rate (Punch List)** | จำนวน Defect ต่อโครงการ |
| **Claim Rate** | อัตราการเคลมประกัน / เคลมงานคืน |
| **Cost per Sqm** | ราคาเฉลี่ยต่อตารางเมตรของโครงการ |
| **Cash Flow** | เงินสด vs ค่าใช้จ่ายที่ต้องจ่าย |
| **Safety Incidents** | อุบัติเหตุหน้างาน |
| **Sub Performance** | คุณภาพและเวลาของ Sub แต่ละราย |

---

## 👤 ใครใช้แอปไหน

| ตำแหน่ง | แอปหลัก | Mobile |
|---|---|---|
| MD / Director | NexBI (Dashboard Builder), NexApprove | ✅ Dashboard / อนุมัติออนไลน์ |
| ลูกค้า (Client) | NexPortal (Customer Portal) | ✅ ดู Progress, รูปไซต์งาน, อนุมัติแบบ |
| Estimator | NexSales, NexCost | — |
| Project Manager | NexProduce (WBS/Gantt), NexCost | ✅ ดูงบ / แผนงาน |
| Site Engineer | NexProduce, NexField | ✅ Site App (Progress, วันทำงาน) |
| Foreman | NexProduce, NexField | ✅ Site App (Daily Log, MR) |
| QC Inspector | NexProduce (Defect), NexField | ✅ ถ่ายรูปหน้าไซต์, Punch List |
| Purchasing | NexProcure, NexStock | — |
| Finance | NexFinance (3-Way Matching), NexTax | — |
| Warehouse/Site Store | NexStock | ✅ สแกนรับของ / เบิกจ่าย |
| แรงงาน / ຊ่าง | NexForce | ✅ GPS Check-in หน้าไซต์ |

---

_NexOne Development Team | Construction Business Concept | April 2026_

---

## 🎯 สรุปฟีเจอร์หลักที่ต้องพัฒนา (Master Plan)
รายการฟีเจอร์ด้านล่างคือ **Gap Features** ที่ต้องพัฒนาเข้าสู่ระบบ NexOne เพื่อให้รองรับธุรกิจ Construction (รับเหมาก่อสร้าง) ได้อย่างสมบูรณ์:

### 1. ฟีเจอร์หลัก (Core Extensions)
- **WBS & Gantt Chart (NexProduce)**: บริหารโมดูลก่อสร้างแบบเจาะลึก 
- **Defect Punch List (NexProduce)**: บันทึกตำหนิก่อนเซ็นรับงาน
- **Progress-based Billing (NexFinance)**: เบิกเงินตามงวดความคืบหน้าก่อสร้าง
- **Retention Management (NexFinance)**: บริหารบัญชีหักเงินประกันผลงาน (ทั้งฝั่งรับและจ่าย)
- **Budget vs Actual Tracking (NexCost)**: เช็คยอดงบประมาณตลอดเวลา
- **Material Request (MR) (NexProcure)**: โฟร์แมนขอเบิกวัสดุจากไซต์
- **Sub-contractor Management (NexProcure)**: บริหารผู้รับเหมาช่วง
- **Drawing & Document Control (NexLess)**: บริหารแบบพิมพ์เขียว
- **Equipment Tracking (Map base) (NexAsset)**: ตามรอยเครื่องจักรหนักว่าอยู่ไซต์ใด
- **Timesheet per Project (NexForce)**: โอน Labor Cost เข้าโครงการ
- **GPS Check-in (NexForce)**: พนักงานประจำไซต์เช็คอิน

### 2. ฟีเจอร์ข้ามแอป (Cross-cutting)
- **Mobile App - Site / Foreman (NexField)**: แอปเบิกของหน้าไซต์ส่งให้ส่วนกลาง
- **Customer Portal Login (NexPortal)**: ผู้ว่าจ้างเข้ามาตรวจเช็คความคืบหน้า
- **3-Way Matching (NexFinance)**: ป้องกันปัญหาการสั่งซื้อของเกิน
- **e-Tax Invoice (NexTax)**: ออกเอกสารรับชำระ

