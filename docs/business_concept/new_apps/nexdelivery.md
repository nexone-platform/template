# 🚀 NexDelivery — ระบบตรวจสอบสถานะจัดส่งสำหรับลูกค้า (Last-mile Tracking)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexdelivery.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

พอร์ทัลลูกค้า (Customer-facing Portal) สำหรับให้ผู้รับเข้าไปเช็คสถานะการจัดส่งได้อย่างแม่นยำ

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Customer Track Map
```text
├── Tracking Number Input
├── Live Delivery Status
```

### ↩️ Returns
```text
├── Request Return (RMA)
```

### ⭐ Client Feedback
```text
├── Star Rating System
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Public Web Portal:** หน้าเว็บเฉพาะที่ไม่ต้อง Login (ดูได้เฉพาะ Tracking ตัวเอง)

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Live Tracker:** ดึงจุด GPS ปัจจุบันจากแอปคนขับแบบ Real-time บนแผนที่
- **Electronic RMA:** ระบบให้ลูกค้าทำเรื่องส่งคืนสินค้า แจ้งของพัง อัปโหลดรูปด้วยตนเอง

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Logistics:** สร้างประสบการณ์ให้ลูกค้าสบายใจ (เหมือนดูรถแกรป)
- **E-commerce:** โชว์รูป POD ตอนคนขับส่งของ เพื่อหลักฐาน

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexSpeed:** ฝั่งคนขับ กดอัพเดทสเตตัส ทาง NexDelivery โชว์ภาพตาม
- **เชื่อมต่อ NexSales:** รับเรื่องคืนของ เพื่อให้ CS เปิดเคลมเปลี่ยนสินค้า

---

## 🛠️ Technical Stack & Notes
```text
Server-sent Events (SSE)
React Maps
```

---

_NexOne Development Team | NexDelivery Specification | April 2026_
