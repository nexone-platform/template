# 🛒 NexOne Platform — คู่มือสำหรับธุรกิจซื้อมาขายไป (Trading Business)

**Document Version:** 1.0 | **Date:** April 2026  
**เป้าหมาย:** แสดงกระบวนการทำงานของธุรกิจซื้อมาขายไปแต่ละประเภท  
และการเชื่อมโยงระหว่างแอปใน NexOne Platform ตั้งแต่เริ่มจนจบ

---

## 🏢 ประเภทธุรกิจที่ครอบคลุม

| # | ประเภท | ลักษณะธุรกิจ | แอปหลัก |
|---|---|---|---|
| **Type 1** | **ขายส่ง / Distributor** | ซื้อจากโรงงาน → กระจายให้ร้านค้าย่อย | NexProcure, NexStock, NexSales |
| **Type 2** | **ขายปลีก / Retail Multi-branch** | หลายสาขา, หน้าร้าน, มีสต็อกของตัวเอง | NexPOS, NexStock, NexSales |
| **Type 3** | **E-Commerce / ออนไลน์** | ขาย Shopee, Lazada, Website, แมสเซนเจอร์ | NexConnect, NexSales, NexDelivery |
| **Type 4** | **Import/Export / ตัวแทนจำหน่าย** | นำเข้าจากต่างประเทศ หรือส่งออก | NexProcure, NexLess, NexFinance |

---

## ⚙️ STEP 0 — ตั้งค่าระบบก่อนเริ่มใช้งาน (ทำครั้งเดียว)

> **ผู้รับผิดชอบ:** IT Admin / เจ้าของกิจการ / ผู้บริหาร

```
┌──────────────────────────────────────────────────────────────────┐
│  NexCore — ตั้งค่ากลาง                                           │
│  ├── ลงทะเบียนบริษัท (ชื่อ, ที่อยู่, เลขผู้เสียภาษี VAT)          │
│  ├── กำหนด Role & Permission                                     │
│  │     ├── Owner / ผู้บริหาร    → ดูข้อมูลทั้งหมด                │
│  │     ├── Sales               → รับ Order, สร้างใบเสนอราคา      │
│  │     ├── Purchasing          → ซื้อสินค้าจาก Vendor            │
│  │     ├── Warehouse           → จัดการสต็อก                     │
│  │     ├── Finance / Accounting → บัญชี, ภาษี                   │
│  │     └── Cashier (ถ้ามีหน้าร้าน) → รับเงิน, POS               │
│  └── SSO — พนักงานทุกคนใช้ Account เดียว Login ทุกแอป            │
│                                                                  │
│  NexForce — ข้อมูลพนักงาน                                        │
│  ├── เพิ่มพนักงานทุกคน                                            │
│  ├── กำหนดแผนก + ตำแหน่ง                                         │
│  └── ตั้งค่า Leave Quota, กะทำงาน                                │
│                                                                  │
│  NexSales — ตั้งค่าฝ่ายขาย                                       │
│  ├── Price List (ราคาต่อสินค้า ต่อ Tier ลูกค้า)                   │
│  ├── ลูกค้า Master Data (ชื่อ, ที่อยู่, Credit Limit, เครดิตเดย์) │
│  └── เงื่อนไขการขาย (ส่วนลด, การจัดส่ง)                          │
│                                                                  │
│  NexProcure — ตั้งค่าฝ่ายจัดซื้อ                                  │
│  ├── Vendor Master Data (ผู้ขายทุกราย)                            │
│  ├── ราคาสินค้าต่อ Vendor                                         │
│  └── วงเงินอนุมัติ PO แต่ละระดับ                                  │
│                                                                  │
│  NexStock — ตั้งค่าคลัง                                          │
│  ├── สินค้า Master Data (รหัสสินค้า, หน่วย, Barcode)             │
│  ├── หมวดหมู่สินค้า                                               │
│  ├── Location คลัง (ชั้น, Zone, Bin)                              │
│  └── Min Stock / Reorder Point ต่อสินค้า                         │
│                                                                  │
│  NexFinance — ตั้งค่าบัญชี                                       │
│  ├── Chart of Accounts                                           │
│  └── รอบบัญชี, สกุลเงิน                                          │
└──────────────────────────────────────────────────────────────────┘
```

---

---

# 🔵 Type 1: ขายส่ง / Distributor

> **ลักษณะ:** ซื้อสินค้าจากโรงงาน/Supplier จำนวนมาก → เก็บสต็อก → กระจายขายให้ร้านค้าย่อย/องค์กร  
> **ลูกค้า:** ร้านค้าปลีก, ร้านโชห่วย, Hypermarket, องค์กร  
> **ความซับซ้อน:** บริหารสต็อกจำนวนมาก, หลาย Vendor, เครดิตลูกค้า

---

## 📋 กระบวนการ Wholesale / Distributor — End to End

---

### 🟦 LANE A: ฝ่ายขาย (Sales Team)

```
ลูกค้าสั่งซื้อสินค้า
        │
        ├── [ช่องทาง] โทร / LINE / Email / ตัวแทนขายออกภาคสนาม
        │
        ▼
[NexSales] — รับ Order
        ├── ค้นหาลูกค้า → ดู Credit Limit, ยอดค้างชำระ
        ├── ตรวจสต็อกพร้อมส่ง ← [NexStock] ดูแบบ Real-time
        ├── [NexSales] Multi-Price Tier: ตั้งราคาขายส่ง / VIP / ปกติตามกลุ่มลูกค้า
        ├── สร้าง Quotation (ใบเสนอราคา)
        │       └── [NexCore] Notification Engine ส่งแจ้งเตือนและ PDF ทาง Email อัตโนมัติ
        ├── ลูกค้าตกลง → สร้าง Sales Order (SO) หรือ Blanket Order (ซอยย่อยยอดจัดส่ง)
        │       └── [NexApprove] Approval Workflow Builder ขออนุมัติผ่านแอปถ้าส่วนลด > X%
        ├── [NexPortal] Customer Portal: ให้ลูกค้า B2B เข้าระบบมาดู Order Status, เครดิตคงเหลือ, และสร้าง PO ได้เอง
        └── [NexSales] Loyalty Points: คำนวณแต้มสะสมจากยอดสั่งซี้อ B2B เรทพิเศษ
        └── SO ส่งต่อ → [NexStock] เตรียม Picking
```

**ผู้รับผิดชอบ:** Sales Representative, Sales Manager

---

### 🟩 LANE B: ฝ่ายคลัง (Warehouse Team) — คู่ขนานกับ Lane A

```
[NexStock] รับ Picking Order จาก NexSales
        │
        ├── ตรวจสต็อกก่อน
        │       ├── [มีพอ] → เริ่ม Pick & Pack
        │       └── [ไม่พอ] → แจ้ง Sales + ส่งไป [NexProcure] สั่งเพิ่ม
        ├── Picking: หยิบสินค้าตาม Order (สแกน Barcode)
        ├── Packing: บรรจุหีบห่อ + พิมพ์ Label + ใบส่งสินค้า
        ├── จัดวางรอรถรับ
        └── ส่งสินค้าออก
                ├── [รถของบริษัท] → [NexSpeed] สร้าง Trip
                └── [ขนส่ง 3rd Party] → บันทึก Tracking No. ใน [NexLess]
```

**ผู้รับผิดชอบ:** Warehouse Staff, Warehouse Manager

---

### 🟡 LANE C: ฝ่ายจัดซื้อ (Procurement) — คู่ขนานตลอดเวลา

```
[คู่ขนาน — ไม่รอ Lane A/B เสมอ]
        │
[NexStock] แจ้งเตือน Low Stock → [NexProcure]
        │
        ▼
[NexProcure] — กระบวนการจัดซื้อ
        ├── สร้าง Purchase Request (PR)
        │       └── [NexApprove] ← ผู้จัดการอนุมัติ PR
        ├── ส่ง RFQ ให้ Vendor หลายราย (เปรียบเทียบราคา)
        ├── เลือก Vendor ที่ดีที่สุด → ออก PO
        │       └── [NexApprove] ← CFO/เจ้าของ อนุมัติ ถ้า > วงเงิน
        ├── [NexLess] ← แนบ PO เป็นเอกสารดิจิทัล ส่ง Vendor
        ├── รอสินค้าจาก Vendor
        └── รับสินค้า (Goods Receipt)
                ├── ตรวจสภาพสินค้า + นับจำนวน
                ├── สแกน Barcode → บันทึกเข้าสต็อก [NexStock]
                ├── AP Invoice → [NexFinance]
                └── [NexFinance] 3-Way Matching: จับคู่ PO + GR + AP Invoice อัตโนมัติก่อนทำจ่าย
```

**ผู้รับผิดชอบ:** Purchasing Officer, Purchasing Manager

---

### 🟥 LANE D: ฝ่ายการเงิน / บัญชี — คู่ขนานตลอดเวลา

```
[NexFinance] — บัญชีทุกสิ้นวัน/สัปดาห์/เดือน

AR (ลูกหนี้ — ฝั่งขาย):
        ├── รับข้อมูล SO + ใบส่งสินค้าจาก NexSales/NexStock
        ├── ออก Invoice + วางบิลลูกค้า
        ├── ติดตามเก็บเงิน (ตามเครดิตเดย์)
        └── บันทึกรับชำระเงิน

AP (เจ้าหนี้ — ฝั่งซื้อ):
        ├── รับ AP Invoice จาก NexProcure
        ├── 3-Way Matching: PO + GR + INV
        ├── ตั้งวันนัดจ่าย
        └── โอนเงินให้ Vendor

GL (บัญชีแยกประเภท):
        ├── Auto-post Journal Entry ทุก Transaction
        └── รายงาน P&L, Balance Sheet

[NexTax] — ภาษีรายเดือน:
        ├── ภ.พ.30 (VAT ซื้อ-ขาย)
        ├── ภ.ง.ด.3/53 (หัก ณ ที่จ่าย)
        └── [NexTax] ออก e-Tax Invoice ดิจิทัลส่งกรมสรรพากรอัตโนมัติ (Legal Requirement)
```

**ผู้รับผิดชอบ:** Accountant, CFO

---

## 🔄 Flow ย่อ Wholesale (สรุป)

```
ลูกค้าสั่ง → [NexSales] สร้าง SO
                    ↓                        ↓ (คู่ขนาน)
          [NexStock] Picking           [NexProcure] ซื้อเพิ่ม
                    ↓                        ↓
          จัดส่งสินค้า               Vendor ส่งสินค้ามา
                    ↓                        ↓
          [NexSpeed/3rd Party]        [NexStock] รับเข้าคลัง
                    ↓
          [NexFinance] ออก Invoice
                    ↓
          ลูกค้าชำระ → [NexFinance] รับชำระ
                    ↓
          [NexTax] บันทึก VAT → [NexBI] Dashboard
```

---

---

# 🟡 Type 2: ขายปลีก / Retail หลายสาขา

> **ลักษณะ:** มีหน้าร้าน, หลายสาขา, ขายสด, มีระบบ POS  
> **ลูกค้า:** ผู้บริโภคทั่วไป (Walk-in)  
> **ความซับซ้อน:** สต็อกหลายสาขา, ควบคุมยอดขายแต่ละสาขา, Loyalty Points

---

## 📋 กระบวนการ Retail — End to End

---

### 🟦 LANE A: หน้าร้าน — Cashier / พนักงานขาย

```
ลูกค้าเดินเข้าร้าน
        │
        ▼
[NexPOS] — หน้าจอ POS ที่เคาน์เตอร์
        ├── ค้นหาลูกค้า (สะสมแต้ม / Member)
        ├── สแกน Barcode สินค้า
        ├── เพิ่ม/ลด จำนวน + ส่วนลด Coupon
        ├── เลือกวิธีชำระ:
        │     ├── เงินสด
        │     ├── QR PromptPay (สแกน)
        │     ├── บัตรเครดิต/เดบิต
        │     └── E-Wallet (True Money / LINE Pay)
        ├── ออกใบเสร็จ (Thermal + Email/SMS)
        ├── ตัดสต็อก → [NexStock] อัตโนมัติ
        └── ลูกค้าสะสมแต้ม → [NexSales] Loyalty Program

[คู่ขนาน] [NexFinance] ← รับยอดขายสด ทันที
```

**ผู้รับผิดชอบ:** Cashier, พนักงานขาย

---

### 🟩 LANE B: คลังสินค้าสาขา — Stock Management

```
[NexStock — สต็อกรายสาขา]
        │
        ├── [NexStock] Multi-Warehouse + Location: ดูยอดคงเหลือ Real-time ทุกสาขา, โอนสต็อกระหว่างสาขา
        ├── แจ้งเตือน Low Stock / [NexStock] FEFO + Expiry Alert แจ้งเตือนสินค้าใกล้หมดอายุ
        │       └── [NexProcure] หรือสร้างใบขอ Stock Transfer ข้ามสาขา
        └── นับสต็อก (Cycle Count) รายสัปดาห์/เดือน
```

---

### 🟡 LANE C: โกดังกลาง → กระจายสาขา (คู่ขนาน)

```
[NexStock — Central Warehouse]
        │
        ├── รับสินค้าจาก Vendor (GR จาก NexProcure)
        ├── จัดหมวดหมู่ + บันทึก Location
        ├── กระจายสินค้าไปสาขาตามยอด
        │       └── สร้าง Distribution Order → [NexSpeed] จัดรถ
        └── ส่งสินค้าถึงสาขา → สาขารับเข้าสต็อก

[NexProcure] — คู่ขนาน
        ├── Low Stock Alert → ออก PR → PO
        └── รับสินค้าเข้าโกดังกลาง
```

---

### 🟥 LANE D: ผู้บริหาร — ควบคุมทุกสาขา (Real-time)

```
[NexBI — Executive Dashboard Builder]
        │
        ├── สร้าง Dashboard เองได้: KPI: Best-Seller, Dead Stock, Margin per SKU, เครดิตค้างชำระ
        ├── ยอดขายรายสาขา / รายชั่วโมง
        ├── สินค้าขายดี / ไม่ขายดี
        ├── กำไรขั้นต้นต่อสินค้า (Gross Margin)
        ├── สต็อกคงเหลือต่อสาขา
        │       └── เตือนถ้าสาขาไหน Out of Stock
        └── เปรียบเทียบยอดขาย เดือนนี้ vs เดือนก่อน

[NexFinance] — คู่ขนาน
        ├── รวมยอดขายทุกสาขา
        ├── กระทบยอดเงินสด / เงินโอน / บัตร
        └── รายงาน P&L รายสาขา
```

---

### 🟪 LANE E: เปิด-ปิด Shift หน้าร้าน (ทุกวัน)

```
เช้า:
[NexPOS] — เปิด Shift
        ├── Cashier นับเงินเริ่มต้น (Opening Balance)
        └── บันทึกใน System

ระหว่างวัน:
        └── ทำ Transaction ตาม Lane A

เย็น/กลางคืน:
[NexPOS] — ปิด Shift
        ├── สรุปยอดขาย (Cash, QR, บัตร)
        ├── นับเงินสด vs ยอดระบบ
        ├── อัปโหลดยอดไป [NexFinance]
        └── รายงาน Daily Summary → Manager อีเมลอัตโนมัติ
```

**ผู้รับผิดชอบ:** Branch Manager, Senior Cashier

---

## 🔄 Flow ย่อ Retail (สรุป)

```
ลูกค้าเข้าร้าน
        ↓
[NexPOS] สแกน + รับเงิน
        ↓ (อัตโนมัติ)
[NexStock] ตัดสต็อกสาขา
        ↓ (อัตโนมัติ)
[NexFinance] บันทึกรายได้
        ↓ (ถ้า Low Stock)
[NexProcure] สั่งสินค้าจาก Vendor / โกดังกลาง
        ↓
[NexStock] รับสินค้าเข้าสาขา
        ↓
[NexBI] Dashboard ยอดขาย Real-time ทุกสาขา
```

---

---

# 🟢 Type 3: E-Commerce / ขายออนไลน์

> **ลักษณะ:** ขายบน Shopee, Lazada, TikTok Shop, Website ของตัวเอง  
> **ลูกค้า:** ผู้บริโภคทั่วไปที่สั่งทางออนไลน์  
> **ความซับซ้อน:** Order จากหลาย Channel, COD, ส่งพัสดุจำนวนมาก, คืนสินค้า

---

## 📋 กระบวนการ E-Commerce — End to End

---

### 🟦 LANE A: รับ Order จากหลาย Channel (คู่ขนาน)

```
[หลาย Channel พร้อมกัน]
        │
        ├── Shopee ─── Order ใหม่
        ├── Lazada ─── Order ใหม่  → [NexCommerce] E-Commerce Hub ── ดึง Order + ยืนยันสต็อก
        ├── TikTok Shop ── Order    เข้าที่เดียวและ Sync ส่วนลด Promotion Engine
        ├── Website ─── Order ใหม่ ─────────────────────────┘
        └── Line / FB / IG ── แชท → [NexSales] บันทึกด้วยมือ
                                            │
                                            ▼
                                    [NexSales] — Order Hub
                                    ├── รวม Order ทุก Source
                                    ├── เช็ค Stock พร้อม
                                    ├── Priority: จัดลำดับ ด่วน / ปกติ
                                    └── ส่งต่อ → [NexStock] เตรียมพัสดุ
```

---

### 🟩 LANE B: คลัง — Pack & Ship

```
[NexStock] — Order Fulfillment
        │
        ├── [NexStock] FEFO + Expiry Alert หยิบและจ่ายสินค้าล็อตเก่าหรือวันหมดอายุใกล้สุดก่อน
        ├── รับ Picking List (QR Scan หรือ Print)
        ├── หยิบสินค้าตาม Order (Wave Picking รวมหลาย Order)
        ├── แพ็คพัสดุ
        │       ├── พิมพ์ Label + ใบกำกับ
        │       ├── ถ่ายรูปสินค้าก่อนแพ็ค (ป้องกัน Claim)
        │       └── สแกนบันทึก Tracking No. (ไปรษณีย์/Flash/J&T)
        └── รอรถขนส่งมารับ
```

---

### 🟡 LANE C: ส่งพัสดุ — Logistics

```
[NexDelivery (Last-Mile ของตัวเอง)] หรือ [ขนส่ง 3rd Party]
        │
        ├── [กรณีส่งเอง]
        │   └── Rider App รับ List + ออกส่ง + GPS Track
        │
        └── [กรณีฝาก Flash/J&T/ไปรษณีย์]
                ├── [NexConnect] → API ส่งข้อมูลพัสดุ
                ├── รับ Tracking No. กลับมาอัตโนมัติ
                └── บันทึกใน [NexSales] → ลูกค้าใช้ติดตาม

[NexSite — Customer Tracking]
        └── ลูกค้าใส่เลข Order → ดูสถานะพัสดุ
```

---

### 🟥 LANE D: จัดการการคืนสินค้า / Claim (Return)

```
ลูกค้าแจ้งคืนสินค้า
        │
        ├── Platform แจ้งผ่าน [NexConnect] → [NexSales] รับ Case
        ├── ตรวจสอบเหตุผล (สินค้าเสีย / ไม่ตรงรายละเอียด / ส่งผิด)
        ├── อนุมัติ Return → [NexApprove]
        ├── ลูกค้าส่งของคืน → รับเข้า [NexStock]
        │       ├── [สภาพดี] → นำกลับขายได้
        │       └── [เสีย/ชำรุด] → Write-off / Claim Vendor
        └── คืนเงินลูกค้า → [NexFinance] Credit Note
```

---

### 🟪 LANE E: COD Reconciliation (สิ้นวัน)

```
กรณี COD (เก็บเงินปลายทาง):

[NexDelivery / 3rd Party]
        ├── ส่งสำเร็จ → เงินอยู่กับขนส่ง
        ├── ขนส่ง RoundUp โอนเงิน COD มาให้
        └── [NexFinance] COD Reconciliation ทำการกระทบยอดเก็บเงินปลายทางจากขนส่งหลายเจ้าอัตโนมัติ

[NexSales] — Reconcile
        ├── เช็ค Order ที่ส่งสำเร็จ vs ยอดที่ได้รับ
        └── แจ้งเตือนถ้ามี Discrepancy
```

---

### 🟧 LANE F: ฝ่ายจัดซื้อ — เติมสต็อกตามยอดขาย (คู่ขนาน)

```
[NexBI] วิเคราะห์ Demand Forecast
        │
        ├── สินค้าไหนใกล้หมด → แจ้งเตือน
        └── [NexProcure] สั่งซื้อล่วงหน้า ก่อน Stockout

[NexProcure] — ตามระบบ
        ├── PR → Approve → PO → Vendor
        └── GR → [NexStock] เพิ่มสต็อก
```

---

## 🔄 Flow ย่อ E-Commerce (สรุป)

```
Order เข้าจากทุก Channel → [NexConnect]
        ↓
[NexSales] รวม Order + จัดลำดับ
        ↓
[NexStock] Picking → Packing → Label
        ↓ (คู่ขนาน)
[NexDelivery/3rd Party] ออกส่ง
        ↓                           ↓ (คู่ขนาน)
GPS Track / Tracking No.       [NexProcure] เติม Stock
        ↓
ส่งสำเร็จ / คืนสินค้า
        ↓
[NexFinance] COD Reconcile + Revenue
        ↓
[NexTax] VAT ขาย → [NexBI] Dashboard ยอด/กำไรทุก Channel
```

---

---

# 🟠 Type 4: Import / Export / ตัวแทนจำหน่าย

> **ลักษณะ:** นำเข้าสินค้าจากต่างประเทศ หรือส่งออกสินค้าไทย  
> **ลูกค้า:** องค์กร, Distributor, Modern Trade  
> **ความซับซ้อน:** เอกสารทางการ, ภาษีนำเข้า, L/C, สกุลเงินต่างประเทศ

---

## 📋 กระบวนการ Import/Export — End to End

---

### 🔵 IMPORT: นำเข้าสินค้าจากต่างประเทศ

---

#### LANE A: จัดซื้อจาก Supplier ต่างประเทศ

```
[NexProcure] — International Purchase
        │
        ├── [NexFinance] Multi-Currency + FX: สร้าง PO ในสกุลต่างประเทศ (USD, EUR, CNY)
        ├── ส่ง PO → Supplier ต่างประเทศ
        ├── เจรจาเงื่อนไข: FOB / CIF / EXW
        └── [NexLess] ← จัดเก็บเอกสาร:
                ├── Commercial Invoice
                ├── Packing List
                ├── Bill of Lading (B/L) หรือ Air Waybill
                ├── Certificate of Origin
                └── L/C (Letter of Credit) ถ้ามี
```

---

#### LANE B: ผ่านพิธีการศุลกากร (คู่ขนาน)

```
[NexLess] ← เตรียมเอกสาย ผ่านพิธีการ
        │
        ├── ส่งเอกสารให้ Customs Broker
        ├── [NexTax] Import Duty / VAT นำเข้า: บันทึกอากรนำเข้า + VAT ขาเข้าแยกออกจาก Cost สินค้า
        │       └── [NexFinance] ← บันทึกค่าใช้จ่ายศุลกากรและ FX Gain/Loss ดำเนินการ 3-Way Matching อัตโนมัติ
        └── ได้รับ Release → [NexSpeed/NexStock] รับสินค้า

[NexFinance] — FX Management
        ├── บันทึกอัตราแลกเปลี่ยน ณ วันที่ซื้อ
        ├── กำไร/ขาดทุนจากอัตราแลกเปลี่ยน
        └── จ่ายเงินผ่าน L/C / T/T โอนต่างประเทศ
```

---

#### LANE C: รับสินค้า + เข้าคลัง

```
[NexStock] — รับสินค้านำเข้า
        ├── ตรวจสอบตาม Packing List
        ├── บันทึก Lot/Serial + Country of Origin
        ├── ตรวจ QC สินค้า
        └── เข้าสต็อก → พร้อมขาย
```

---

### 🔴 EXPORT: ส่งออกสินค้าไทย

---

#### LANE A: รับ Order จากลูกค้าต่างประเทศ

```
[NexSales] — Export Order
        │
        ├── ลูกค้าต่างประเทศสั่ง
        ├── [NexFinance] Multi-Currency + FX: สร้าง Sales Order (สกุลเงิน USD/EUR) ระบบคำนวณกำไร/ขาดทุนค่าเงินอัตโนมัติ
        ├── ออก Commercial Invoice และ Proforma
        └── ส่ง PDF ผ่าน Email → ลูกค้ายืนยัน
```

---

#### LANE B: เตรียมสินค้า + เอกสารส่งออก (คู่ขนาน)

```
[NexStock] — Packing for Export
        ├── Picking ตาม Export Order
        ├── นับสินค้า + บรรจุหีบห่อ Export Grade
        └── พิมพ์ Packing List

[NexLess] — เอกสารส่งออก (คู่ขนาน)
        ├── Commercial Invoice
        ├── Packing List
        ├── Certificate of Origin (Form A/D/E/FTA)
        ├── Phytosanitary (ถ้าเป็นสินค้าเกษตร)
        └── ยื่นศุลกากร + ได้ใบขนส่งส่งออก
```

---

#### LANE C: จัดส่ง + ติดตาม

```
[NexSpeed] — ส่งสินค้าไปท่าเรือ/สนามบิน
        ├── ขนส่งไป Port
        └── แจ้ง Consignee ผ่าน [NexSite]

[NexFinance] — รับเงินต่างประเทศ
        ├── รับ T/T โอน หรือ L/C
        ├── บันทึก FX Rate
        └── ออก Receipt + ปิด AR
```

---

## 🔄 Flow ย่อ Import/Export (สรุป)

```
IMPORT:
Supplier ต่างประเทศ → PO สั่ง [NexProcure]
        ↓ (คู่ขนาน)
[NexLess] เอกสาร + ศุลกากร
        ↓
[NexFinance] จ่ายสกุลเงินต่างประเทศ
        ↓
[NexStock] รับสินค้าเข้าคลัง
        ↓
[NexSales] ขายต่อให้ลูกค้าในประเทศ

EXPORT:
ลูกค้าต่างประเทศสั่ง → [NexSales] Order
        ↓ (คู่ขนาน)
[NexStock] Packing + [NexLess] เอกสาร
        ↓
[NexSpeed] ขนส่งไปท่าเรือ
        ↓
[NexFinance] รับเงินต่างประเทศ (FX)
        ↓
[NexBI] กำไรต่อ Order + FX Gain/Loss
```

---

---

# 🗺️ Master Integration Map (ธุรกิจซื้อมาขายไป)

```
                        [NexCore]
                    SSO / Role / Config
                 ↙️          ↓         ↘️
          [NexForce]    [NexAsset]   [NexSales]
           พนักงาน       สต็อก/อุปกรณ์  CRM/Order
               ↓              ↓           ↓
          [NexPayroll]        │     [NexApprove]
           เงินเดือน          │      ส่วนลดพิเศษ
                              ↓
                        [NexProcure]
                        สั่งซื้อจาก Vendor
                              ↓
                    ┌─────────────────────┐
                    │     [NexStock]      │
                    │  โกดังกลาง/สาขา    │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
       [NexPOS]         [NexSales]        [NexDelivery]
       ขายหน้าร้าน      ขายส่ง/Online      ส่งพัสดุ
              │                ↓                │
              └────────────────┼────────────────┘
                               ↓
                        [NexFinance]
                    AR | AP | GL | Cash Flow
                               │
                    ┌──────────┼──────────┐
                    ↓          ↓          ↓
                [NexTax]  [NexCost]  [NexPayroll]
                 ภาษี     ต้นทุน     เงินเดือน

[NexConnect] ← ดึง Order จาก Shopee/Lazada/TikTok
[NexLess]    ← เอกสาร PO/Invoice/สัญญา/เอกสารศุลกากร
[NexApprove] ← อนุมัติ PO, ส่วนลด, Return, Credit Note
[NexSite]    ← ลูกค้าดูสถานะ / Careers / Blog
[NexBI]      ← Dashboard ยอดขาย/กำไร/สต็อก/จัดซื้อ
[NexAudit]   ← บันทึก Log ทุก Transaction
```

---

# ⚡ Trigger Events อัตโนมัติ (ไม่ต้องทำด้วยมือ)

| เหตุการณ์ | แอปต้นทาง | แอปปลายทาง | ผลที่ได้ |
|---|---|---|---|
| Order เข้าจาก Shopee/Lazada | NexConnect | NexSales | สร้าง SO อัตโนมัติ |
| SO ยืนยันแล้ว | NexSales | NexStock | สร้าง Picking Order |
| Stock ต่ำกว่า Min | NexStock | NexProcure | สร้าง PR อัตโนมัติ |
| PO อนุมัติแล้ว | NexApprove | NexProcure | ส่ง PO ให้ Vendor |
| รับสินค้าแล้ว (GR) | NexProcure | NexStock | เพิ่ม Stock อัตโนมัติ |
| GR เสร็จ | NexProcure | NexFinance | สร้าง AP Invoice |
| ขายสินค้า POS | NexPOS | NexStock | ตัดสต็อกทันที |
| ขายสินค้า POS | NexPOS | NexFinance | บันทึกรายได้ |
| POD / ส่งสำเร็จ | NexDelivery | NexFinance | สร้าง AR Invoice |
| ลูกค้าโอนเงิน | NexFinance | NexSales | ปิด AR อัตโนมัติ |
| สิ้นเดือน | NexForce | NexPayroll | สรุปชั่วโมงงาน |
| Payroll อนุมัติ | NexPayroll | NexFinance | บันทึก Salary JE |
| ทุก Transaction | ทุกแอป | NexBI | อัปเดต Dashboard |
| ทุก Action | ทุกแอป | NexAudit | บันทึก Audit Log |

---

# 👤 ใครใช้แอปไหน — Trading Business

| ตำแหน่ง | แอปหลัก | แอปรอง | Mobile |
|---|---|---|---|
| **เจ้าของ / CEO** | NexBI | NexFinance, NexApprove | ✅ Dashboard |
| **Sales Manager** | NexSales | NexBI, NexApprove | ✅ ดู Order |
| **Sales Rep** | NexSales | NexStock (ดูสต็อก) | ✅ รับ Order สนาม |
| **Purchasing** | NexProcure | NexStock, NexApprove | ⚡ อนุมัติ |
| **Warehouse** | NexStock | NexProcure, NexSales | ✅ สแกน Barcode |
| **Cashier (หน้าร้าน)** | NexPOS | — | ✅ Tablet POS |
| **Branch Manager** | NexPOS, NexBI | NexStock | ✅ Shift Report |
| **E-Commerce Admin** | NexConnect, NexSales | NexStock | ✅ ดู Order |
| **ฝ่ายบัญชี** | NexFinance | NexTax, NexPayroll | ⚡ อนุมัติ |
| **HR / Admin** | NexForce | NexPayroll, NexLearn | — |
| **IT Admin** | NexCore, NexAudit | NexConnect | — |
| **ลูกค้า B2B** | NexSite (Portal) | — | ✅ ดูสถานะ Order |

---

# 📊 KPI Dashboard สำหรับ Trading Business

| KPI | คำนวณจาก | ความหมาย |
|---|---|---|
| **ยอดขายรวม / ต่อช่องทาง** | NexSales + NexPOS + NexConnect | รายได้แต่ละ Channel |
| **Gross Margin %** | NexCost vs NexSales | กำไรขั้นต้น |
| **สต็อกหมุนเวียน (Inventory Turnover)** | NexStock | สต็อกขายได้เร็วแค่ไหน |
| **Out-of-Stock Rate %** | NexStock | สินค้าขาดสต็อกบ่อยแค่ไหน |
| **Dead Stock (สต็อกค้าง)** | NexStock | สินค้าไม่ขยับ > 90 วัน |
| **ยอดลูกหนี้ค้างชำระ (AR Aging)** | NexFinance | เงินที่ยังเก็บไม่ได้ |
| **Order Fulfillment Rate %** | NexStock + NexSales | ส่งสินค้าครบตาม Order |
| **Return Rate %** | NexSales | สินค้าถูกคืนกี่ % |
| **Purchase Cost vs Budget** | NexProcure + NexCost | จัดซื้อเกินงบแค่ไหน |
| **Top Selling Products** | NexSales + NexPOS | สินค้าขายดี 10 อันดับ |
| **Customer Acquisition** | NexSales | ลูกค้าใหม่ต่อเดือน |
| **COD Collection Rate** | NexDelivery + NexFinance | เก็บเงิน COD ได้กี่ % |

---

# ⏱️ Timeline ตัวอย่าง — Order ครบวงจร (Wholesale)

```
วันที่ 1 เช้า ─── Sales Rep เยี่ยมลูกค้า คุยหน้างาน
                  └── [NexSales] Mobile → สร้าง QUotation + ส่ง PDF

วันที่ 1 บ่าย ─── ลูกค้ายืนยัน → Sales Order
                  ├── [NexStock] ตรวจสต็อก: มีพอ ✅
                  └── [NexApprove] ส่วนลดปกติ → ไม่ต้องอนุมัติ

วันที่ 1 เย็น ─── [NexStock] Picking Order ออก
                  ├── พนักงานคลังรับใบหยิบสินค้า
                  └── หยิบ + แพ็ค + พิมพ์ Label

[คู่ขนาน] ─────── [NexProcure] ตรวจ Stock สินค้าอื่น → Low Stock
                  └── Auto PR → ส่งให้ผู้จัดการอนุมัติ

วันที่ 2 เช้า ─── [NexSpeed] รถออก พร้อมสินค้า
                  └── GPS Track + ลูกค้าดูสถานะ [NexSite]

วันที่ 2 บ่าย ─── ส่งสำเร็จ → POD ลายเซ็น
                  └── [NexFinance] Invoice ออกอัตโนมัติ + ส่ง Email

วันที่ 2-30 ───── [NexFinance] AR ติดตามเก็บเงิน (30/45/60 วัน)
                  └── แจ้งเตือนอัตโนมัติถ้าเกินกำหนด

สิ้นเดือน ─────── [NexPayroll] พนักงานได้รับค่าคอม + เงินเดือน
                  [NexTax] ภ.พ.30 + ภ.ง.ด.3
                  [NexBI] Dashboard: ยอด / กำไร / สต็อก / ลูกหนี้
```

---

# ⏱️ Timeline ตัวอย่าง — Order E-Commerce (ครบวงจร)

```
เช้า 08:00 ── Order ใหม่เข้า Shopee 35 รายการ
              └── [NexConnect] ดึงเข้า [NexSales] อัตโนมัติ

08:30 ──────── [NexStock] Picking List รวม 35 Order ออก (Wave Pick)
               └── พนักงาน 2 คน แบ่ง Zone หยิบสินค้า

09:30 ──────── แพ็คพัสดุ + สแกน QR + พิมพ์ Label Flash/J&T
               └── [NexConnect] ส่ง Tracking No. กลับ Shopee อัตโนมัติ

10:00 ──────── รถ Flash มารับพัสดุ
               └── [NexSales] สถานะ "จัดส่งแล้ว"

10:00-14:00 ── [คู่ขนาน] Order ใหม่เข้าแบบ Real-time
               ├── Order เพิ่มเติมจาก Lazada / TikTok
               └── Batch รอบบ่าย

16:00 ──────── รอบบ่าย: Picking + Pack + Flash บ่าย

18:00 ──────── สต็อกสินค้า X ต่ำกว่า Min →
               └── [NexProcure] Auto PR → ผู้จัดการอนุมัติทาง Mobile

สิ้นวัน ─────── [NexDelivery] COD Reconcile: เงินรอรับจาก Flash/J&T
                [NexFinance] รายได้วันนี้ 35 Order
                [NexBI] ยอดขายแต่ละ Channel วันนี้
```

---

# 🏗️ แผนการพัฒนา (Priority สำหรับ Trading Business)

| Phase | แอป | สิ่งที่ได้ทันที |
|---|---|---|
| **Phase 0** | NexCore | พนักงาน Login ได้ทุกแอน, SSO พร้อม |
| **Phase 1** | NexStock, NexSales, NexForce | ขายได้ + สต็อกพร้อม + HR พื้นฐาน |
| **Phase 2** | NexProcure, NexFinance, NexPayroll | จัดซื้อ + บัญชี + จ่ายเงินเดือน |
| **Phase 2** | NexPOS | เปิดหน้าร้านได้ทันที |
| **Phase 3** | NexConnect, NexDelivery, NexSite | ออนไลน์ครบ + ส่งพัสดุ + Portal ลูกค้า |
| **Phase 3** | NexTax, NexCost, NexApprove | ภาษีถูกต้อง + ต้นทุนชัดเจน + Workflow |
| **Phase 4** | NexBI, NexLess, NexAudit, NexLearn | ข้อมูล + เอกสาร + Compliance + Training |
---

_เอกสารจัดทำโดย: NexOne Development Team_  
_กรณีศึกษา: ธุรกิจซื้อมาขายไป (Trading / Wholesale / Retail / E-Commerce / Import-Export)_  
_ปรับปรุงล่าสุด: April 2026_

---

## 🎯 สรุปฟีเจอร์หลักที่ต้องพัฒนา (Master Plan)
รายการฟีเจอร์ด้านล่างคือ **Gap Features** ที่ต้องพัฒนาเข้าสู่ระบบ NexOne เพื่อให้รองรับธุรกิจ Trading (ซื้อมาขายไป) ได้อย่างสมบูรณ์:

### 1. ฟีเจอร์หลัก (Core Extensions)
- **Multi-Price Tier / VIP (NexSales)**: จัดการราคาสินค้าตามเกรดลูกค้า
- **Loyalty Points / Reward Program (NexSales)**: แต้มสะสมแลกรางวัล
- **FEFO Management & Expiry Alert (NexStock)**: จ่ายสินค้าตามวันหมดอายุและตั้งเตือน
- **Multi-Warehouse + Location (NexStock)**: กระจายสต็อกหลายคลัง
- **Multi-Currency + FX Management (NexFinance)**: สั่งซื้องานต่างประเทศ รับรู้กำไร/ขาดทุนอัตราแลกเปลี่ยน
- **COD Reconciliation (NexFinance)**: กระทบยอดเก็บเงินปลายทาง
- **Import Duty / VAT นำเข้า (NexTax)**: การจัดการภาษีนำเข้า
- **E-Commerce Hub Sync (NexCommerce)**: Sync Order จาก Shopee/Lazada

### 2. ฟีเจอร์ข้ามแอป (Cross-cutting)
- **Customer Portal Login (NexPortal)**: Dealer เช็คประวัติการสั่งซื้อ และ เครดิต
- **3-Way Matching (NexFinance)**: ตรวจสอบ Invoice 
- **e-Tax Invoice (NexTax)**: ออกใบกำกับภาษีอิเล็กทรอนิกส์

