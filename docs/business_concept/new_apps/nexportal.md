# 🌐 NexPortal — Customer Self-Service Portal

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexportal.md`
**Status:** 🆕 New App Proposal

---

## 🎯 วัตถุประสงค์

NexPortal คือ **Customer-Facing Portal** ที่ให้ลูกค้า B2B และ B2C Login เข้ามาบริหารจัดการ ดูข้อมูล และ Self-Service ได้โดยไม่ต้องโทรหาพนักงาน แยกออกจาก NexSite (Website บริษัท) โดยเฉพาะ

---

## 🏢 ธุรกิจที่ต้องการ

| ธุรกิจ | ลูกค้าที่ใช้ Portal | สิ่งที่ทำได้ |
|---|---|---|
| Wholesale / Distributor | ร้านค้า B2B | สั่งซื้อ, ดู Order, Invoice, Statement |
| Manufacturing / OEM | ลูกค้า OEM | ดูสถานะ Job/Production, QC Report |
| Service / Consulting | ลูกค้าองค์กร | ดู Project, Milestone, แจ้งปัญหา |
| Real Estate | ผู้พักอาศัย/เจ้าของ | แจ้งซ่อม, ชำระส่วนกลาง, ดูประกาศ |
| Logistics | ลูกค้า Shipper | Track Shipment, POD, Invoice |
| Field Service | ลูกค้าที่มีสัญญา | ดู Ticket, ประวัติซ่อม, Contract |

---

## 📋 ฟีเจอร์หลัก

### Module 1: Dashboard ลูกค้า
```
├── ยอด Order ที่รอดำเนินการ
├── Invoice ที่รอชำระ (พร้อมปุ่มชำระออนไลน์)
├── Service Ticket ที่เปิดอยู่ + สถานะ
├── แจ้งเตือนสำคัญ (Shipment ถึง, Invoice ค้าง)
└── ข่าวสาร/ประกาศจากบริษัท
```

### Module 2: Order Management (B2B)
```
├── สร้าง Purchase Order ใหม่ (ลูกค้า B2B)
├── ดู Order History + Status แบบ Timeline
│       ├── Received → Processing → Shipped → Delivered
├── Track Shipment (Tracking No. + แผนที่)
├── Download: Delivery Note, COA, QC Report
└── ขอ Return / Claim
```

### Module 3: Finance & Billing
```
├── ดู Invoice ทั้งหมด (กรองตามช่วงเวลา)
├── ชำระเงินออนไลน์: QR Code, Credit Card, โอนพร้อม
├── ดู Statement ยอดลูกหนี้สะสม
├── Download PDF Invoice/Receipt
└── วงเงินเครดิตคงเหลือ (Credit Limit Available)
```

### Module 4: Project / Service Tracker
```
├── ดูสถานะ Project: % Complete, Milestone
├── Download Deliverables (PDF, File ต่างๆ)
├── Approve Milestone (ลูกค้า Sign-off Digital)
└── Comment / Feedback ต่อ Deliverable
```

### Module 5: Support / Ticket
```
├── แจ้งปัญหาใหม่ (สร้าง Ticket)
├── Track สถานะ Ticket แบบ Real-time
├── Chat กับ Support Team
├── ดูประวัติการซ่อม/บริการทั้งหมด
└── CSAT Rating หลังปิด Ticket
```

### Module 6: Document Vault
```
├── สัญญา/ข้อตกลง
├── QC Certificate / Test Report
├── Manual / Product Spec
└── ดาวน์โหลดได้ 24/7
```

---

## 🔗 Integration กับแอปอื่น

```
NexPortal ←→ NexSales     (Order, Quotation, Ticket)
NexPortal ←→ NexFinance   (Invoice, Payment, Statement)
NexPortal ←→ NexProduce   (Project Status, Job Status)
NexPortal ←→ NexStock     (สต็อกลูกค้า Consigned)
NexPortal ←→ NexSpeed     (Track Shipment)
NexPortal ←→ NexLess      (Download Documents)
NexPortal ←→ NexCore      (SSO, Permission ต่อ Customer)
```

---

## 🔐 Security & Access Control

```
├── Customer Admin: ดูข้อมูลได้ทั้งหมดในบัญชีตัวเอง
├── Customer User: ดูได้เฉพาะที่ถูก Grant
├── 2FA: OTP SMS/Email
├── Session Timeout: 4 ชั่วโมง
├── IP Whitelist: สำหรับลูกค้า B2B ที่ต้องการ
└── Data Isolation: ลูกค้า A ไม่เห็นข้อมูล ลูกค้า B
```

---

## 📱 Multi-Platform

```
├── Web (Desktop + Tablet): ใช้ทุก Browser
├── Mobile Responsive: ดูได้บน Smartphone
└── (Optional Future) Native App: iOS + Android
```

---

## 🛠️ Technical Stack

```
├── Framework: Next.js (App Router, SSR)
├── Auth: NextAuth.js + JWT (แยกจาก Internal SSO)
├── API: NexCore API Gateway
├── Payment: Omise / 2C2P (Thai Gateway)
└── Hosting: Cloud Run (Same as NexSite)
```

---

## 📊 Success Metrics

| KPI | เป้าหมาย |
|---|---|
| Self-Service Rate | > 60% ของ Inquiry ลดลง |
| Payment via Portal % | > 40% ของการชำระ |
| Customer Adoption | > 70% ของ B2B ลูกค้าหลัก |
| Invoice Download Rate | > 90% |
| CSAT Score (Portal) | > 4.2/5.0 |

---

_NexOne Development Team | NexPortal App Concept | April 2026_
