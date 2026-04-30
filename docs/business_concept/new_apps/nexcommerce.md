# 🛒 NexCommerce — E-Commerce & Marketplace Hub

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexcommerce.md`
**Status:** 🆕 New App Proposal

---

## 🎯 วัตถุประสงค์

NexCommerce คือ **ศูนย์บัญชาการ E-Commerce** ที่รวมการบริหารสินค้า, Promotion, และ Channel ทุก Platform ไว้ในที่เดียว เน้นการ **Manage Product Catalog ครั้งเดียว ขายได้ทุก Channel** (Omnichannel Commerce)

แตกต่างจาก NexConnect (รับ Order อย่างเดียว) ตรงที่ NexCommerce ครอบคลุม **Product Management + Marketing + Analytics** ด้วย

---

## 🏢 ธุรกิจที่ต้องการ

| ธุรกิจ | Use Case |
|---|---|
| Trading / ขายออนไลน์ | Manage สินค้า Shopee/Lazada/TikTok ครั้งเดียว |
| F&B / Cloud Kitchen | Online Menu + Promotion + Multi-Platform |
| Manufacturing (Make-to-Stock) | Direct-to-Consumer Channel |
| Retail | Online + ร้านสาขา Omnichannel |

---

## 📋 ฟีเจอร์หลัก

### Module 1: Product Catalog Management
```
├── สร้างสินค้า 1 ครั้ง → Push ไปทุก Channel
│       ├── ชื่อ, รายละเอียด, รูปภาพหลายรูป
│       ├── Variant: Size, Color, Weight
│       └── SEO: Keyword, Meta Description
├── Price Management ต่อ Channel:
│       ├── Shopee Price vs Lazada Price vs Website Price
│       └── ราคา Promotion แยกต่าง Channel
├── Inventory Sync: สต็อกเดียว จาก [NexStock]
│       └── Stop-selling อัตโนมัติเมื่อ Stock = 0
└── Bulk Edit: แก้ราคา/รายละเอียดหลายสินค้าพร้อมกัน
```

### Module 2: Channel Integration
```
├── Shopee: Product, Order, Inventory, Chat
├── Lazada: Product, Order, Inventory
├── TikTok Shop: Product, Live Commerce, Order
├── LINE MyShop: Product, Order
├── Facebook Shop: Catalog, Order
├── Website (NexSite): Full E-Commerce
└── API ขยาย: เพิ่ม Channel ใหม่ในอนาคต
```

### Module 3: Promotion Engine
```
├── Flash Sale: กำหนดช่วงเวลา + ราคา + จำนวน
├── Voucher / Coupon Code: สร้าง Code ส่วนลด
├── Bundle: ซื้อครบ X ได้ Y ฟรี
├── Free Shipping: กำหนดเงื่อนไข
├── Loyalty Points: สะสมแต้มทุก Order
└── Schedule: ตั้งเวลาเปิด/ปิด Promotion อัตโนมัติ
```

### Module 4: Order Command Center
```
├── All Orders: รวม Order ทุก Channel
├── Filter: Platform, Status, วันที่, ยอด
├── Bulk Process: อนุมัติ/Print Label หลาย Order พร้อมกัน
├── Assign to Warehouse: ส่งต่อ [NexStock] Picking
└── Exception: Order ปัญหา (OOS, ที่อยู่ผิด)
```

### Module 5: Reviews & Ratings Management
```
├── ดู Review ทุก Platform ในที่เดียว
├── ตอบ Review ได้จาก NexCommerce
├── Filter: 1-star ที่ยังไม่ได้ตอบ
└── Sentiment Analysis: วิเคราะห์ Review อัตโนมัติ
```

### Module 6: Commerce Analytics
```
├── Revenue ต่อ Platform ต่อวัน/เดือน
├── Best-selling Products ต่อ Channel
├── Conversion Rate ต่อ Product
├── Return Rate ต่อ Platform
├── Ad Spend vs Revenue (ROAS)
└── Competitor Price Tracking (Optional)
```

---

## 🔗 Integration

```
NexCommerce ←→ NexConnect     (Order Receive API)
NexCommerce ←→ NexStock       (Inventory Sync)
NexCommerce ←→ NexSales       (Order Processing)
NexCommerce ←→ NexFinance     (Revenue, COD Settle)
NexCommerce ←→ NexBI          (Analytics Dashboard)
NexCommerce → Shopee API      (Product, Order, Chat)
NexCommerce → Lazada API      (Product, Order)
NexCommerce → TikTok API      (Product, Live, Order)
```

---

## 🛠️ Technical Stack

```
├── Framework: Next.js (Admin Dashboard)
├── API Layer: NestJS Microservice
├── Queue: Bull Queue (Order processing)
├── Scheduler: Cron (Promotion auto-start/stop)
├── External APIs: Shopee Open Platform, Lazada API, TikTok Business
└── Cache: Redis (Inventory sync real-time)
```

---

## 📊 Success Metrics

| KPI | เป้าหมาย |
|---|---|
| Channel Coverage | ≥ 5 Platforms |
| Inventory Sync Accuracy | > 99.9% |
| Order Processing Speed | < 5 min จาก Order → Warehouse |
| Oversell Rate (Stock 0) | < 0.1% |

---

_NexOne Development Team | NexCommerce App Concept | April 2026_
