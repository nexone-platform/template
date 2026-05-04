# 🌐 NexSite — ระบบบริหารเว็บไซต์องค์กร (Corporate Web CMS)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexsite.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

จัดการเนื้อหาเว็บไซต์ พอร์ทัลข้อมูลลูกค้า ประกาศองค์กร และตั้งค่า Landing Page ได้อย่างยืดหยุ่น

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Website Dashboard
```text
├── สถิติผู้เข้าชมเว็บไซต์ และ Performance
```

### 📃 Pages & Posts
```text
├── Landing Pages Builder
├── Blogs & Articles
```

### 🖼️ Assets & Banners
```text
├── Media Library (รูปภาพ)
├── Banner & Slider Manager
```

### ⚙️ Settings Configuration
```text
├── SEO Optimization Form
├── Menu Navigation Builder
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Site Brand & Template:** ตั้งค่าสีสัน Typography และโครงหลัก (Header/Footer)
- **Category Structuring:** จัดหมวดหมู่ข่าวสารให้เป็นระเบียบ แบ่งกลุ่มเป้าหมาย

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Page Builder (Drag/Drop):** ระบบลากวางบล็อคข้อมูล (Block Editor) สร้างหน้าใหม่ด่วนภายใน 5 นาที
- **Content Scheduler:** ตั้งเวลา Publish ร่วงหน้าสำหรับ PR/Marketing

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Real Estate:** สร้างหน้า Project Showcase, Gallery ภาพ 3D และห้องตัวอย่าง
- **F&B:** สร้างหน้ารายการเมนูแนะนำ สั่งจองโต๊ะ (ฝัง Link NexCommerce)

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexCommerce:** เป็นหน้าร้านหน้าด่านแสดงสินค้า ดึงข้อมูลไปแสดงและกดหยิบใส่ตะกร้า
- **เชื่อมต่อ NexSales:** เมื่อลูกค้ากรอกฟอร์ม Contact Us เว็บไซต์ ข้อมูลจะเด้งเข้า Lead ใน CRM ทันที

---

## 🛠️ Technical Stack & Notes
```text
Headless CMS Architecture
Next.js Frontend Cache (ISR)
```

---

_NexOne Development Team | NexSite Specification | April 2026_
