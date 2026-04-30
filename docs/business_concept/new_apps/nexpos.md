# 🏷️ NexPOS — ระบบจัดการหน้าร้าน (Point of Sale & Retail)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexpos.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

เชื่อมต่อข้อมูลหน้าบ้านร้านอาหารหรือร้านค้าปลีก จัดการออเดอร์ ทำงานได้แม้ออฟไลน์ ปิดบิลแม่นยำ

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 POS Registers
```text
├── Live Sales (สด)
├── Terminal Mgmt (สถานะเครื่อง)
```

### 🍴 Store Setup
```text
├── Menu Layout Builder (ปุ่มหน้าร้าน)
├── Floor & Table Plan (ผังโต๊ะอาหาร)
├── KDS Routing (ส่งบิลเข้าครัว)
```

### 💴 Operations
```text
├── Cash Drawer & Shift (การเปิดปิดกะลิ้นชัก)
├── Refund & Voids (คืนเงิน/ยกเลิก)
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Terminal Devices:** การผูก MAC Address, IP ของเครื่อง POS / Printer แต่ละจุด
- **Menu Options & Modifiers:** ตัวเลือกเช่น หวานน้อย, เพิ่มไข่, ขนาด (Size)

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Offline Checkout:** เน็ตหลุดก็ยังขายได้ ข้อมูลจะไหลเข้า Core ทันทีที่เน็ตกลับมา
- **KDS & Queue:** Kitchen Display System ส่งออเดอร์แยกโซน (ครัวร้อน/ครัวเย็น/เครื่องดื่ม)

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **F&B:** จองโต๊ะ, แยกจ่ายบิล (Split Bill), รวมโต๊ะ และคุมบุฟเฟต์จับเวลา
- **Retail:** ขายสินค้าแบบสแกนบาร์โค้ดต่อเนื่อง, ให้ส่วนลดเฉพาะรายการ

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexStock:** ลดของทันทีที่ขาย กรณีของหมด POS จะกดขายไม่ได้
- **เชื่อมต่อ NexCommerce:** ดึงออเดอร์จากมือถือหรือ Delivery Apps (Grab, FoodPanda) มาโชว์หน้า POS

---

## 🛠️ Technical Stack & Notes
```text
PWA Offline Sync
Web Bluetooth API (Printer)
```

---

_NexOne Development Team | NexPOS Specification | April 2026_
