# 🏠 NexOne Platform — คู่มือสำหรับธุรกิจอสังหาริมทรัพย์ (Real Estate)

**Document Version:** 1.0 | **Date:** April 2026
**Path:** `docs/business_concept/06_real_estate.md`

---

## 🏢 ประเภทธุรกิจที่ครอบคลุม

| # | ประเภท | ลักษณะธุรกิจ | ตัวอย่าง |
|---|---|---|---|
| **Type 1** | **Developer / ขายโครงการ** | สร้างบ้าน/คอนโด แล้วขาย | Residential Developer, Condo Project |
| **Type 2** | **Property Management / บริหารอาคาร** | บริหารโครงการที่สร้างแล้ว | Juristic Person, นิติบุคคล, Property Mgr |
| **Type 3** | **เช่า / Rental** | ให้เช่าพื้นที่ระยะยาว/สั้น | ออฟฟิศให้เช่า, Serviced Apartment, Shophouse |
| **Type 4** | **นายหน้า / Agency** | เป็นตัวกลางซื้อ-ขาย-เช่า | Real Estate Agent, นายหน้าอิสระ |

---

## ⚙️ STEP 0 — ตั้งค่าระบบ

```
NexCore:
├── ลงทะเบียนบริษัท / โครงการ (**Multi-Project Management** เพื่อแยกบัญชีและรวมศูนย์ข้อมูล)
├── Role: MD, Sales, PM, Juristic, Accounting, Maintenance, Tenant
└── Multi-Project: แยกข้อมูลต่อโครงการ แต่ดูรวมได้

NexSales:
├── Unit Master Data (ห้อง/บ้าน/พื้นที่: เลขห้อง, ขนาด, ชั้น, ราคา)
├── Status: Available / Reserved / Sold / Rented / Under Maintenance
└── Price Matrix: ราคาต่อชั้น / ทิศทาง / วิว

NexAsset + NexMaint:
├── ลงทะเบียนทรัพย์สินส่วนกลาง (ลิฟต์, ระบบดับเพลิง, สระน้ำ)
├── PM Schedule ต่อชิ้น
├── Warranty ของแต่ละ Unit
└── **Meter Reading**: ฟังก์ชันจด/อ่านเลขมาตรวัดน้ำ-ไฟ เพื่อคิดใบแจ้งหนี้อัตโนมัติ

NexForce:
├── พนักงาน: นิติ, แม่บ้าน, รปภ., ช่างซ่อม, พนักงานขาย
└── กะทำงาน 24 ชม. (นิติ/รปภ.)
```

---

## 🔵 Type 1: Developer / ขายโครงการ

### LANE A: Pre-Sales → จอง → โอน

```
เปิดโครงการ Pre-Sales
        │
        ▼
[NexSales — Project Sales / **CRM Pipeline**]
        ├── ติดตามระยะ Lead → Site Visit → จอง → โอน (Sales Funnel)
        ├── ลูกค้าเข้าชม Sales Gallery
        ├── ดูรายการ Unit ว่าง (Floor Plan + 3D View)
        ├── เลือก Unit → จอง (จ่ายเงินจอง)
        │       └── [NexFinance] รับเงินจอง → บันทึกบัญชีตลับ
        ├── Status Unit: Available → Reserved
        ├── ทำสัญญาผ่าน **e-Contract / e-Signature** → [NexLess] จัดเก็บสัญญาแบบ Paperless
        ├── ตารางการผ่อนดาวน์:
        │       ├── งวดที่ 1-12 ← แจ้งเตือนล่วงหน้า (ใช้ **Notification Engine**)
        │       └── [NexFinance] รับชำระทุกงวด
        └── ก่อสร้างเสร็จ → นัดโอนกรรมสิทธิ์
                ├── ตรวจรับห้อง (Punch List) 
                └── [NexFinance] รับเงินกู้แบงก์ + ค่าโอน และออก **e-Tax Invoice** ทันที

[NexProduce — **Construction Progress**]
        ├── ระบุ % ความคืบหน้าก่อสร้างต่อ Phase → ลิงก์เบิกจ่าย (Progress Payment)
        └── ลูกค้าสามารถติดตามสถานะการก่อสร้างออนไลน์ได้ผ่าน [**Customer Portal (NexPortal)**]
```

### LANE B: Construction Cost Tracking (คู่ขนาน)

```
[NexCost — Project Cost]
        ├── งบประมาณก่อสร้าง (Budget vs Actual)
        ├── ต้นทุนต่อ Unit (ที่ดิน + สร้าง + ส่วนกลาง)
        └── กำไรต่อ Unit หลังขาย

[NexProcure — จัดซื้อ/จ้างเหมา]
        ├── จ้างผู้รับเหมา (Subcontractor) / ขอเพิ่มงบผ่าน **Approval Workflow Builder**
        ├── ซื้อวัสดุก่อสร้าง
        └── ระบบ **3-Way Matching** ตรวจ PO ก่อสร้าง + Work Acceptance + Invoice ก่อนจ่าย Contractor
```

---

## 🟡 Type 2: Property Management / นิติบุคคล

### LANE A: เก็บค่าส่วนกลาง (รายเดือน/รายปี)

```
[NexSales — ค่าส่วนกลาง]
        │
        ├── ดึงรายชื่อเจ้าของ/ผู้เช่าทุก Unit สนทนากับมาตรวัดไฟ/น้ำอัตโนมัติ (**Meter Reading**)
        ├── คำนวณค่าส่วนกลาง (ตารางเมตร × อัตรา) + สาธารณูปโภค
        ├── **Approval Workflow Builder**: ขอส่วนลดค่าส่วนกลาง หรือกรณียกเว้นค่าปรับ
        ├── ออก Invoice รายเดือน/รายปี
        │       └── [NexFinance] ← บันทึก AR
        ├── ส่ง Invoice ผ่าน Email / App อัตโนมัติ (ใช้ **Notification Engine**)
        ├── ชำระผ่าน: โอน / QR / เคาน์เตอร์ (ออก **e-Tax Invoice** เมื่อชำระเสร็จ)
        └── แจ้งเตือนค้างชำระ → ปิดกุญแจ Access

[**Tenant Portal (NexPortal)**]
        ├── ดูประวัติการชำระเงิน และยอดค้าง Online
        ├── Download ใบเสร็จหรือ Invoices
        ├── แจ้งซ่อม Online / ติดตามสถานะ Maintenance Ticket
        └── ดูประกาศ/ข่าวของโครงการ
```

### LANE B: บริหารพื้นที่ส่วนกลาง (คู่ขนาน)

```
[NexSales — Facility Booking]
        ├── จองห้องประชุม / Fitness / Pool ล่วงหน้า
        ├── ดู Calendar ว่าง
        └── แจ้งยืนยัน → Reminder ก่อนใช้

[NexMaint — ซ่อมบำรุงส่วนกลาง]
        ├── PM Schedule: ลิฟต์, เครื่องปั๊มน้ำ, ระบบไฟ
        ├── ลูกค้าแจ้งซ่อม ← [**Tenant Portal (NexPortal)**]
        │       └── สร้าง Ticket → Assign ช่าง
        └── หากการขอซื้ออะไหล่ซ่อมบำรุงเกินวงเงิน ต้องขอ **Approval Workflow** จาก ผจก.

### LANE C: ความปลอดภัย + Access Control (คู่ขนาน)

```
[NexForce — รปภ. / ช่างซ่อม + NexAsset]
        ├── ช่างหรือทีมซ่อมใช้แอป **NexField** (รับตั๋วซ่อม, ถ่ายรูปก่อน-หลัง, Sign-off จากผู้พักแบบ Offline Mode ได้)
        ├── รปภ. / ช่างซ่อม **GPS Check-in** ในพื้นที่ Site ป้องกันการ Ghost Check-in (ไม่แอบเช็คอินที่บ้าน)
        ├── บันทึกผู้เยี่ยมชม (Visitor Log)
        ├── ยานพาหนะเข้า-ออก (ทะเบียนรถ)
        └── CCTV Log (บันทึกเหตุการณ์)
```

---

## 🟢 Type 3: Rental (ให้เช่า)

### LANE A: หาผู้เช่า → เซ็นสัญญา

```
[NexSales — Rental Management]
        │
        ├── ลงโฆษณา Unit ว่าง → [NexSite] / Portal ภายนอก
        ├── รับ Inquiry → นัด Viewing
        ├── ลูกค้าสนใจ → Check Credit / Background
        ├── เจรจาเงื่อนไข:
        │       ├── ค่าเช่า / ระยะสัญญา
        │       └── เงินมัดจำ, ค่าส่วนกลาง
        ├── [NexLess] ← ทำสัญญา **e-Contract / e-Signature** เช่าและลงนามดิจิทัล (ไม่ต้องพิมพ์)
        └── เข้าอยู่ → Status Unit: Rented
```

### LANE B: เก็บค่าเช่ารายเดือน (Recurring)

```
[NexFinance — Recurring Billing / **Deferred Revenue**]
        ├── บันทึกค่าเช่าล่วงหน้าที่จ่ายเข้ามา (Deposit / Advance) เป็น **Deferred Revenue** ทยอยรับรู้เป็นรายได้
        ├── Auto-generate Invoice ทุกต้นเดือน + คิดยอด **Meter Reading** ไฟ/น้ำรวมอัตโนมัติ
        ├── ส่ง Invoice อัตโนมัติ (Email/App) และออก **e-Tax Invoice** หลังจากรับชำระ
        ├── รับชำระ → อัปเดต Status ผู้เช่า
        └── ค้างจ่าย > X วัน → **Notification Engine** แจ้งเตือนสัญญาลูกค้า + แอดมินจัดการ
```

### LANE C: ต่อ / ไม่ต่อสัญญา

```
[NexSales — Contract Renewal]
        ├── แจ้งเตือน 60/30 วัน ก่อนสัญญาหมด
        ├── ต่อสัญญา → อัปเดตราคา + [NexLess] สัญญาใหม่
        └── ไม่ต่อ → ตรวจรับห้อง → คืนมัดจำ → เปิดรับผู้เช่าใหม่
```

---

## 🟠 Type 4: นายหน้า / Agency

```
[NexSales — Property Listings / Agency CRM Pipeline]
        ├── Database ทรัพย์สิน (ขาย/เช่า)
        ├── Agent กรอกรายละเอียด + รูปภาพ
        ├── [NexSite] แสดงบน Website ให้ Buyer/Renter ค้นหา
        ├── Matching: ลูกค้าต้องการ → ดึง Property ที่ตรง
        ├── นัด Showing → บันทึกใน Calendar
        └── ปิดดีล → Commission:
                ├── [NexSales] **Commission Management** คำนวณ Commission ให้นายหน้าตาม % + กำหนดวันโอน
                └── [NexPayroll] ส่งยอดเพื่อจ่าย Agent ที่ปิดดีลพร้อมกับรอบเงินเดือน
```

---

## 🔄 Flow ย่อ Property Management (สรุปหลัก)

```
เจ้าของ/ผู้เช่า ← [NexPortal] แจ้งซ่อม
        ↓
[NexSales] สร้าง Ticket → [NexMaint] Assign ช่าง
        ↓
ช่าง [NexField App] ซ่อม → GPS + รูปก่อน/หลัง
        ↓
ต้นเดือน [NexFinance] ออก Invoice ค่าส่วนกลาง
        ↓
ผู้พักอาศัย ชำระ / โอน → [NexFinance] รับชำระ
        ↓
[NexBI] Occupancy Rate / Overdue / ค่าซ่อมรายเดือน
```

---

---

## ⚡ Trigger Events อัตโนมัติ

| เหตุการณ์ | แอปต้นทาง | แอปปลายทาง | ผล |
|---|---|---|---|
| ลูกค้าจ่ายมัดจำล่วงหน้า | NexFinance | NexFinance | ทยอยรับรู้บัญชีรายได้เป็น Deferred Revenue |
| งานก่อสร้างถึงกำหนด Phase | NexProduce | NexFinance | ส่งเรื่องขอเบิกงวดเงินก่อสร้าง (Progress Payment) |
| แจ้งซ่อมออนไลน์ | NexPortal | NexMaint + NexField | ออก Maintenance Ticket ส่งไปที่หน้าจอช่าง |
| สัญญาผู้เช่าใกล้หมด | NexLess | Notification Engine | อีเมลเตือนผู้เช่าและนิติบุคคลก่อน 60 วัน |
| ค่าเช่าค้างชำระเกินวันที่กำหนด | NexFinance | Notification Engine | แจ้งระดับบริหาร ควบคุมตัด Access การเข้าถึงอาคาร |
| ผู้รับเหมาส่ง Invoice | NexProcure | NexFinance | ระบบทำ 3-Way Matching เช็คตรงกับ PO + Work Acception |

---

## 📊 KPI Dashboard Real Estate (โดยใช้ Dashboard Builder)

| KPI | ประเภท | ความหมาย |
|---|---|---|
| **Occupancy Rate %** | Rental/Mgt | Unit ที่มีผู้พักอาศัย / ทั้งหมด |
| **Collection Rate %** | All | เก็บค่าเช่า/ส่วนกลางได้ % |
| **Overdue AR Aging** | All | ค้างชำระแบ่งตามอายุ |
| **Unit Sales Progress** | Developer | ขายได้ % จากทั้งโครงการตาม Phase |
| **Maintenance Cost/Unit** | Mgt | ค่าซ่อมต่อ Unit ต่อปี |
| **Tenant Retention %** | Rental | สัดส่วนต่อสัญญาเช่าเรื่อยๆ vs ย้ายออก |
| **Ticket Resolution Time** | Mgt | เวลาเฉลี่ยปิด Ticket ซ่อมจากการแจ้งในแอป |
| **Revenue per Sqm** | Rental | รายได้เฉลี่ยต่อตารางเมตรของพื้นที่ให้เช่า |
| **Construction Budget Var** | Developer | งบก่อสร้าง Actual vs Budget ของทั้งโครงการ |
| **Commission Pipeline** | Agency | ยอด Commission ที่คาดว่าจะได้ในแต่ละไตรมาส |

---

## 👤 ใครใช้แอปไหน

| ตำแหน่ง | แอปหลัก | Mobile |
|---|---|---|
| เจ้าของ / Management | NexBI (Dashboard Builder), NexFinance, NexCore | ✅ Dashboard / อนุมัติ |
| ผจก. โครงการ / นิติบุคคล | NexSales, NexMaint, NexApprove | ✅ Tablet / Laptop |
| ผู้พักอาศัย / ผู้เช่า | NexPortal (Tenant / Customer Portal) | ✅ แอปมือถือ |
| ช่างซ่อม / รปภ. | NexField (Maintenance App), NexForce (GPS) | ✅ มือถือของช่าง |
| นักขาย / Broker | NexSales (CRM Pipeline), NexLess (e-Contract) | ✅ มือถือ / Tablet |
| จัดซื้อ (Purchasing) | NexProcure, NexStock | — |
| บัญชี / การเงิน | NexFinance (3-Way Matching / Deferred Revenue) | — |
| HR / Admin ฝ่ายบุคคล | NexForce, NexPayroll (คิดรวม Commission) | — |

---

## 🎯 สรุปฟีเจอร์หลักที่ต้องพัฒนา (Master Plan)
รายการฟีเจอร์ด้านล่างคือ **Gap Features** ที่ต้องพัฒนาเข้าสู่ระบบ NexOne เพื่อให้รองรับธุรกิจ Real Estate (อสังหาริมทรัพย์) ได้อย่างสมบูรณ์:

### 1. ฟีเจอร์หลัก (Core Extensions)
- **CRM Pipeline (NexSales)**: บริหาร Lead ลีดซื้อ/เช่า และการติดตาม
- **Commission Management (NexSales/NexPayroll)**: จ่ายและคำนวณค่าคอมนายหน้า
- **Progress-based Billing & Deferred Revenue (NexFinance)**: ทยอยเก็บเงิน และรับรู้รายได้จากค่าเช่าล่วงหน้า
- **e-Contract & e-Signature (NexLess)**: ออกแบบสัญญาเช่า ส่งออนไลน์ และเซ็นดิจิทัล
- **Meter Reading (NexMaint)**: จดค่าน้ำค่าไฟอัตโนมัติในตึก

### 2. ฟีเจอร์ข้ามแอป (Cross-cutting)
- **Tenant/Customer Portal (NexPortal)**: แพลตฟอร์มลูกบ้าน/ผู้เช่าเพื่อแจ้งซ่อม และจ่ายเงิน
- **3-Way Matching (NexFinance)**: บริหารงานจัดซื้อ
- **e-Tax Invoice (NexTax)**: Billing อัตโนมัติรายเดือน

