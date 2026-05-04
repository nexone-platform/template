# 🍽️ NexOne Platform — คู่มือสำหรับธุรกิจอาหารและเครื่องดื่ม (F&B)

**Document Version:** 1.0 | **Date:** April 2026
**Path:** `docs/business_concept/05_fnb.md`

---

## 🏢 ประเภทธุรกิจที่ครอบคลุม

| # | ประเภท | ลักษณะธุรกิจ | ตัวอย่าง |
|---|---|---|---|
| **Type 1** | **ร้านอาหาร / Single Restaurant** | หน้าร้านเดียว ทั้ง Dine-in + Takeaway | ร้านอาหาร, Café, Bistro |
| **Type 2** | **Chain Restaurant / Franchise** | หลายสาขา, ครัวกลาง, มาตรฐานเดียวกัน | MK, The Pizza Company, ก๋วยเตี๋ยว Franchise |
| **Type 3** | **Cloud Kitchen / Ghost Kitchen** | ผลิตเพื่อ Delivery เท่านั้น ไม่มี Dine-in | Multi-Brand Kitchen, Delivery-Only |
| **Type 4** | **Catering / งานจัดเลี้ยง** | รับจ้างทำอาหารสำหรับงานกิจกรรม | งานแต่ง, Conference, Corporate Catering |

---

## ⚙️ STEP 0 — ตั้งค่าระบบก่อนเริ่มใช้งาน

```
NexCore:
├── ลงทะเบียนร้าน / บริษัท (**Multi-Branch Central** สำหรับ Franchise แยกสาขาแต่รวมศูนย์)
├── Role: Owner, Branch Manager, Server, Chef, Cashier, Delivery
└── SSO ทุก Device: POS Tablet, Kitchen Display, Manager App

NexSales:
├── Menu Master Data (รายการอาหาร, ราคา, หมวดหมู่)
├── **Recipe / BOM Management** (สูตรอาหารต่อเมนู / สัดส่วนประกอบเพื่อตัดสต็อก)
├── Price Tier: ราคา Dine-in vs Delivery vs Catering
└── Promotion Engine & **Membership / Package** (สะสมแต้ม, บุฟเฟ่ต, คอร์ส)

NexStock:
├── วัตถุดิบ (Ingredient) + หน่วย (กรัม, ลิตร, ชิ้น)
├── Min Stock / Reorder Point ต่อวัตถุดิบ
├── **FEFO + Expiry Alert**: ของสดหมดอายุก่อน ออกก่อน พร้อมแจ้งเตือนล่วงหน้า
└── **Waste / Spoilage Tracking**: บันทึกของที่ทิ้งเพื่อคำนวณ Actual Food Cost อย่างหลีกเลี่ยงไม่ได้

NexPOS:
├── UI เมนูพร้อมรูปภาพ, แบ่งหมวดหมู่
├── Table Layout (แผนผังโต๊ะ)
└── Split Bill, Void, Discount

NexForce:
├── กะพนักงาน (เช้า/บ่าย/ดึก)
├── พนักงาน Part-time / Full-time
└── Skill: Chef Level, Barista Cert
```

---

## 🔵 Type 1: Single Restaurant

### กระบวนการ Dine-in

#### LANE A: ลูกค้าเดินเข้าร้าน → สั่งอาหาร

```
ลูกค้าเดินเข้าร้าน / จอง (Walk-in / จองโต๊ะ)
        │
        ├── [NexSales — **Booking / Reservation**]
        │       ├── จองโต๊ะล่วงหน้า (Online / โทร) สำหรับ Dine-in หรือจัดเลี้ยง
        │       └── Reminder SMS 1 ชม. ก่อน
        │
        ▼
[NexPOS — หน้าจอ Server / QR Code โต๊ะ]
        ├── เลือกโต๊ะ → เปิด Order
        ├── ลูกค้าสแกน QR → สั่งเองบน Mobile (**Self-Order / QR Order**)
        │       หรือ Server รับออเดอร์แทน
        ├── ตรวจสอบ **Membership / Package** (กรณีลูกค้ามีคอร์สบุฟเฟ่ต์หรือส่วนลดพิเศษ)
        ├── ส่ง Order → [**Kitchen Display System (KDS)**]
        │       ├── ครัวเห็นออเดอร์บน Screen แยกตาม Station แบบ Real-time
        │       ├── ครัวเย็น: สลัด, เครื่องดื่ม
        │       └── ครัวร้อน: อาหารจานหลัก
        └── [NexStock] ← ตัดวัตถุดิบตาม **Recipe / BOM Management** อัตโนมัติเมื่อขาย
```

#### LANE B: ครัว — เตรียมและส่งอาหาร (คู่ขนาน)

```
[**Kitchen Display System (KDS)**] ← รับ Order จาก NexPOS หรือมือถือลูกค้า
        │
        ├── แสดง Order พร้อม Timer นับถอยหลัง (SLA)
        ├── Chef กด "เริ่มทำ" → "เสร็จ" (ระบบแยกทำทีละ Station)
        ├── Runner รับอาหาร → เสิร์ฟโต๊ะ
        └── เวลาเฉลี่ย: ครัวในเป้าหมายหรือไม่? → [NexBI]
```

#### LANE C: ชำระเงิน + ปิดโต๊ะ

```
[NexPOS — ชำระเงิน]
        ├── ดูรายการทั้งหมดของโต๊ะ
        ├── เพิ่ม/ลด รายการสุดท้าย
        ├── **Approval Workflow Builder**: ขออนุมัติเมื่อมีคำสั่ง Void บิล / ลดราคากรณีพิเศษผ่านแอป
        ├── Split Bill: แบ่งบิลต่อคน/ต่อรายการ
        ├── สะสมแต้ม **Loyalty Points / Reward** จากยอดซื้อ หรือแลกแต้มแทนเงินสด
        ├── ชำระ: เงินสด / QR PromptPay / บัตร / App
        ├── **Staff Tip Management**: บันทึกทิปพนักงาน (ดึงเข้า NexPayroll ตอนปลายเดือน)
        ├── ออกใบเสร็จ + **e-Tax Invoice** (Digital) ส่งกรมสรรพากรอัตโนมัติ [NexTax]
        └── ปิดโต๊ะ → คืนโต๊ะให้ว่าง
```

#### LANE D: Delivery (คู่ขนาน - ถ้าต้องการ)

```
[**NexCommerce (E-Commerce Hub)**] ← Sync เมนูและ Order จาก GrabFood / Foodpanda / LINE MAN
        │
        ├── Order เข้าระบบคิวครัวอัตโนมัติ ไม่ต้องใช้วิธีคีย์ซ้ำลง POS
        ├── ครัวผลิต → บรรจุ → ส่งให้พนักงานขับรถ Rider
        ├── (หากเป็นพนักงาน Delivery ของร้าน ใช้แอป **NexField** ดูเส้นทางนำส่งและเช็คอิน POD)
        ├── Status Update ← แจ้ง Platform Delivery อัตโนมัติ
        └── [NexFinance] ทำ **COD Reconciliation** (กระทบยอดเงินโอนจากค่าย Delivery ทุกยอดบิลสลิปรายวัน)
```

---

## 🟡 Type 2: Chain Restaurant / Franchise

### Lane เพิ่มเติมจาก Single:

#### LANE A: Central Kitchen → กระจายสาขา

```
[Central Kitchen — ครัวกลาง]
        │
        ├── ผลิต Base / Pre-made (Sauce, Dough, Stock)
        ├── บรรจุ + Label + วันผลิต/หมดอายุ
        ├── [NexProduce] บันทึก Batch Production
        └── [NexSpeed] กระจายไปสาขา ตาม Order

[แต่ละสาขา]
        ├── รับของจาก Central Kitchen
        ├── [NexStock] รับเข้าสต็อกสาขา + ตรวจสภาพ
        └── นำไปทำอาหารต่อ (Semi-prepared)
```

#### LANE B: Franchise Management / Central Admin

```
[NexCore — **Multi-Branch Central**]
        ├── จัดการศูนย์รวม: สาขาแยกกันทำงาน แต่ฝ่ายบริหารดู Report ยอดขายได้ Real-time
        ├── Menu / Recipe จัดการโดยศูนย์กลาง (ล็อคไม่ให้สาขาแก้เอง)
        └── Promotion Engine แจกจ่ายโปรให้ทุกสาขาพร้อมกัน

[NexSales — Franchise Portal]
        ├── Franchisee Login ดูยอดขายสาขาตัวเอง (Sales Performance)
        ├── Order / Requisition วัตถุดิบจาก Franchisor (Central)
        ├── [NexFinance] ทยอยหักหรือคิดค่า Royalty Fee รายเดือนอัตโนมัติ
        └── [NexBI] ใช้ **Dashboard Builder** สร้างหน้าจอเปรียบเทียบ KPI ร้านแต่ละระบบ
```

---

## 🟢 Type 3: Cloud Kitchen (Delivery Only)

```
[หลาย Brand ใน Kitchen เดียว]
        │
        ├── Brand A: อาหารไทย
        ├── Brand B: ข้าวมันไก่
        └── Brand C: สลัด/Healthy

[**NexCommerce (E-Commerce Hub)**] รับ Order จากทุก Platform แบบแนบเนียน
        ├── Grab Food (Brand A + B + C)
        ├── Foodpanda (Brand A + C)
        └── Line MAN (Brand B)

[NexPOS — Kitchen Manager View]
        ├── รวม Order ทุก Brand และจากทุก Platform เป็นคิวเดียว
        ├── จัดลำดับ Priority ตาม Deadline ส่งมอบ (SLA)
        ├── Assign Chef ในแต่ละ Station ต่อ Brand
        └── Print Label แปะถุง + ส่งบรรจุหีบห่อ

[NexDelivery / **NexField** / 3rd Party Rider]
        ├── Rider รับออเดอร์ผ่าน Mobile / โชว์ QR ตรวจความแม่นยำ Order แสกนรับงาน
        ├── รายงานกลับไปยัง Platform เมื่อ Order พร้อมเดินทาง (Update Status)
        └── [NexFinance] ดึงยอดขายสรุปทำ **COD Reconciliation** ทุกสิ้นสัปดาห์

[NexBI — **Food Cost % Dashboard**]
        └── กำไร/ขาดทุน และต้นทุนค่าขนส่ง ค่าวัตถุดิบ 100% แยกให้เห็นต่อแบรนด์ (Brand P&L)
```

---

## 🟠 Type 4: Catering / จัดเลี้ยง

```
ลูกค้าขอใบเสนอราคางาน หรือจองออนไลน์
        │
        ▼
[NexSales] — Catering Quotation / **Booking & Reservation**
        ├── รับจองรายละเอียดงานวันและสถานจัดเลี้ยงล่วงหน้า
        ├── คำนวณจำนวนหัว (Pax) × เมนูที่เลือก × ราคา Food Cost
        ├── ค่าบริการเพิ่มเติม: ค่าเช่าอุปกรณ์, รถยนต์นำส่ง, แรงงาน Setup
        └── ออก Proposal + ส่ง Contract เช็นออนไลน์ผ่าน [NexLess]

[NexProduce — Catering Prep]
        ├── เปิด Work Order: ผลิตอาหารสำหรับ 200 ท่าน (สูตรแปรผันตาม BOM)
        ├── [NexStock] ดึงคลังวัตถุดิบล่วงหน้า + ตัดจ่ายให้ครัว
        └── Quality Check ของทั้งหมดว่าพร้อมโหลดขึ้นรถหรือไม่

[NexSpeed — Logistics & Dispatch]
        ├── รถส่งอาหาร + อุปกรณ์เครื่องใช้
        └── ทีมงาน Setup (สามารถใช้ **NexField** เช็คอินตอนถึงที่หมาย)

[NexFinance] Invoice Payment
        ├── งวดแรก Deposit (เช่น 50% ตอนเซ็นสัญญา มัดจำ)
        ├── ออก **e-Tax Invoice** ทันทีหลังรับเงิน
        └── งวดสุดท้าย หักที่เหลือหลังเสร็จสิ้นงาน (อาจมีหักภาษี ณ ที่จ่าย)
```

---

## 🔄 Flow ย่อ F&B (สรุป)

```
[**NexCommerce**] รับ Order Online → [NexPOS] รวม Order หน้างาน
        ↓
[**KDS Screen**] ส่งให้ครัว → [NexProduce] ผลิต → [NexStock] ตัดวัตถุดิบตาม Recipe BOM
        ↓
เสิร์ฟโต๊ะ / แพ็ค Delivery → หยิบจาก KDS → [NexPOS] รับเงิน + ตัด Void ถ้าหากทิ้ง
        ↓
[NexFinance] บันทึกรายได้ + รับชำระ COD + [NexTax] ออก **e-Tax Invoice**
        ↓ (คู่ขนาน)
[NexProcure] วัตถุดิบเริ่มน้อย/ใกล้หมดอายุ → Approval ขอซื้อใหม่ → รับเข้าตรวจเช็ค Stock
        ↓
[NexBI] แสดงยอดขายต่อสาขา, Food Cost %, อัตราของทิ้ง Waste
```

---

## ⚡ Trigger Events อัตโนมัติ

| เหตุการณ์ | แอปต้นทาง | แอปปลายทาง | ผล |
|---|---|---|---|
| Order เข้าจาก Grab/Line Man | NexCommerce | NexPOS + KDS | Order ปรากฏจอเข้าคิวในครัวทันที |
| ลูกค้าสแกน QR Table/ชำระเงิน | NexPOS | NexStock | ตัดวัตถุดิบตาม Recipe/BOM อัตโนมัติ |
| วัตถุดิบต่ำกว่า Min Stock | NexStock | NexProcure / NexApprove | เตรียม PR ส่งขอ Approval ทันที |
| ปิดการขายพร้อมใบกำกับ | NexPOS | NexTax | ส่งขอ e-Tax Invoice + บันทึกรายได้ลง NexFinance |
| รับโอนยอดรวมผ่านแอป Food | NexFinance | NexPOS | ระบบทำ 3-Way COD Reconciliation แยกบิลตรงกับยอดโอน |
| จองโต๊ะจัดเลี้ยงออนไลน์ | NexSales | Notification Engine | SMS/Email แจ้งเตือนลูกค้า + ฝ่ายประสานก่อนหน้า 1 วัน |
| วัตถุดิบหรือของสดใกล้หมดอายุ | NexStock | Notification Engine | แจ้งระดับบริหารตาม Alert ล่วงหน้า เพื่อจัดโปรระบาย (FEFO) |

---

## 📊 KPI Dashboard F&B (โดยใช้ Dashboard Builder)

| KPI | ความหมาย |
|---|---|
| **Food Cost %** | ต้นทุนวัตถุดิบ / ยอดขายสุทธิ (เป้าหมายที่ดีควรเฉลี่ย < 30%) |
| **Labor Cost %** | เงินเดือนพนักงานหน้าร้าน+หลังครัว / ยอดขายสุทธิ (เป้า < 25%) |
| **Table Turnover Rate** | รอบที่ลูกค้านั่งหมุนเวียนกี่ครั้งภายในมื้อหลัก (Lunch/Dinner) |
| **Average Ticket per Head** | ยอดขายอาหาร-เครื่องดื่ม ตีเฉลี่ย 1 ต่อคน (บาท/1 คน) |
| **Waste / Spoilage %** | มูลค่าของเสียต่อรอบ / รายได้ (ชี้ว่าคำนวน FEFO Recipe แม่นยำหรือไม่) |
| **Loyalty Contribution** | สัดส่วนลูกค้าชื้อซ้ำ หรือแสกนรับคะแนนรางวัล (Memberships) |
| **KDS Processing Time** | ระยะเวลา Production เวลาเฉลี่ยตั้งแต่เริ่มออเดอร์ในส่วนครัวถึง Serve |
| **Delivery On-Time %** | วัด SLA ระยะเวลาจัดเตรียมกับคนขับจาก GrabFood, Foodpanda |
| **Sales Performance/Branch** | สาขาไหนรุ่ง-ร่วง วัดจาก Revenue และต้นทุนแยกแต่ละพื้นที่ร้าน |

---

## 👤 ใครใช้แอปไหน

| ตำแหน่ง | แอปหลัก | Mobile |
|---|---|---|
| เจ้าของ / Management | NexBI, NexFinance, NexApprove | ✅ Dashboard / อนุมัติ |
| ผู้ช่วย / สาขา ผจก. | NexPOS, NexStock (Inventory), NexApprove | ✅ Tablet |
| แคชเชียร์ | NexPOS, NexSales (จองโต๊ะ), NexTax | 🖥 Point of Sale |
| Server / หน้าร้าน | NexPOS (Handheld QR Order) | ✅ มือถือสั่งออเดอร์ |
| Chef / ครัว | KDS (Kitchen Display System), NexProduce | 📺 Kitchen Monitor |
| พนักงานส่ง / Rider | NexField (Delivery & Routing) | ✅ มือถือคนขับ |
| จัดซื้อ (Purchasing) | NexProcure, NexStock | — |
| HR / Admin ฝ่ายบุคคล | NexForce, NexPayroll (คิดรวม Tip Management) | — |

---



---

_NexOne Development Team | F&B Business Concept | April 2026_

---

## 🎯 สรุปฟีเจอร์หลักที่ต้องพัฒนา (Master Plan)
รายการฟีเจอร์ด้านล่างคือ **Gap Features** ที่ต้องพัฒนาเข้าสู่ระบบ NexOne เพื่อให้รองรับธุรกิจ F&B (ร้านอาหาร) ได้อย่างสมบูรณ์:

### 1. ฟีเจอร์หลัก (Core Extensions)
- **Booking / Appointment Calendar (NexSales)**: จองคิวโต๊ะ
- **Package / Loyalty Points (NexSales)**: สะสมแต้มสมาชิก
- **QR Order & Table Management (NexCommerce/NexSales)**: ลูกค้าสั่งอาหารเองผ่าน QR Code
- **KDS (Kitchen Display System) (NexProduce)**: หน้าจอคิวทำอาหารในครัว
- **Recipe Management (NexProduce)**: สูตรการปรุงอาหาร ตัดสต็อกอัตโนมัติ
- **Spoilage / Waste Tracking (NexStock)**: บันทึกของเสียทิ้ง
- **FEFO Management & Expiry Alert (NexStock)**: บริหารของสด
- **Tip Management (NexPayroll)**: ระบบหาร/ปันผลทิป

### 2. ฟีเจอร์ข้ามแอป (Cross-cutting)
- **COD Reconciliation (NexFinance)**: กระทบยอด Delivery Rider
- **3-Way Matching (NexFinance)**: ซื้อวัตถุดิบ 
- **e-Tax Invoice (NexTax)**: ออกใบกำกับภาษีเต็มรูปให้ลูกค้า

