# 🚚 NexOne Platform — คู่มือสำหรับธุรกิจขนส่ง (Logistics Business)

**Document Version:** 1.0 | **Date:** April 2026  
**เป้าหมาย:** แสดงกระบวนการทำงานของธุรกิจขนส่งแต่ละประเภท  
และการเชื่อมโยงระหว่างแอปใน NexOne Platform ตั้งแต่เริ่มจนจบ

---

## 🏢 ประเภทธุรกิจขนส่งที่ครอบคลุม

| # | ประเภท | ลักษณะงาน | แอปหลักที่ใช้ |
|---|---|---|---|
| **Type 1** | **FTL / LTL Trucking** | รับจ้างขนส่งสินค้า B2B ระหว่างเมือง | NexSpeed |
| **Type 2** | **Last-Mile Delivery** | ส่งพัสดุปลายทางถึงมือผู้รับ | NexDelivery |
| **Type 3** | **Cold Chain / ห้องเย็น** | ขนส่งสินค้าควบคุมอุณหภูมิ | NexSpeed + NexMaint |
| **Type 4** | **Container / ท่าเรือ** | บริหารตู้สินค้า เข้า-ออก Port | NexSpeed + NexStock |

---

## ⚙️ STEP 0 — ตั้งค่าระบบก่อนเริ่มใช้งาน (ทำครั้งเดียว)

> **ผู้รับผิดชอบ:** IT Admin / ผู้บริหาร

```
┌──────────────────────────────────────────────────────────────────┐
│  NexCore — ตั้งค่าบริษัทและระบบกลาง                              │
│  ├── ลงทะเบียนข้อมูลบริษัท (ชื่อ, ที่อยู่, เลขภาษี)              │
│  ├── สร้าง Role & Permission                                     │
│  │     ├── Dispatcher (จัดการ Trip)                              │
│  │     ├── Driver (คนขับ — Mobile App)                           │
│  │     ├── Logistics Manager (ภาพรวม)                            │
│  │     ├── Finance (บัญชี/ชำระเงิน)                              │
│  │     └── Customer (ลูกค้าดูสถานะ)                              │
│  └── เปิด SSO — ทุกคน Login ด้วย Account เดียว                  │
│                                                                  │
│  NexForce — ข้อมูลพนักงาน                                        │
│  ├── ลงทะเบียนพนักงานทุกคน (คนขับ, Dispatcher, ช่างซ่อม)         │
│  ├── ข้อมูลใบขับขี่ + วันหมดอายุ                                  │
│  ├── กำหนดกะทำงาน (Shift กลางวัน/กลางคืน)                       │
│  └── เชื่อมกับ NexSpeed: คนขับ profile พร้อมรับทริป              │
│                                                                  │
│  NexAsset — ทะเบียนยานพาหนะและอุปกรณ์                            │
│  ├── ลงทะเบียนรถทุกคัน (ป้ายทะเบียน, ประเภท, ประกัน, พ.ร.บ.)    │
│  ├── QR Code ติดรถทุกคัน                                         │
│  ├── กำหนดรอบซ่อมบำรุง (กี่ km หรือกี่เดือน)                     │
│  └── เชื่อมกับ NexMaint: แจ้งซ่อมอัตโนมัติ                       │
│                                                                  │
│  NexSpeed — ข้อมูลพื้นฐานระบบขนส่ง                               │
│  ├── ประเภทรถ (รถบรรทุก 4/6/10ล้อ, รีเฟอร์, Trailer)             │
│  ├── โซนพื้นที่ขนส่ง + สถานที่รับ-ส่ง (Location Master)          │
│  ├── ลูกค้า (Customer Master)                                    │
│  └── ราคาค่าขนส่งตามสัญญา (ต่อเส้นทาง/น้ำหนัก/ประเภทรถ)         │
└──────────────────────────────────────────────────────────────────┘
```

---

---

# 🔵 Type 1: FTL / LTL Trucking (ขนส่ง B2B ระหว่างเมือง)

> **FTL** = Full Truck Load (เต็มคัน) | **LTL** = Less Than Truck Load (แบ่งพื้นที่)  
> ลูกค้า: โรงงาน, Distributor, ห้างสรรพสินค้า, บริษัทส่งออก

---

## 📋 กระบวนการ FTL/LTL — End to End

### 🟦 LANE A: ลูกค้า (Customer) — รับ Order

```
[ช่องทางหาลูกค้า & รับ Order]
        │
        ├── ติดตามลูกค้าใหม่ (Lead/Prospect) ด้วยระบบ CRM Pipeline
        ├── [ช่อง 1] โทรศัพท์ / LINE → Dispatcher รับคำสั่ง
        ├── [ช่อง 2] NexPortal → ลูกค้า B2B Login แล้วกรอก Transport Request Form
        └── [ช่อง 3] NexConnect → ส่ง Order จากระบบลูกค้า (API-to-API)
               │
               ▼
        [NexSales] — บริหารงานขาย & บันทึก Order
        ├── ตรวจสอบข้อมูลลูกค้า (Credit Limit, สัญญา)
        ├── ออก Quotation ส่งให้ลูกค้าพิจารณา
        │       └── [NexApprove] ← อนุมัติราคาพิเศษ/ให้ส่วนลด (ผ่าน Approval Workflow Builder)
        ├── ลูกค้ายืนยัน (Win) → เปลี่ยนสถานะเป็น Transport Order
        └── ส่งต่อ → [NexSpeed] เพื่อจัดสรรรถ
```

**ผู้รับผิดชอบ:** Sales Coordinator, Dispatcher

---

### 🟩 LANE B: ฝ่าย Dispatch — จัดรถและคนขับ (ทำคู่ขนานกับ Lane A)

```
[NexSpeed] — Dispatch Board (Control Tower)
        │
        ├── ดู Transport Order ที่รอจัดรถ
        ├── ตรวจสอบรถว่าง (Vehicle Availability)
        │       └── [NexAsset] ← สถานะรถแต่ละคัน
        ├── ตรวจสอบคนขับว่าง
        │       └── [NexForce] ← Shift + วันหยุด + ใบขับขี่หมดอายุ
        ├── จับคู่ รถ ↔ คนขับ ↔ ทริป
        ├── Route Planning (วางเส้นทาง หลายจุดส่ง)
        └── สร้าง Trip → ส่งงานไป Driver App
```

**ผู้รับผิดชอบ:** Dispatcher

---

### 🟨 LANE C: คนขับ (Driver) — ปฏิบัติงานจริง (Mobile App)

```
[NexSpeed — Driver App บนมือถือ]
        │
        ├── รับแจ้งเตือน "มีทริปใหม่"
        ├── ดูรายละเอียด: จุดรับ, จุดส่ง, สินค้า, ลูกค้า
        ├── ตรวจสภาพรถก่อนออกเดินทาง
        │       └── Vehicle Inspection: เช็คลิสต์ + ถ่ายรูป
        ├── กด "รับงาน" → สถานะเปลี่ยนเป็น "กำลังเดินทาง"
        ├── GPS Tracking เริ่มทำงาน (Real-time)
        │       └── [NexSite] ← ลูกค้าติดตามสถานะได้
        ├── ถึงจุดรับสินค้า → กด "รับสินค้าแล้ว" + ถ่ายรูป
        ├── เดินทางถึงปลายทาง
        └── POD (Proof of Delivery)
                ├── ขอลายเซ็นลูกค้าบนมือถือ
                ├── ถ่ายรูปสินค้าที่ส่ง + ป้ายหน้าบ้าน/โกดัง
                └── กด "ส่งสำเร็จ" → ทริปปิด
```

**ผู้รับผิดชอบ:** พนักงานขับรถ (Driver)

---

### 🟥 LANE D: ลูกค้าติดตามสถานะ (คู่ขนาน)

```
[NexPortal — B2B Customer Portal]
        │
        ├── ลูกค้า Login ดูสถานะ Shipment และประวัติการขนส่งของตัวเอง
        ├── ดู GPS Live Map ว่ารถอยู่ที่ไหนแบบ Real-time
        ├── [NexCore — Notification Engine] ส่งแจ้งเตือน SMS/Email/LINE เมื่อ:
        │       ├── รถออกจากต้นทางแล้ว
        │       ├── ใกล้ถึงปลายทาง (ETA)
        │       └── ส่งสำเร็จ (พร้อมรูปถ่าย POD)
        ├── Download e-Delivery Note และ e-Tax Invoice ได้ด้วยตัวเอง
        └── ตรวจสอบ Statement/ยอดค้างชำระ (ลดภาระแอดมินตอบคำถาม)
```

**ผู้รับผิดชอบ:** ลูกค้าขนส่ง B2B (Self-service)

---

### 🟪 LANE E: การเงิน (คู่ขนาน — ทำตลอดเวลา)

```
เมื่อ POD สำเร็จ → [NexSpeed] ส่งสัญญาณ อัตโนมัติ (ผ่าน Notification Engine)
        │
        ▼
[NexFinance — Accounts Receivable & AP]
        ├── ออก Invoice ลูกค้า (อัตโนมัติจาก Rate + น้ำหนัก/ระยะทาง)
        ├── วางบิลอิเล็กทรอนิกส์ส่งทาง Email อัตโนมัติ
        ├── กรณีจ้างรถร่วม: ทำ 3-Way Matching (PO + Receipt + Invoice) ก่อนจ่ายเงิน
        ├── ลูกค้าชำระเงิน (โอน / เช็ค)
        │       └── [NexFinance] ← บันทึกรับชำระ
        └── ทีมบัญชีกระทบยอด (Bank Statement Reconciliation)

[NexTax] — คู่ขนาน
        ├── ออก e-Tax Invoice ส่งให้ลูกค้าและกรมสรรพากรโดยตรง
        ├── บันทึก VAT ขาย / VAT ซื้อ
        └── สรุป ภ.พ.30 รายเดือน
```

**ผู้รับผิดชอบ:** Finance / ฝ่ายบัญชี

---

## 🔄 Flow ย่อ FTL/LTL (สรุป)

```
ลูกค้าสั่งผ่าน NexPortal / Sales → [NexSales] (CRM + Order)
                     ↓
             [NexSpeed] จัดรถ + คนขับ
              ↙️                 ↘️
    [NexForce]              [NexAsset]
    ลงเวลา GPS / Shift       รถสภาพพร้อม
              ↘️                 ↙️
             [NexSpeed] สร้าง Trip
                     ↓
             Driver App — เดินทาง + GPS Check-in
                     ↓
             GPS ติดตาม → [NexPortal] ลูกค้าดู
                     ↓
             POD สำเร็จ (Notification Alert)
                     ↓
             [NexFinance] 3-Way Matching / ออก Invoice
                     ↓
             [NexTax] e-Tax Invoice สรรพากร
                     ↓
             [NexBI] Dashboard กำไร/ขาดทุน
```

---

---

# 🟡 Type 2: Last-Mile Delivery (ส่งพัสดุถึงมือผู้รับ)

> ลักษณะ: รถมอเตอร์ไซค์/รถกระบะ, ส่งหลายจุดต่อวัน, COD เก็บเงินปลายทาง  
> ลูกค้า: E-commerce, ร้านค้าออนไลน์, Shopee/Lazada Seller

---

## 📋 กระบวนการ Last-Mile — End to End

### 🟦 LANE A: รับ Order / พัสดุ

```
[ช่องทางรับ Order]
        │
        ├── [NexConnect] ← Sync จาก Shopee / Lazada / TikTok Shop อัตโนมัติ
        ├── [NexSales] ← ลูกค้าสั่งตรง (Walk-in หรือโทรสั่ง)
        └── [API] ← ระบบลูกค้าส่งมาโดยตรง
               │
               ▼
        [NexDelivery] — Hub Management
        ├── รับพัสดุเข้า Hub (สแกน Barcode)
        ├── จัดเรียงตาม Zone / เขต
        └── สร้าง Delivery Route ต่อ Rider
```

---

### 🟩 LANE B: จัดเส้นทางและมอบหมาย Rider

```
[NexDelivery — Route Optimization]
        │
        ├── คำนวณเส้นทางที่สั้นที่สุด (Micro-routing)
        │       ├── แบ่งตาม Zone
        │       └── คำนึงถึง: น้ำหนัก, จำนวนจุดส่ง, เวลา
        ├── มอบหมายพัสดุให้ Rider แต่ละคน
        └── Rider รับ List งานใน App
```

---

### 🟨 LANE C: Rider ออกส่ง (Mobile App)

```
[NexDelivery — Rider App]
        │
        ├── เห็น List พัสดุที่ต้องส่งวันนี้
        ├── เรียงลำดับตามเส้นทาง (Map นำทาง)
        ├── สแกน QR พัสดุก่อนออก
        ├── ถึงบ้านผู้รับ
        │       ├── [มีคน] โอนพัสดุ, ถ่ายรูป + ลายเซ็น
        │       └── [ไม่มีคน] ถ่ายรูปหน้าบ้าน, บันทึกเหตุผล
        │               └── นัดส่งซ้ำ (Reattempt)
        └── เก็บเงินปลายทาง (COD)
                ├── รับเงินสด → บันทึกใน App
                └── ส่งกระเป๋าเงินวันสิ้นวัน → Hub
```

**ผู้รับผิดชอบ:** Rider / พนักงานส่งพัสดุ

---

### 🟥 LANE D: ผู้รับพัสดุติดตาม (คู่ขนาน)

```
[NexPortal / Notification Engine]
        │
        ├── ผู้รับได้รับ Link ติดตามพัสดุผ่าน SMS/LINE Alert
        ├── เห็น: Rider อยู่ที่ไหน, ETA กี่นาที (GPS Real-time)
        └── แจ้งเตือน Notification "Rider มาถึงหน้าบ้านแล้ว"
```

---

### 🟪 LANE E: สรุปยอด COD (สิ้นวัน)

```
[NexDelivery — COD Reconciliation]
        │
        ├── Rider ส่งกลับ Hub: พัสดุที่ส่งไม่ได้ + เงิน COD
        ├── Hub นับเงิน + กระทบยอดกับระบบ
        └── [NexFinance] ← โอนเงิน COD ให้ลูกค้า (ร้านค้า)
                └── หักค่าบริการขนส่งก่อนโอน
```

**ผู้รับผิดชอบ:** Hub Manager, Finance

---

## 🔄 Flow ย่อ Last-Mile (สรุป)

```
Order เข้า [NexConnect/NexSales]
        ↓
[NexDelivery] Hub รับพัสดุ + จัดเส้นทาง
        ↓
Rider App — ออกส่ง + GPS Track
        ↓
ส่งสำเร็จ: ถ่ายรูป + ลายเซ็น / เก็บ COD
        ↓
[NexSite] ผู้รับดูสถานะ
        ↓
สิ้นวัน: [NexFinance] สรุป COD + ออก Invoice
        ↓
[NexBI] ยอดส่ง รายเขต / รายวัน Dashboard
```

---

---

# 🔵 Type 3: Cold Chain (ขนส่งห้องเย็น / ควบคุมอุณหภูมิ)

> ลักษณะ: รถห้องเย็น, ตรวจอุณหภูมิตลอดการเดินทาง  
> ลูกค้า: โรงงานอาหาร, ซูเปอร์มาร์เก็ต, โรงพยาบาล, ยาและวัคซีน

---

## 📋 กระบวนการ Cold Chain — End to End

### ⚙️ จุดพิเศษของ Cold Chain vs ขนส่งปกติ

```
Cold Chain มีขั้นตอนพิเศษเพิ่มเติม:
        │
        ├── ✅ ตรวจวัดอุณหภูมิก่อนรับสินค้า
        ├── ✅ บันทึก Temperature Log ระหว่างทาง
        ├── ✅ แจ้งเตือนถ้าอุณหภูมิเกิน threshold
        └── ✅ ส่ง Temperature Report พร้อม Delivery Note
```

---

### 🟦 LANE A: รับ Order + ตรวจสอบเงื่อนไข

```
[NexSales] — รับ Cold Chain Order
        │
        ├── ระบุ:
        │   ├── ประเภทสินค้า (อาหาร / ยา / วัคซีน)
        │   ├── อุณหภูมิที่ต้องการ (0-4°C / -18°C ฯลฯ)
        │   └── Time Window (ต้องถึงก่อนกี่โมง)
        └── [NexApprove] ← ถ้าสินค้าพิเศษ ต้องอนุมัติเงื่อนไขพิเศษ
```

---

### 🟩 LANE B: จัดรถห้องเย็น + ตรวจสภาพก่อนออก

```
[NexSpeed] — จัดรถ + ตรวจสอบ
        │
        ├── เช็คว่ารถห้องเย็นคันไหนว่าง
        │       └── [NexAsset] ← สถานะรถ + ประวัติซ่อม
        ├── ตรวจสอบระบบความเย็นก่อนออก
        │       └── NexAsset: บันทึก Pre-trip Inspection
        ├── Pre-cooling รถ (ทำให้เย็นถึงอุณหภูมิที่ต้องการก่อน)
        └── เมื่อรถพร้อม → Driver App รับงาน
```

---

### 🟨 LANE C: คนขับ + อุณหภูมิ Monitoring (คู่ขนาน)

```
[NexSpeed — Driver App] + [NexIoT — Sensor Hub]
        │
        ├── Driver รับสินค้า → ตรวจวัดอุณหภูมิ ณ จุดรับ
        │       └── ถ่ายรูป + บันทึกค่าผ่าน App
        ├── ระหว่างเดินทาง: Cold Chain Monitoring
        │       ├── [NexIoT] สัญญาณ Temperature Sensor ติดรถ อัปเดตทุก X นาที
        │       └── ถ้า! อุณหภูมิเกิน Threshold ที่กำหนดไว้
        │               ├── [Notification Engine] ยิง Alert ให้ Driver ทันที
        │               ├── แจ้ง Dispatcher / Operation Manager
        │               └── บันทึก Incident Log เข้าระบบโดยอัตโนมัติ
        ├── ถึงปลายทาง → ตรวจวัดอุณหภูมิอีกครั้ง
        └── POD: ลายเซ็น + รูป + ค่าอุณหภูมิสุดท้ายที่แนบในเอกสาร
```

---

### 🟥 LANE D: ลูกค้าดู Temperature Report

```
[NexSite — Customer Portal]
        │
        ├── ดู Temperature Log ตลอดการขนส่ง (Graph)
        ├── Download Certificate of Temperature (PDF)
        └── ใช้เป็นหลักฐานสำหรับ Food Safety / FDA
```

---

### 🟧 LANE E: ซ่อมบำรุงระบบความเย็น (คู่ขนาน)

```
[NexMaint — Preventive Maintenance]
        │
        ├── กำหนดรอบออโต้เช็คระบบทำความเย็น (จากประวัติระยะทาง)
        ├── Notification Engine แจ้งเตือนล่วงหน้า 7 วัน
        ├── สร้าง Work Order ส่งให้ทีมช่าง
        │       ├── ช่างซ่อมรับงานผ่าน Mobile App → [NexField] (Technician App)
        │       ├── สแกน Asset บันทึกรูปถ่ายก่อน/หลังซ่อมผ่านมือถือ
        │       └── เบิกอะไหล่ผ่าน → [NexProcure]
        └── ประวัติและค่าใช้จ่ายเชื่อมโยง → [NexAsset] และ [NexCost]
```

**ผู้รับผิดชอบ:** ทีมช่างซ่อมยานพาหนะ (ใช้งานแอป NexField), Maintenance Manager

---

## 🔄 Flow ย่อ Cold Chain (สรุป)

```
Order เข้า [NexSales] CRM + ระบุ Temp Range
        ↓
[NexSpeed] จัดรถห้องเย็น + ตรวจสภาพตู้
        ↓ (คู่ขนาน)
[NexMaint] ยิงแจ้งเตือนรอบบำรุงรักษา
        ↓
Driver รับสินค้า + บันทึกอุณหภูมิ
        ↓
[NexIoT] ส่ง Temp Log ตลอดทาง เข้า Dashboard
        ↓ (Notification Alert ทันทีถ้าเกิน Threshold)
POD สำเร็จ พร้อม Temperature Report แทรกในเอกสาร
        ↓
[NexPortal] ลูกค้า Download Certificate
        ↓
[NexFinance] ออก Invoice + [NexTax] ออก e-Tax
```

---

---

# 🟤 Type 4: Container / Port Logistics (ตู้คอนเทนเนอร์ / ท่าเรือ)

> ลักษณะ: รับ-ส่งตู้สินค้าจากท่าเรือ / ลาน Container  
> ลูกค้า: Importer, Exporter, Freight Forwarder, Customs Broker

---

## 📋 กระบวนการ Container — End to End

### 🟦 LANE A: รับ Order + ตรวจสอบเอกสาร

```
[NexSales] — รับ Container Order
        │
        ├── ระบุ:
        │   ├── หมายเลขตู้ (Container No.)
        │   ├── ท่าเรือต้นทาง / ปลายทาง
        │   ├── ประเภทตู้ (20ft / 40ft / Reefer)
        │   └── วัน-เวลาที่ต้องรับ (Cut-off Time)
        └── [NexLess] ← แนบเอกสาร: B/L, Permit, ใบขนสินค้า
```

---

### 🟩 LANE B: จัดคิวรถเข้าท่าเรือ (Queue Management)

```
[NexSpeed — Queue Management]
        │
        ├── จองคิวรถเข้า-ออกท่าเรือ
        ├── แจ้งเตือน Driver: "คิวของคุณกี่โมง"
        ├── Live Map รถรอคิวหน้าท่า
        └── เชื่อมต่อ API ท่าเรือ (ถ้ามี): ตรวจสถานะตู้
```

---

### 🟨 LANE C: รับ-คืนตู้ + ลานพัก Container

```
[NexSpeed + NexStock — Container Yard]
        │
        ├── บันทึกรับตู้จากท่า (สแกน Container No.)
        ├── ตรวจสภาพตู้ก่อนรับ (ถ่ายรูปทุกด้าน)
        ├── พักตู้ที่ลาน → บันทึก Slot / ตำแหน่ง
        │       └── [NexStock] ← บริหาร Container Yard
        ├── ลูกค้ามารับตู้ → จ่ายออก
        └── คืนตู้เปล่าท่าเรือ → บันทึก Seal No.
```

---

### 🟥 LANE D: ติดตามสถานะตู้ (คู่ขนาน)

```
[NexPortal — B2B Tracking Portal]
        │
        ├── Importer/Exporter Login ตรวจสอบสถานะตู้คอนเทนเนอร์ Real-time
        ├── ดูตำแหน่ง GPS, ETA ท่าเรือ, วันที่ค้างลาน (Demurrage Day)
        ├── โหลดเอกสาร Custom Clearance ผ่าน Portal
        └── Download: e-Delivery Note, ใบรับตู้ (EIR), e-Tax Invoice
```

---

### 🟧 LANE E: ค่าใช้จ่ายพิเศษ Port (คู่ขนาน)

```
[NexFinance — Special Charges]
        │
        ├── Detention Fee (ตู้เกินกำหนด)
        ├── Demurrage (ค่าวางตู้ที่ท่า)
        ├── Port Surcharge
        └── ออก Invoice รวมค่าใช้จ่ายทั้งหมด
```

---

## 🔄 Flow ย่อ Container/Port (สรุป)

```
Order ลูกค้าเข้า [NexPortal]/[NexSales] + เอกสารแนบผ่าน [NexLess]
        ↓
[NexSpeed] จองคิวท่าเรือ + จัดรถ Trailer ลากตู้
        ↓
Driver รับตู้ที่ท่าเรือ → ถ่ายรูปตู้ส่งเข้าระบบ Check-in
        ↓ (คู่ขนาน)
[NexPortal] ลูกค้าตรวจสอบสถานะผ่าน Web/App
        ↓
พักตู้ที่ลาน [NexStock — Container Yard]
        ↓
คืนตู้เปล่า / ท่าเรือ
        ↓
[NexFinance] 3-Way Matching เคลียร์ค่า Port/Demurrage
        ↓
[NexBI] รายงาน Turnaround Time per Container
```

---

---

# 🔄 Master Integration Map (ทุกประเภทขนส่ง)

```
                   ┌─────────────────────────────┐
                   │         NexCore             │
                   │   SSO / Role / Permission   │
                   └─────────────┬───────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ↓                  ↓                  ↓
         [NexForce]         [NexAsset]         [NexSales]
         พนักงาน/คนขับ      ยานพาหนะ/ตู้        รับ Order
         Shift/ลา           รอบซ่อม             Quotation
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 ↓
                           [NexSpeed]
                     ─────────────────────
                     FTL | LTL | Cold Chain
                     Container | Queue Mgmt
                     Dispatch Board
                     GPS Tracking
                     Driver App
                           │        │
              ┌────────────┘        └───────────────┐
              ↓                                     ↓
       [NexDelivery]                         [NexPortal]
       Last-Mile / Rider                   Customer Portal (B2B)
       COD Reconciliation                  Shipment Tracking
       Micro-Routing                       e-Delivery Note, GPS Map
              │                                     │
              └──────────────┬──────────────────────┘
                             ↓
                    [NexFinance]
              ─────────────────────────
              AR: Invoice ลูกค้า
              AP: จ่าย Vendor/รถร่วม
              GL: บันทึกบัญชีทุก Txn
              Bank Reconciliation
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
          [NexTax]      [NexPayroll]    [NexCost]
          VAT/WHT       เงินเดือน       ต้นทุนต่อทริป
          ภาษีรายเดือน  คนขับ/พนักงาน   กำไร/ขาดทุน

[NexMaint]   ── ซ่อมบำรุงรถและระบบความเย็น
[NexProcure] ── สั่งซื้ออะไหล่ / น้ำมัน
[NexStock]   ── สต็อกอะไหล่ / ยางรถ / Container Yard
[NexApprove] ── อนุมัติ PO / ส่วนลด / ค่าใช้จ่ายพิเศษ
[NexLess]    ── เอกสาร: ใบขนสินค้า, ใบอนุญาต, สัญญา
[NexConnect] ── เชื่อม API ลูกค้า / ท่าเรือ / Marketplace
[NexAudit]   ── บันทึก Log ทุก Action และความปลอดภัย
[NexBI]      ── Dashboard รวม KPI ทุกประเภทขนส่ง
```

---

# ⚡ Trigger Events อัตโนมัติ (ไม่ต้องทำมือ)

| เหตุการณ์ | แอปต้นทาง | แอปปลายทาง | ผลลัพธ์ |
|---|---|---|---|
| Order ยืนยัน | NexSales | NexSpeed | สร้าง Transport Order |
| Trip สร้างแล้ว | NexSpeed | Driver App | แจ้งเตือนคนขับ |
| รถออกเดินทาง | Driver App | NexSite | ลูกค้าเห็นสถานะ |
| อุณหภูมิเกิน limit | IoT Sensor | Driver + Dispatcher | Alert ฉุกเฉิน |
| POD สำเร็จ | Driver App | NexFinance | สร้าง Invoice อัตโนมัติ |
| Invoice ออกแล้ว | NexFinance | NexTax | บันทึก VAT ขาย |
| ส่งไม่สำเร็จ | Driver App | NexSales | สร้าง Reattempt Task |
| รถถึงรอบซ่อม | NexAsset | NexMaint | สร้าง Work Order |
| อะไหล่ต่ำกว่า Min | NexStock | NexProcure | สร้าง PR อัตโนมัติ |
| สิ้นเดือน | NexForce | NexPayroll | สรุป Timesheet คนขับ |
| Payroll อนุมัติ | NexPayroll | NexFinance | บันทึก Salary Entry |
| ทุก Transaction | ทุกแอป | NexBI | อัปเดต Dashboard |

---

# 👤 ใครใช้แอปไหน — Logistics Business

| ตำแหน่ง | แอปหลัก | แอปรอง | บนมือถือ |
|---|---|---|---|
| **CEO / MD** | NexBI | NexFinance | ✅ Dashboard |
| **Operations Manager** | NexSpeed | NexBI, NexAsset | ✅ Control Tower |
| **Dispatcher** | NexSpeed (Dispatch) | NexForce (GPS Check-in), NexAsset | ✅ Assign Trip |
| **คนขับรถ (Driver)** | NexSpeed App | NexForce | ✅ Driver App |
| **Rider (Last-mile)** | NexDelivery App | NexForce | ✅ Rider App |
| **ช่างซ่อมยานพาหนะ** | NexMaint | NexAsset | ✅ NexField (มือถือช่าง) |
| **ฝ่ายบัญชีและการเงิน** | NexFinance | NexTax (e-Tax), NexApprove | ⚡ อนุมัติการจ่าย 3-Way |
| **Payroll Admin** | NexPayroll | NexForce | — |
| **ฝ่ายจัดซื้อ (Procurement)**| NexProcure | NexStock | ⚡ อนุมัติผ่าน Flow |
| **พนักงานขาย (Sales)** | NexSales (CRM) | NexPortal, NexApprove | ✅ จัดการ Order/Lead |
| **IT Admin / HR** | NexCore (Notification), NexAudit | NexConnect | — |
| **ลูกค้า (B2B / B2C)** | NexPortal (Tracking) | — | ✅ ติดตามพัสดุ (Self-service) |

---

# 📊 KPI Dashboard — NexBI สำหรับ Logistics

| KPI | คำนวณจาก | ความหมาย |
|---|---|---|
| **OTD % (On-Time Delivery)** | NexSpeed | ส่งตรงเวลากี่ % |
| **Trip Completion Rate** | NexSpeed | ทริปสำเร็จ / ทั้งหมด |
| **Average Turnaround Time** | NexSpeed | เวลาเฉลี่ยต่อทริป |
| **Fuel Cost per KM** | NexCost | ต้นทุนน้ำมันต่อ KM |
| **Revenue per Trip** | NexFinance | รายได้เฉลี่ยต่อทริป |
| **Fleet Utilization %** | NexAsset | รถถูกใช้งานกี่ % |
| **Driver Scorecard** | NexForce | ประสิทธิภาพคนขับ |
| **Maintenance Cost** | NexMaint + NexCost | ค่าซ่อมรวม |
| **Customer Claim Rate** | NexSales | Complaint ต่อ 100 ทริป |
| **Temperature Compliance** | NexSpeed (Cold Chain) | อุณหภูมิได้มาตรฐาน % |
| **COD Collection Rate** | NexDelivery | เก็บเงิน COD สำเร็จ % |
| **Container Turnaround** | NexStock/Speed | วันเฉลี่ยต่อตู้ |

---

# 🗓️ Timeline ตัวอย่าง — ทริป FTL ครบวงจร

```
วันที่ 1 บ่าย ─── ลูกค้าโทร/ส่ง Order ผ่าน NexSales
                  └── CS ยืนยัน Rate + สร้าง Transport Order

วันที่ 1 เย็น ─── [NexSpeed] Dispatch จัดรถ + คนขับ
                  ├── ตรวจใบขับขี่ + Shift [NexForce]
                  └── ตรวจรถว่าง + ประวัติซ่อม [NexAsset]

วันที่ 2 เช้า ─── คนขับตรวจรถ (Vehicle Inspection)
                  ├── ถ่ายรูป + เช็คลิสต์ใน Driver App
                  └── รับสินค้า + ถ่ายรูปก่อนขึ้นรถ

[คู่ขนาน] ─────── [NexMaint] ตรวจว่ารถถึงรอบซ่อมไหม
                  └── ถ้ายัง OK → ออกเดินทางได้

วันที่ 2 เดินทาง ─ GPS Tracking Real-time
                  └── [NexSite] ลูกค้าเห็นแผนที่ + ETA

[คู่ขนาน] ─────── [NexFinance] เตรียม Draft Invoice ล่วงหน้า

วันที่ 2 บ่าย ─── ถึงปลายทาง → ขนถ่าย
                  └── POD: ลายเซ็น + รูปถ่าย

วันที่ 2 เย็น ─── ทริปปิด อัตโนมัติ:
                  ├── [NexFinance] สร้าง Invoice ส่งลูกค้า Email
                  └── [NexTax] บันทึก VAT ขาย

วันที่ 3–30 ───── [NexFinance] ติดตามชำระเงิน (AR)
                  └── ลูกค้าโอน → บันทึก Receipt

สิ้นเดือน ─────── [NexPayroll] คนขับได้รับเงินเดือน + ค่าทริป
                  [NexBI] Dashboard: OTD%, Revenue, Cost Per Trip
```

---

# 🏗️ แผนการพัฒนา (Priority สำหรับ Logistics)

| Phase | แอป | สิ่งที่ได้ |
|---|---|---|
| **Phase 0** | NexCore | SSO, Roles พร้อมใช้ |
| **Phase 1** | NexSpeed, NexForce, NexAsset | ระบบขนส่ง + HR + รถพร้อม |
| **Phase 2** | NexSales, NexFinance, NexPayroll | ขายได้ + เก็บเงินได้ + จ่ายเงินได้ |
| **Phase 3** | NexDelivery, NexMaint, NexProcure | Last-mile + ซ่อมรถ + ซื้ออะไหล่ |
| **Phase 3** | NexTax, NexCost, NexApprove | ภาษีถูกต้อง + ต้นทุนชัดเจน |
| **Phase 4** | NexBI, NexSite, NexConnect, NexLess | Dashboard + Portal ลูกค้า + API |

---

_เอกสารจัดทำโดย: NexOne Development Team_  
_กรณีศึกษา: ธุรกิจขนส่ง / Logistics Business_  
_ปรับปรุงล่าสุด: April 2026_

---

## 🎯 สรุปฟีเจอร์หลักที่ต้องพัฒนา (Master Plan)
รายการฟีเจอร์ด้านล่างคือ **Gap Features** ที่ต้องพัฒนาเข้าสู่ระบบ NexOne เพื่อให้รองรับธุรกิจ Logistics ได้อย่างสมบูรณ์:

### 1. ฟีเจอร์หลัก (Core Extensions)
- **CRM Pipeline (NexSales)**: บริหารจัดการ Lead และ Funnel งานขายขนส่ง
- **GPS Check-in / Check-out (NexForce)**: พนักงานขับรถลงเวลาด้วย GPS
- **Mobile App - Driver (NexField)**: แอปเฉพาะสำหรับพนักงานขับรถขนส่ง

### 2. ฟีเจอร์ข้ามแอป (Cross-cutting)
- **Customer Portal Login (NexPortal)**: ลูกค้าเช็คสถานะการขนส่ง / GPS Real-time
- **3-Way Matching (NexFinance)**: กระทบยอดเช่ารถร่วม (PO + รับงาน + Invoice)
- **e-Tax Invoice (NexTax)**: ออกใบกำกับภาษีอิเล็กทรอนิกส์
- **Dashboard Builder**: กราฟวิเคราะห์ประสิทธิภาพเส้นทางขนส่ง

