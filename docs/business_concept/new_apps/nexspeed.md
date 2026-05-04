# 🚚 NexSpeed — ระบบบริหารจัดการการขนส่ง (Transportation & Logistics)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexspeed.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

ควบคุมค่าขนส่ง คิวรถ ติดตามตรวจสอบพัสดุและกำหนดเส้นทาง รวมถึงคำนวณกำไรต่อรอบ

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Transport Board
```text
├── Live Fleet Tracker
├── กําไรต่อเที่ยววิ่งวันนี้
```

### 🚚 Routing & Dispatch
```text
├── Routes & Areas (กำหนดเขต)
├── Job Dispatcher (จัดคิวรถ)
```

### 📄 Documents
```text
├── Delivery Orders (DO)
├── Electronic Proof of Delivery (EPOD)
```

### 💵 Pricing & Tariffs
```text
├── Tariff Master (เรทราคาตามระยะ/น้ำหนัก)
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Tariff / Price Matrix:** ผูกระยะทาง น้ำหนัก หรือประเภทพัสดุ เพื่อคำนวณราคาอัตโนมัติ
- **Zones & Routing:** ตั้งค่า Hub และการลากเส้นทางเดินรถ

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Load Planning:** หยิบเอา DO หลากหลายใบมากรุ๊ปใส่รถและแพลนลำดับจุดแวะ (Drop-offs)
- **EPOD Verification:** แอปคนขับบันทึกลายเซ็นต์, รูปถ่าย, พิกัด GPS ส่งกลับมาปิด Job แบบ Real-time

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Logistics:** รองรับการว่าจ้างรับเหมาช่วง (Subcontracting) การส่งรถร่วม และตัดเงินคืน
- **Make-to-Stock Manufacturing:** ประยุกต์ใช้เพื่อคุมรถบริษัทส่งของให้ Dealer คุมน้ำมันและเวลาการเดินทาง

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexAsset:** ตรวจสอบรถที่ยังไม่ถูกระงับเพื่อออกใบวิ่ง
- **เชื่อมต่อ NexCost:** ส่งค่าคอมมิชชั่น, ค่าน้ำมัน เพื่อคิด Total Cost ของเที่ยวรถ

---

## 🛠️ Technical Stack & Notes
```text
Google Maps / OpenStreetMap API
Socket.io for Live Tracking
```

---

_NexOne Development Team | NexSpeed Specification | April 2026_
