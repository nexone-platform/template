# 💼 NexSales — ระบบบริหารงานขายและลูกค้าสัมพันธ์ (CRM & Sales)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexsales.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

ติดตามท่อขาย (Pipeline) การออกใบคำสั่งขาย เก็บข้อมูลพันธมิตร และบริหารโปรโมชั่นแคมเปญ

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Sales Dashboard
```text
├── Sales Target, Win/Loss Ratio, YTD Revenue
```

### 👤 CRM & Pipeline
```text
├── Customers (ลูกค้านิติ/บุคคล)
├── Leads & Opportunities (สถานะดีล)
```

### 📝 Quotes & Orders
```text
├── Quotations (ใบเสนอราคา)
├── Sales Orders (SO)
├── Contracts & Blanket Orders
```

### 🪪 Pricing & Promos
```text
├── Price Lists (แคตตาล็อกราคา/Tier)
├── Discount & Promotions
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Customer Database:** ข้อมูลนิติบุคคลลูกค้า เครดิตวงเงิน เลเวลความสำคัญ (Tier)
- **Price Matrices:** ระบบตั้งราคาล่วงหน้าตาม Tier ลูกค้า ซื้อเยอะได้ลด ฯลฯ

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Deal Pipeline (Kanban):** บริหารทีมเซลส์ ดูได้ว่าแต่ละดีลอยู่ในเฟสไหน (Contacted, Negotiating, Won, Lost)
- **Contract / Blanket Order:** ฟีเจอร์สำหรับอุตสาหกรรม (B2B) ที่ลูกค้าเปิดใบสั่งยาว 1 ปี แบ่งเรียกของเป็นงวดๆ

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Real Estate:** เปลี่ยนจากการขาย Product เป็นการทำ Booking ควบคุมห้องว่าง วางเงินประกัน และทำแบบผ่อนดาวน์
- **Logistics:** ทำสัญญาขนส่งรายปีกับลูกค้า หรือคำนวณเรทเส้นทางเป็น Job

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexStock:** ขายของและอนุมัติ SO ปุบ สต็อกส่วนนั้นจะถูกจอง (Reserved)
- **เชื่อมต่อ NexFinance:** ส่ง SO ที่เคลียร์ของเรียบร้อยไปเปิดใบหนี้ (AR/Invoice)

---

## 🛠️ Technical Stack & Notes
```text
Kanban Board UI
Status Workflow Logic
```

---

_NexOne Development Team | NexSales Specification | April 2026_
