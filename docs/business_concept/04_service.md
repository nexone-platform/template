# 🎯 NexOne Platform — คู่มือสำหรับธุรกิจการบริการ (Service Business)

**Document Version:** 1.0 | **Date:** April 2026  
**เป้าหมาย:** แสดงกระบวนการทำงานของธุรกิจบริการแต่ละประเภท  
และการเชื่อมโยงระหว่างแอปใน NexOne Platform ตั้งแต่เริ่มจนจบ

---

## 🏢 ประเภทธุรกิจที่ครอบคลุม

| # | ประเภท | ลักษณะธุรกิจ | ตัวอย่างอุตสาหกรรม |
|---|---|---|---|
| **Type 1** | **Professional Services / ที่ปรึกษา** | ขายความรู้และเวลา โดยคิดเป็น Man-Day/Project | IT Consulting, กฎหมาย, บัญชี, วิศวกรรม |
| **Type 2** | **After-Sales / Field Service / ซ่อมบำรุง** | รับแจ้งซ่อม ส่งช่างออกพื้นที่ | ซ่อมแอร์, ลิฟต์, IT Support, เครื่องจักร |
| **Type 3** | **Retainer / บริการรายเดือน** | คิดค่าบริการรายเดือนแบบ Subscription | รปภ., แม่บ้าน, Facility Mgt, Outsource |
| **Type 4** | **Hospitality / Beauty / Wellness** | นัดหมายและให้บริการ ณ สถานที่ | โรงแรม, สปา, คลินิก, ร้านเสริมสวย |

---

## ⚙️ STEP 0 — ตั้งค่าระบบก่อนเริ่มใช้งาน (ทำครั้งเดียว)

> **ผู้รับผิดชอบ:** IT Admin / ผู้บริหาร / Operations Manager

```
┌──────────────────────────────────────────────────────────────────┐
│  NexCore — ตั้งค่ากลาง                                           │
│  ├── ลงทะเบียนบริษัท / ข้อมูลผู้ให้บริการ                        │
│  ├── กำหนด Role & Permission                                     │
│  │     ├── MD / ผู้บริหาร         → ดูทุกอย่าง + Approve         │
│  │     ├── Sales / Account Mgr   → Proposal, สัญญา, CRM          │
│  │     ├── Project Manager       → จัดทีม, ติดตามงาน, Milestone  │
│  │     ├── Consultant / Technician → บันทึกชั่วโมงงาน, รายงาน   │
│  │     ├── Field Service / ช่าง  → รับ Job, บันทึกผลซ่อม         │
│  │     ├── Scheduler / Dispatcher → จัดตารางงาน + ทีม           │
│  │     ├── Finance / Accounting  → Invoice, เก็บเงิน             │
│  │     └── HR / Admin            → พนักงาน, กะ, OT               │
│  └── SSO — พนักงานทุกคน Login แอปเดียวกัน                        │
│                                                                  │
│  NexForce — ข้อมูลพนักงาน                                        │
│  ├── Profile ผู้ให้บริการ: Skill, Certificate, ใบอนุญาต           │
│  ├── กะทำงาน / Availability Calendar                             │
│  ├── บันทึกชั่วโมงงาน (Timesheet) ต่อ Project/Job                │
│  └── OT / สวัสดิการสำหรับช่างในสนาม                              │
│                                                                  │
│  NexSales — ตั้งค่าฝ่ายขาย                                       │
│  ├── Service Catalog (รายการบริการ + ราคา)                        │
│  ├── Rate Card (Man-Day Rate ต่อ Skill Level)                    │
│  ├── ลูกค้า Master Data + เครดิต                                  │
│  └── Template Proposal / Quotation                               │
│                                                                  │
│  NexAsset — ครุภัณฑ์ + อุปกรณ์                                   │
│  ├── อุปกรณ์ของช่าง/Consultant (Laptop, เครื่องมือ)              │
│  ├── ยานพาหนะสำหรับออก Site                                      │
│  └── อุปกรณ์ที่ติดตั้งที่ลูกค้า (ต้องดูแลรักษา)                   │
└──────────────────────────────────────────────────────────────────┘
```

---

---

# 🔵 Type 1: Professional Services / ที่ปรึกษา

> **ลักษณะ:** "ขายเวลา" — รายได้มาจาก Man-Day/Hour หรือ Fixed-Price Project  
> **ตัวอย่าง:** IT Consulting, Software Development, กฎหมาย, บัญชี/ตรวจสอบ, วิศวกรรม  
> **ความซับซ้อน:** บริหาร Utilization ของทีม, ติดตาม Project Progress, Billing ตาม Milestone

---

## 📋 กระบวนการ Professional Services — End to End

---

### 🟦 LANE A: ฝ่ายขาย — Proposal จนถึงเซ็นสัญญา

```
ลูกค้ามีความต้องการ / ขอ Proposal
        │
        ▼
[NexSales] CRM Pipeline / Sales Funnel
        ├── บันทึก Opportunity / Prospect และติดตาม Lead อย่างเป็นระบบ
        ├── Discovery Meeting → เข้าใจ Pain Point ลูกค้า
        ├── จัดทำ Proposal / Scope of Work (SOW)
        │       ├── กำหนด Deliverables ที่จะส่งมอบ
        │       ├── Timeline และ Milestone
        │       ├── Man-Day ที่ใช้ × Rate = ราคา
        │       └── Terms & Conditions
        ├── [NexLess] ← จัดเก็บ Proposal + NDA + สัญญา
        ├── เจรจา → [NexApprove] Approval Workflow สำหรับให้ผู้บริหารอนุมัติส่วนลด หรือเงื่อนไขสัญญา
        └── ลูกค้าเซ็นสัญญา → สร้าง Project
```

**ผู้รับผิดชอบ:** Account Manager, Business Development, MD

---

### 🟩 LANE B: จัดทีมและวางแผนงาน (Production Planning)

```
[NexProduce] Project Board (WBS + Gantt)
        │
        ├── สร้าง Project ใน System
        │       ├── Project Name, Client, Budget, Deadline
        │       └── Milestone 1, 2, 3 ... N
        ├── จัดทีม (Resource Allocation)
        │       ├── ดู Availability ทีม ← [NexForce] Calendar
        │       ├── จับคู่ Skill ที่ต้องการ vs มี
        │       └── แจ้ง Consultant ว่าถูก Assign งาน
        ├── วาง Work Breakdown Structure (WBS)
        │       ├── แบ่ง Task → Assign คน + ระยะเวลา
        │       └── กำหนด Dependencies
        └── Kick-off Meeting → เริ่มงาน
```

**ผู้รับผิดชอบ:** Project Manager

---

### 🟡 LANE C: ปฏิบัติงาน + บันทึกชั่วโมง (คู่ขนาน)

```
[Consultant / Specialist — Daily Work]
        │
        ├── รับ Task → ทำงาน → บันทึก Timesheet
        │       └── [NexForce] Timesheet ต่อ Project/Job (Billable Hours) ← บันทึก:
        │               ├── วันที่, Project, Task, ชั่วโมง
        │               └── หมายเหตุ: ทำอะไรไปบ้าง
        ├── ส่ง Deliverable ตาม Milestone
        │       ├── Document, Report, Code, Design
        │       └── [NexLess] ← จัดเก็บทุก Deliverable
        ├── [ถ้า On-site] → ใช้ GPS Check-in ที่ลูกค้า
        └── อัปเดตสถานะ Task → [NexProduce/Project Board]

[Project Manager — คู่ขนาน ตลอดเวลา]
        ├── ติดตาม % Complete ต่อ Milestone
        ├── Risk Management: แจ้งถ้าง่วงเวลา
        ├── รายงาน Status ให้ลูกค้า (Weekly/Monthly)
        └── [NexPortal] Customer Portal ให้ลูกค้า Login ดูความคืบหน้า, ส่งอัปเดตงาน, อนุมัติเอกสารและดาวน์โหลดรายงาน
```

**ผู้รับผิดชอบ:** Consultant, Analyst, Developer, Engineer

---

### 🟨 LANE D: Billing ตาม Milestone / เดือน

```
[NexSales + NexForce → NexFinance]
        │
        ├── [NexFinance] Progress Billing (แบ่งจ่าย): กรณี Fixed-Price + Milestone:
        │       ├── Milestone 1 เสร็จ → ออก Invoice ส่วนที่ 1
        │       ├── Milestone 2 เสร็จ → ออก Invoice ส่วนที่ 2
        │       └── [NexApprove] ← PM อนุมัติว่า Deliverable OK
        │
        ├── กรณี T&M (Time & Material):
        │       ├── ดึง Timesheet จาก [NexForce] ทุกเดือน
        │       ├── คำนวณ: ชั่วโมงจริง × Rate
        │       ├── แนบ Timesheet รายละเอียด
        │       └── ส่ง Invoice พร้อมรายงาน
        │
        ├── [NexFinance] Invoice → ส่ง Email ลูกค้าอัตโนมัติ
        ├── ติดตามเก็บเงิน (AR)
        └── [NexTax] ← หัก ณ ที่จ่าย (ภ.ง.ด.3/53) + ส่ง e-Tax Invoice ดิจิทัลให้กรมสรรพากร + VAT

[NexCost — Project Profitability]
        ├── ต้นทุน: Salary + OT + ค่าเดินทาง + Software
        └── กำไร/ขาดทุน ต่อ Project จริง
```

**ผู้รับผิดชอบ:** Finance, Project Manager

---

### 🟥 LANE E: ปิด Project + Customer Satisfaction

```
[Project Closure]
        │
        ├── Final Deliverable ส่งมอบครบ
        ├── ลูกค้า Sign-off / Acceptance
        │       └── [NexLess] ← จัดเก็บ Acceptance Document
        ├── Invoice งวดสุดท้าย → [NexFinance]
        ├── Lessons Learned Meeting
        ├── [NexSales] CSAT Survey ส่งแบบสอบถามความพึงพอใจอัตโนมัติให้ลูกค้า
        │       └── [NexSales] บันทึก Feedback
        └── Follow-up Opportunity ต่อ (Upsell / Renewal)
```

---

## 🔄 Flow ย่อ Professional Services

```
Opportunity → [NexSales] Proposal
        ↓
เซ็นสัญญา → [NexLess] จัดเก็บ
        ↓ (คู่ขนาน)
[NexProduce] จัดทีม + WBS + [NexForce] Availability
        ↓
ทีมทำงาน + บันทึก Timesheet [NexForce] ทุกวัน
        ↓ (คู่ขนาน)
Deliverable ส่ง [NexLess] + PM ติดตาม [NexSite]
        ↓
Milestone เสร็จ → [NexApprove] → [NexFinance] Invoice
        ↓
ลูกค้าชำระ → ปิด Project → CSAT → Upsell
        ↓
[NexCost] กำไรต่อ Project + [NexBI] Utilization Rate
```

---

---

# 🟡 Type 2: After-Sales / Field Service / ซ่อมบำรุง

> **ลักษณะ:** ลูกค้าแจ้งปัญหา → ส่งช่างออกพื้นที่ → แก้ไข → ปิด Ticket  
> **ตัวอย่าง:** ซ่อมแอร์, ลิฟต์, เครื่องจักร, IT On-site Support, CCTV, ระบบไฟ  
> **ความซับซ้อน:** SLA ต้องตอบสนองใน X ชั่วโมง, อะไหล่ต้องพร้อม, ช่างต้องใกล้ที่สุด

---

## 📋 กระบวนการ Field Service — End to End

---

### 🟦 LANE A: ลูกค้าแจ้งปัญหา (Call Center / Portal)

```
ลูกค้าแจ้งปัญหา
        │
        ├── [ช่องทาง] โทร / LINE / Email / App / NexSite Portal
        │
        ▼
[NexSales] Service Ticket / Helpdesk + SLA Timer
        ├── สร้าง Service Ticket อัตโนมัติ
        │       ├── บันทึก: ลูกค้า, สถานที่, อาการ, ระดับความเร่งด่วน
        │       └── ตรวจสอบ: ยังอยู่ในสัญญา Warranty หรือไม่?
        ├── Priority:
        │       ├── Critical (Major breakdown) → ตอบสนองใน 2 ชม.
        │       ├── High → ภายใน 4 ชม.
        │       └── Normal → ภายใน 24 ชม.
        ├── SLA Timer เริ่มนับทันทีที่สร้าง Ticket
        └── แจ้ง Dispatcher ให้จัดช่างด่วน
```

**ผู้รับผิดชอบ:** Call Center, Customer Service

---

### 🟩 LANE B: Dispatcher — จัดช่างและนัดหมาย

```
[NexProduce] Dispatch / Field Scheduling
        │
        ├── ดูช่างที่ว่างและใกล้ Site ที่สุด ← [NexForce] Calendar
        ├── ตรวจสอบ Skill Matrix + Certificate ว่าช่างมีทักษะและใบรับรองตรงกับงานหรือไม่
        ├── จัด Assign ช่าง → แจ้งผ่าน Mobile App
        ├── ส่ง SMS/Notification ให้ลูกค้าว่า "ช่างกำลังเดินทาง"
        │       └── แจ้งชื่อช่าง, ภาพ, เวลาถึงโดยประมาณ
        └── [NexSpeed] ← GPS Track ช่างขณะเดินทาง
```

**ผู้รับผิดชอบ:** Dispatcher / Scheduler

---

### 🟡 LANE C: ช่างทำงาน On-site

```
[ช่างใช้ NexField Mobile App สำหรับหน้างานโดยเฉพาะ]
        │
        ├── เดินทาง → GPS Tracking → ถึง Site
        ├── Check-in ที่ลูกค้า (GPS Timestamp)
        ├── ดูรายละเอียด Ticket + ประวัติซ่อมเดิม
        ├── วินิจฉัยปัญหา + บันทึก
        │       └── ถ่ายรูปสภาพ "ก่อน"
        ├── เช็คอะไหล่ที่ต้องใช้:
        │       ├── [มีในรถช่าง] → ใช้ได้เลย
        │       └── [ไม่มี] → ขอเบิกจาก คลัง ← [NexStock]
        ├── แก้ไขงาน → ทดสอบ → บันทึก
        │       └── ถ่ายรูปสภาพ "หลัง"
        ├── ลูกค้า Sign-off บน Tablet/Mobile
        └── Check-out → ปิด Ticket
```

**ผู้รับผิดชอบ:** Field Technician / ช่าง

---

### 🟨 LANE D: อะไหล่ + คลัง (คู่ขนาน)

```
[NexStock — Parts / Spare Parts]
        │
        ├── สต็อกอะไหล่ที่ Warehouse กลาง
        ├── [NexStock] Van Stock ติดตามสต็อกอะไหล่ในรถช่างแต่ละคัน
        ├── เมื่อช่างเบิก → ตัดสต็อกอัตโนมัติ
        ├── Van Stock ต่ำ → แจ้งให้ซื้อ/เบิกเพิ่ม
        │       └── [NexProcure] ← PR → PO → รับอะไหล่
        └── ต้นทุนอะไหล่ต่อ Job → [NexCost]
```

---

### 🟥 LANE E: Billing + รายงาน

```
[NexFinance — After Service Billing]
        │
        ├── กรณี In-Warranty: ไม่คิดเงิน → บันทึกต้นทุน
        ├── กรณี Out-of-Warranty / Service Contract:
        │       ├── ค่าแรงงาน (ชั่วโมงทำงานจริง × Rate)
        │       ├── ค่าอะไหล่ที่เปลี่ยน (จาก NexStock)
        │       └── ค่าเดินทาง (ถ้ามี)
        ├── ออก Service Report + Invoice
        │       └── [NexLess] ← แนบรูปก่อน-หลัง + รายงาน
        └── [NexTax] VAT + หัก ณ ที่จ่าย

[SLA Report — NexBI]
        ├── First Response Time (เฉลี่ย)
        ├── Resolution Time เฉลี่ย
        ├── SLA Compliance %: ปิดงานทันตาม Priority %
        ├── First-Time Fix Rate %: ซ่อมสำเร็จรอบเดียว %
        └── Repeat Visits: งานซ่อมซ้ำ (คุณภาพช่าง)
```

---

### 🟪 LANE F: สัญญาบำรุงรักษา PM (คู่ขนาน ตลอดปี)

```
[NexSales — Service Contract / สัญญา PM]
        │
        ├── สัญญา PM รายปี (เยี่ยมตาม Schedule ปีละ X ครั้ง)
        ├── [NexProduce] ← Auto-create PM Ticket ตามกำหนด
        ├── Dispatcher จัดช่างตามแผน
        └── PM Report → ลูกค้า ← [NexLess]

[NexFinance] — ค่าสัญญา PM
        ├── เก็บเงินล่วงหน้า (ทั้งปี / รายไตรมาส)
        └── Deferred Revenue บันทึกทยอย
```

---

## 🔄 Flow ย่อ Field Service

```
ลูกค้าแจ้ง → [NexSales] สร้าง Ticket + SLA เริ่มนับ
        ↓ (คู่ขนาน)
[NexProduce] Dispatch ช่าง + [NexStock] เตรียมอะไหล่
        ↓
[NexSpeed] ช่างเดินทาง + GPS Track → ลูกค้าดูสถานะ
        ↓
ช่าง On-site → วินิจฉัย → ซ่อม → ถ่ายรูป → Sign-off
        ↓
Ticket ปิด → [NexSales] SLA บันทึกผล
        ↓
[NexFinance] Invoice (ถ้าคิดเงิน)
        ↓
[NexBI] SLA Dashboard + ต้นทุนต่อ Job + ช่างที่ดีที่สุด
```

---

---

# 🟢 Type 3: Retainer / บริการรายเดือน (Subscription Services)

> **ลักษณะ:** ให้บริการต่อเนื่อง คิดค่าบริการแบบ Recurring รายเดือน/รายปี  
> **ตัวอย่าง:** รปภ., แม่บ้านบริษัท, Facility Management, BPO/Outsource, IT Managed Service  
> **ความซับซ้อน:** บริหารพนักงานจำนวนมากอยู่หลาย Site ลูกค้า, รายงาน SLA รายเดือน

---

## 📋 กระบวนการ Retainer Services — End to End

---

### 🟦 LANE A: เริ่มต้นสัญญาลูกค้าใหม่

```
ลูกค้าสนใจใช้บริการ
        │
        ▼
[NexSales] — Business Development
        ├── Survey Site ลูกค้า (จำนวนจุด, เวลาทำงาน, ความต้องการ)
        ├── จัดทำ Proposal: จำนวนคน, กะ, Spec ที่ใช้
        ├── เจรจาเงื่อนไข + ราคา
        ├── [NexLess] ← สัญญาบริการ + TOR (Terms of Reference)
        └── เริ่มสัญญา → จัดพนักงานลง Site
```

---

### 🟩 LANE B: จัดพนักงาน + กะทำงาน (คู่ขนาน)

```
[NexForce — Workforce Management]
        │
        ├── ดูพนักงานว่าง + Qualified สำหรับงานนี้
        ├── จัด Roster (ตารางกะ) รายเดือน
        │       ├── กะเช้า / กะบ่าย / กะดึก
        │       ├── วันหยุด / วันทำงาน
        │       └── พนักงานสำรอง (Backup) ต่อ Site
        ├── แจ้งพนักงาน: Assignment + กะ
        └── ลง Site ปฏิบัติงาน
```

---

### 🟡 LANE C: การปฏิบัติงานประจำวัน (Daily Operations)

```
[พนักงาน ณ Site ลูกค้า — NexForce Mobile App]
        │
        ├── เช้า: [NexForce] GPS Check-in Timestamp ณ สถานที่จริงป้องกัน Ghost Check-in
        │       └── [NexForce] บันทึก: เวลา, Location
        ├── กลางวัน: บันทึกกิจกรรม / รายงานสิ่งผิดปกติ
        │       └── ถ่ายรูป + หมายเหตุ
        ├── เย็น: Check-out → บันทึกชั่วโมง
        └── กรณีฉุกเฉิน: กด SOS → แจ้ง Supervisor ทันที

[Supervisor ดูทุก Site — NexBI Dashboard]
        ├── [NexForce] Workforce Real-time Map: พนักงานทุกคนอยู่ที่ไหนบ้าง Real-time เพื่อจัดสรรงานด่วน
        ├── Attendance: ใครขาด / มาสาย
        ├── แจ้งเตือนถ้าไม่มีการ Check-in ภายในเวลา
        └── จัด Backup ไปแทนทันที
```

**ผู้รับผิดชอบ:** Operations Supervisor, Site Manager

---

### 🟨 LANE D: รายงานรายเดือนให้ลูกค้า + เก็บเงิน

```
[NexForce + NexSales → ทุกสิ้นเดือน]
        │
        ├── Export รายงานการปฏิบัติงาน:
        │       ├── Attendance Report: ชั่วโมงรวมต่อคน
        │       ├── Activity Log: ทำอะไรบ้างในเดือน
        │       └── Incident Report: เหตุการณ์ผิดปกติ
        ├── ส่งรายงานให้ลูกค้า ← [NexLess/NexSite]
        └── ออก Invoice รายเดือน
                ├── [NexFinance] ← ค่าบริการตลอดเดือน
                └── [NexTax] VAT + หัก ณ ที่จ่าย

[NexBI — Service Quality Dashboard]
        ├── Attendance Rate % ต่อ Site
        ├── Incident จำนวนต่อเดือน
        └── Customer Satisfaction Score (CSAT)
```

---

### 🟥 LANE E: HR + เงินเดือนพนักงานภาคสนาม (คู่ขนาน)

```
[NexForce — HR Data → NexPayroll]
        │
        ├── สรุปชั่วโมงทำงาน + OT + กะดึก ทุกสิ้นเดือน
        ├── Leave / ขาด / มาสาย → หักเงิน
        ├── [NexPayroll] คำนวณเงินเดือนสุทธิ
        │       ├── ค่าตำแหน่ง + ค่ากะ + OT
        │       ├── ประกันสังคม + ภาษีหัก ณ ที่จ่าย
        │       └── เงินได้สุทธิ → โอนเข้าบัญชี
        └── [NexFinance] บันทึก Salary JE + Payroll Cost
```

---

### 🟪 LANE F: จัดซื้ออุปกรณ์ประจำ + Uniform (คู่ขนาน)

```
[NexProcure] — อุปกรณ์ + Uniform
        │
        ├── ซื้อ Uniform (แยกตาม Site ลูกค้า)
        ├── อุปกรณ์: วิทยุสื่อสาร, อุปกรณ์ทำความสะอาด
        └── [NexStock] ← เก็บสต็อก + เบิกให้พนักงาน

[NexAsset — Car / Equipment ที่ลูกค้า]
        └── อุปกรณ์ติดตั้งที่ Site: ลงทะเบียน + ดูแล
```

---

## 🔄 Flow ย่อ Retainer Services

```
ลูกค้าใหม่ → [NexSales] Proposal → เซ็นสัญญา
        ↓
[NexForce] จัด Roster + กำหนดกะ + Assign พนักงาน
        ↓
พนักงาน Check-in GPS ทุกวัน + บันทึกกิจกรรม
        ↓ (คู่ขนาน)
[Supervisor] ดู Dashboard Real-time + จัด Backup
        ↓
สิ้นเดือน: [NexForce] Export รายงาน + ส่งลูกค้า
        ↓ (คู่ขนาน)
[NexPayroll] คำนวณเงินเดือน + [NexFinance] Invoice
        ↓
[NexBI] CSAT + Attendance Rate + กำไรต่อ Site
```

---

---

# 🟣 Type 4: Hospitality / Beauty / Wellness

> **ลักษณะ:** นัดหมายล่วงหน้า ให้บริการ ณ สถานที่ คิดต่อชั่วโมง/คอร์ส/คืน  
> **ตัวอย่าง:** โรงแรม, รีสอร์ท, สปา, คลินิกความงาม, ร้านเสริมสวย, ฟิตเนส, ศูนย์บริการ  
> **ความซับซ้อน:** จัดการนัดหมาย, ห้อง/คิว, Customer History, สินค้า Retail ใช้ร่วม

---

## 📋 กระบวนการ Hospitality/Beauty — End to End

---

### 🟦 LANE A: ลูกค้าจองบริการ (Booking)

```
ลูกค้าต้องการจองบริการ
        │
        ├── [ช่องทาง]
        │     ├── Walk-in: เดินเข้าหน้าร้านตรง
        │     ├── โทร / LINE
        │     ├── [NexSite] ← Booking ผ่าน Website/App
        │     └── Google / Booking.com / Agoda (ผ่าน Integration)
        │
        ▼
[NexSales] Booking / Appointment Calendar
        ├── ดูความพร้อม (Availability):
        │       ├── ห้องว่าง / คิวว่าง (Calendar)
        │       ├── ผู้ให้บริการว่าง (Therapist, Hair Stylist)
        │       └── ช่วงเวลาที่เลือก
        ├── จองห้อง / Slot / Slot เวลา
        ├── บันทึก: ชื่อลูกค้า, บริการที่เลือก, ผู้ให้บริการ
        ├── ส่ง Confirmation ทาง SMS/Email อัตโนมัติ
        └── Reminder 1 วันก่อน → ส่งให้ลูกค้าอัตโนมัติ
```

**ผู้รับผิดชอบ:** Receptionist, Front Desk

---

### 🟩 LANE B: เตรียมความพร้อมก่อนให้บริการ (คู่ขนาน)

```
[NexForce — Staff Schedule]
        │
        ├── ผู้ให้บริการดู Booking ของตัวเองวันนี้
        ├── เตรียม: อุปกรณ์, ผลิตภัณฑ์ที่ใช้ต่อลูกค้า
        ├── ดูประวัติลูกค้า (ถ้าเคยมา):
        │       ├── แพ้อะไร / ชอบอะไร
        │       └── บริการที่เคยทำครั้งก่อน
        └── ห้อง/Zone เตรียมพร้อม

[NexStock — ผลิตภัณฑ์ที่ใช้]
        └── ตัดสต็อกตามบริการที่ให้ (Auto-deduct ตาม Recipe)
```

---

### 🟡 LANE C: ให้บริการ + Check-in / Check-out

```
ลูกค้ามาถึง
        │
        ▼
[NexPOS / NexSales — Front Desk]
        ├── Check-in → ยืนยัน Booking
        │       └── อัปเดตสถานะ: "กำลังรับบริการ"
        ├── ให้บริการตามที่จอง
        │       ├── ผู้ให้บริการบันทึกสินค้า/บริการที่ใช้
        │       └── [NexStock] ตัดสต็อกผลิตภัณฑ์อัตโนมัติ
        ├── Add-on บริการเพิ่มเติม ณ วันนั้น
        └── Check-out:
                ├── สรุปค่าใช้จ่าย (บริการ + ผลิตภัณฑ์ + Add-on)
                ├── เลือกชำระ: เงินสด / บัตร / QR / Package
                ├── [NexPOS] ออกใบเสร็จ
                └── สะสม Point / ใช้ Voucher ← [NexSales]
```

**ผู้รับผิดชอบ:** Service Staff (Therapist, Stylist, Nurse), Receptionist

---

### 🟨 LANE D: Package / Membership / Course

```
[NexSales] Package / Membership / Course
        │
        ├── ลูกค้าซื้อ Package ล่วงหน้า (เช่น 10 ครั้ง)
        │       └── [NexFinance] รับเงิน → บันทึก Deferred Revenue และทยอยรับรู้รายได้ทีละครั้ง
        ├── แต่ละครั้งที่ใช้บริการ → หักจาก Package
        │       └── คงเหลือ: 9, 8, 7 ... ครั้ง
        ├── แจ้งเตือนลูกค้าเมื่อ Package ใกล้หมด
        └── ต่ออายุ Package → Upsell
```

---

### 🟥 LANE E: สต็อกผลิตภัณฑ์ + Retail (คู่ขนาน)

```
[NexStock — Salon/Spa Products]
        │
        ├── ผลิตภัณฑ์ 2 ประเภท:
        │       ├── Back Bar: ใช้ในกระบวนการบริการ (ตัดตามจริง)
        │       └── Retail: ขายให้ลูกค้านำกลับบ้าน (ขาย ณ จุดชำระ)
        ├── Low Stock → [NexProcure] สั่งซื้อ
        └── Shrinkage Check: นับสต็อกรายสัปดาห์
```

---

### 🟪 LANE F: รายงานและปิดบัญชีสิ้นวัน

```
[NexPOS — EOD (End of Day)]
        │
        ├── สรุปยอดขายทั้งวัน (บริการ + Product)
        ├── แยกตาม: เงินสด, บัตร, QR, Package Redemption
        ├── กระทบกับยอดเงินในมือจริง
        └── ส่งรายงานไป [NexFinance]

[NexBI] Dashboard Builder (KPI: SLA, Utilization, CSAT, Revenue)
        ├── Occupancy Rate % (ห้อง/คิวที่ถูกจอง vs ทั้งหมด)
        ├── Revenue per Available Slot (RevPAS)
        ├── ผู้ให้บริการที่มียอดขายสูงสุด (Performance)
        ├── บริการที่ลูกค้านิยมสูงสุด
        └── No-show Rate %: จองแต่ไม่มา
```

---

## 🔄 Flow ย่อ Hospitality/Beauty

```
ลูกค้าจอง → [NexSales] Booking + แจ้งเตือนอัตโนมัติ
        ↓ (คู่ขนาน)
[NexForce] ผู้ให้บริการดู Schedule + เตรียมพร้อม
        ↓
ลูกค้ามาถึง → [NexPOS] Check-in
        ↓
ให้บริการ → [NexStock] ตัดผลิตภัณฑ์อัตโนมัติ
        ↓
Check-out → ชำระเงิน (เงินสด/บัตร/Package)
        ↓
[NexFinance] บันทึกรายได้ + ตัดแต้ม/Package
        ↓ (คู่ขนาน)
[NexStock] สต็อกต่ำ → [NexProcure] สั่งซื้อ
        ↓
[NexBI] Occupancy, Revenue, Performance Dashboard
```

---

---

# 🗺️ Master Integration Map (ธุรกิจบริการ)

```
                       [NexCore]
                   SSO / Role / Config
              ↙️         ↓          ↘️
       [NexForce]   [NexAsset]   [NexSales]
       พนักงาน       อุปกรณ์      CRM/Booking
       Timesheet     การดูแล      Service Catalog
       GPS Check-in  ยานพาหนะ     Ticket/Inquiry
           ↓             ↓             ↓
      [NexPayroll]   [NexMaint]  [NexApprove]
       เงินเดือน     ซ่อมบำรุง    อนุมัติงาน
       ค่ากะ/OT      อุปกรณ์      ส่วนลด/Contract
                                       │
               ┌───────────────────────┤
               ↓                       ↓
      [NexProduce / Scheduling]   [NexStock]
       Dispatch / Assignment       อะไหล่/ผลิตภัณฑ์
       Project Planning            Retail/Back Bar
       SLA Tracking                Uniform/อุปกรณ์
               │                       │
               └───────────┬───────────┘
                           ↓
                   [NexFinance]
                   AR (Invoice/เก็บเงิน)
                   AP (ค่าจ้างเหมา, อะไหล่) + 3-Way Matching ตรวจสอบ PO + Delivery + Invoice ก่อนจ่ายเงินให้ Subcontractor
                   Deferred Revenue (Package)
                   GL / Cash
                           │
               ┌───────────┼───────────┐
               ↓           ↓           ↓
           [NexTax]  [NexPayroll]  [NexCost]
            ภาษี     เงินเดือน     ต้นทุนต่อ Job
            VAT/WHT  ค่ากะ/OT      Project P&L

[NexPOS]     ← รับชำระเงิน (หน้าร้าน / Front Desk)
[NexSpeed]   ← ช่างเดินทาง / ส่งของ GPS Track
[NexConnect] ← รับ Booking จาก Platform ภายนอก
[NexSite]    ← Customer Portal (จอง, ดูสถานะ, History)
[NexLess]    ← สัญญา, SOW, รายงาน QC, Acceptance
[NexApprove] ← อนุมัติ: Proposal, ส่วนลด, Overtime
[NexAudit]   ← Log ทุก Action
[NexBI]      ← SLA, Utilization, Occupancy, Profitability
[NexLearn]   ← Training ทักษะพนักงานบริการ
```

---

# ⚡ Trigger Events อัตโนมัติ — Service Business

| เหตุการณ์ | แอปต้นทาง | แอปปลายทาง | ผลที่ได้ |
|---|---|---|---|
| ลูกค้าจองผ่าน Website | NexSite | NexSales | สร้าง Booking อัตโนมัติ |
| Booking ยืนยัน | NexSales | Email/SMS | ส่ง Confirmation ลูกค้า |
| 1 วันก่อนนัด / SLA ใกล้ถึงกำหนด | NexSales / NexProduce | NexCore Notification | ส่ง Reminder ลูกค้า หรือแจ้งเตือน SLA ผ่าน Notification Engine |
| สร้าง Service Ticket | NexSales | NexProduce | SLA Timer เริ่มนับ |
| Assign ช่าง | NexProduce | Mobile App | ช่างได้รับแจ้ง Job |
| ช่าง Check-in GPS | NexForce | Customer SMS | แจ้งลูกค้าว่าช่างมาถึง |
| ช่างปิด Ticket | NexSales | NexFinance | สร้าง Invoice อัตโนมัติ |
| ชำระเงิน POS | NexPOS | NexStock | ตัดสต็อกผลิตภัณฑ์ |
| ชำระเงิน POS | NexPOS | NexFinance | บันทึกรายได้ทันที |
| Package หมด | NexSales | Customer | แจ้งเตือน Renew |
| Stock อะไหล่ต่ำ | NexStock | NexProcure | PR อัตโนมัติ |
| PM รอบถึง | NexAsset | NexMaint | สร้าง PM Work Order |
| สิ้นเดือน | NexForce | NexPayroll | สรุป Timesheet → คำนวณเงินเดือน |
| Invoice ค้าง > X วัน | NexFinance | Sales/Customer | แจ้งเตือนเก็บเงิน |
| ทุก Transaction | ทุกแอป | NexBI + NexAudit | Dashboard + Log |

---

# 👤 ใครใช้แอปไหน — Service Business

| ตำแหน่ง | แอปหลัก | แอปรอง | Mobile |
|---|---|---|---|
| **MD / ผู้บริหาร** | NexBI | NexFinance, NexApprove | ✅ Dashboard |
| **Sales / BDM** | NexSales | NexLess, NexApprove | ✅ CRM |
| **Project Manager** | NexProduce (Project) | NexForce, NexCost, NexSite | — Desktop |
| **Consultant / Specialist** | NexForce (Timesheet) | NexLess | ✅ Mobile Timesheet |
| **Dispatcher / Scheduler** | NexProduce (Dispatch) | NexForce, NexSpeed | Desktop + ✅ |
| **Field Technician / ช่าง** | NexForce (Field App) | NexStock (เบิกอะไหล่) | ✅ Technician App |
| **Front Desk / Receptionist** | NexSales (Booking) | NexPOS | ✅ Tablet |
| **Service Staff (สปา/ร้าน)** | NexForce (Schedule) | NexPOS (Add-on) | ✅ Tablet |
| **Operations Supervisor** | NexBI (Map/Attendance) | NexForce | ✅ Real-time Map |
| **Warehouse / Store** | NexStock | NexProcure | ✅ สแกน |
| **HR / Admin** | NexForce | NexPayroll, NexLearn | — |
| **Finance / Accounting** | NexFinance | NexTax, NexPayroll | ⚡ อนุมัติ |
| **ลูกค้า B2B / B2C** | NexSite (Portal) | — | ✅ จอง/ดูสถานะ |

---

# 📊 KPI Dashboard สำหรับ Service Business

| KPI | คำนวณจาก | ประเภทที่ใช้ | ความหมาย |
|---|---|---|---|
| **Utilization Rate %** | NexForce (Timesheet) | Pro Services | ชั่วโมง Billable / ชั่วโมงทำงานทั้งหมด |
| **Project Margin %** | NexCost vs NexSales | Pro Services | กำไรจริงต่อ Project |
| **First Response Time** | NexSales (Ticket) | Field Service | เวลาตอบสนองเฉลี่ยหลัง Ticket เปิด |
| **SLA Compliance %** | NexSales | Field Service | ปิดงานทันตามระดับ Priority |
| **First-Time Fix Rate %** | NexSales | Field Service | ซ่อมสำเร็จรอบเดียว % |
| **Technician Productivity** | NexForce + NexSales | Field Service | จำนวน Job ต่อช่างต่อวัน |
| **Site Attendance Rate %** | NexForce | Retainer | พนักงานมาปฏิบัติงานครบ % |
| **Revenue per Employee** | NexFinance + NexForce | Retainer | รายได้เฉลี่ยต่อพนักงาน |
| **Booking Occupancy %** | NexSales (Booking) | Hospitality | Slot/ห้อง ที่ถูกจอง vs ทั้งหมด |
| **No-show Rate %** | NexSales | Hospitality | จองแต่ไม่มา |
| **Revenue per Available Slot** | NexFinance + NexSales | Hospitality | รายได้เฉลี่ยต่อ Slot/ชั่วโมง |
| **Package Redemption Rate %** | NexSales | Hospitality | ลูกค้ากลับมาใช้ Package % |
| **Customer Retention Rate %** | NexSales (CRM) | ทุกประเภท | ลูกค้าเก่ากลับมาใช้ % |
| **CSAT / NPS Score** | NexSales (Survey) | ทุกประเภท | ความพึงพอใจลูกค้า |

---

# ⏱️ Timeline ตัวอย่าง — Field Service (ซ่อมแอร์ฉุกเฉิน)

```
07:30 ─── ลูกค้าโทรแจ้ง: แอร์สำนักงานเสีย (Critical)
           └── [NexSales] สร้าง Ticket — SLA Timer เริ่ม! (ต้องตอบ 2 ชม.)

07:32 ─── Call Center บันทึก: สถานที่, อาการ, รุ่นเครื่อง
           └── [NexProduce] Dispatch แจ้ง Dispatcher

07:35 ─── Dispatcher ดูช่างใกล้ที่สุดที่ Skill แอร์
           ├── ช่างสมชาย: ห่าง 8 กม. — ว่างอยู่
           └── [NexProduce] Assign → แจ้ง Mobile App สมชาย

07:36 ─── SMS ลูกค้า: "ช่างสมชายกำลังเดินทาง คาดถึง 08:15"

07:36 ─── [NexStock] ช่างสมชาย เช็ค Van Stock:
           └── น้ำยาแอร์ R410A: มีพอ ✅ อะไหล่ปั๊มน้ำ: ไม่มี ❌
               └── ประสานงานขอ Warehouse ส่งด่วน

08:10 ─── สมชาย Check-in GPS ที่ Site
           └── SMS ลูกค้า: "ช่างถึงแล้ว"

08:10-09:00 ─── วินิจฉัย: Capacitor เสีย + น้ำยาน้อย
                ├── เปลี่ยน Capacitor (มีในรถ)
                ├── เติมน้ำยา R410A
                └── ทดสอบ: ทำงานปกติ ✅

09:00 ─── ถ่ายรูปหลังซ่อม + ลูกค้า Sign-off
           └── [NexSales] ปิด Ticket — SLA ผ่าน ✅ (ใช้เวลา 1.5 ชม.)

09:01 ─── [NexFinance] Invoice ส่ง Email ลูกค้าอัตโนมัติ:
           ├── ค่าแรง: 1.5 ชม. × 600 = 900 บาท
           ├── Capacitor: 350 บาท
           ├── น้ำยา R410A 0.5 kg: 250 บาท
           └── รวม: 1,500 บาท (ไม่รวม VAT)

09:05 ─── [NexBI] อัปเดต:
           ├── SLA Compliance วันนี้: 100% ✅
           └── First-Time Fix: +1
```

---

# ⏱️ Timeline ตัวอย่าง — Professional Services (Project รายเดือน)

```
วันที่ 1 (Kick-off):
        ├── [NexSales] สัญญา + SOW เซ็นแล้ว
        └── [NexProduce] สร้าง Project → WBS → Assign ทีม 3 คน

สัปดาห์ 1-2: ทีม Consultant ทำงาน
        ├── ทุกวัน: บันทึก Timesheet ← [NexForce]
        └── Deliverable 1 (รายงานปัจจุบัน) เสร็จ → [NexLess]

วันที่ 14: Milestone 1 ✅
        ├── [NexApprove] PM อนุมัติ Deliverable
        └── [NexFinance] Invoice งวด 1 (30% = 90,000 บาท)

สัปดาห์ 3-4: ทีมทำงานต่อ
        ├── Timesheet ทุกวัน
        └── ลูกค้าดูความคืบหน้า ← [NexSite] Portal

วันที่ 30: Milestone 2 ✅
        └── [NexFinance] Invoice งวด 2 (40% = 120,000 บาท)

สิ้นเดือน — คู่ขนาน:
        ├── [NexPayroll] Consultant ได้รับเงินเดือน
        └── [NexCost] ต้นทุน Project เดือนนี้:
                ├── Salary: 75,000
                ├── ค่าเดินทาง + ที่พัก: 8,000
                └── กำไรเดือนนี้: 127,000 บาท (Margin 57%)

วันที่ 60: Final Delivery
        ├── [NexLess] Acceptance Document เซ็น
        └── [NexFinance] Invoice งวดสุดท้าย (30% = 90,000)
            [NexSales] CSAT Survey → ลูกค้าให้ 4.8/5.0 ⭐
```

---

# 🏗️ แผนการพัฒนา (Priority สำหรับ Service Business)

| Phase | แอป | สิ่งที่ได้ทันที |
|---|---|---|
| **Phase 0** | NexCore | SSO, Role, Permission พร้อม |
| **Phase 1** | NexSales, NexForce | พนักงาน + CRM + Booking + Timesheet |
| **Phase 2** | NexFinance, NexPayroll | Invoice, เก็บเงิน, เงินเดือน |
| **Phase 2** | NexProduce (Scheduling) | Dispatch, Project, SLA ครบ |
| **Phase 3** | NexPOS, NexStock | หน้าร้าน + สต็อกผลิตภัณฑ์ |
| **Phase 3** | NexAsset, NexMaint | อุปกรณ์ + ซ่อมบำรุง |
| **Phase 3** | NexTax, NexCost, NexApprove | ภาษี + ต้นทุน + Workflow |
| **Phase 4** | NexBI, NexSite, NexLess, NexLearn, NexAudit | Dashboard + Portal + เอกสาร + Training |

---

_เอกสารจัดทำโดย: NexOne Development Team_  
_กรณีศึกษา: ธุรกิจการบริการ (Professional Services / Field Service / Retainer / Hospitality)_  
_ปรับปรุงล่าสุด: April 2026_

---

## 🎯 สรุปฟีเจอร์หลักที่ต้องพัฒนา (Master Plan)
รายการฟีเจอร์ด้านล่างคือ **Gap Features** ที่ต้องพัฒนาเข้าสู่ระบบ NexOne เพื่อให้รองรับธุรกิจ Service (บริการ) ได้อย่างสมบูรณ์:

### 1. ฟีเจอร์หลัก (Core Extensions)
- **Service Ticket & SLA Engine (NexSales / NexProduce)**: รับแจ้งซ่อมและนับเวลาตาม SLA
- **Booking / Appointment Calendar (NexSales)**: จองคิวใช้บริการ
- **Package / Membership (NexSales)**: ขายแพ็คเกจ หักเครดิต
- **Dispatch / Field Scheduling (NexProduce)**: จัดช่างลงพื้นที่
- **Project Board & WBS (NexProduce)**: บริหารโปรเจกต์ (สำหรับ Service-Pro)
- **CSAT Survey (NexSales)**: แบบประเมินความพึงพอใจ
- **Van Stock (NexStock)**: โอนสต็อก อะไหล่ลงรถช่าง
- **Deferred Revenue (NexFinance)**: ทยอยรับรู้รายได้จาก Package
- **Skill Matrix & Workforce Map (NexForce)**: ดูแผนที่พนักงานและ Skill แบบ Real-time
- **Timesheet per Project (NexForce)**: ลงเวลาทำงานรายโปรเจกต์
- **GPS Check-in / Check-out (NexForce)**: ช่างลงพื้นที่เข้างาน

### 2. ฟีเจอร์ข้ามแอป (Cross-cutting)
- **Mobile App - Field Service (NexField)**: แอปช่างรับงานและปิดงาน ส่งรูปถ่าย
- **Customer Portal Login (NexPortal)**: ลูกค้าเช็คสถานะงานซ่อม
- **3-Way Matching (NexFinance)**: กระทบยอด
- **e-Tax Invoice (NexTax)**: ใบเสร็จอิเล็กทรอนิกส์

