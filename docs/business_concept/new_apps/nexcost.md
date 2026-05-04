# 💸 NexCost — แพลตฟอร์มบริหารและเพิ่มประสิทธิภาพต้นทุน (Enterprise Cost Optimization)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexcost.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

คำนวณต้นทุนการผลิต บริหารความคุ้มค่าระดับโครงการ และจัดส่วนแบ่งแบบ Overhead

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Cost Board
```text
├── Profitability Map
├── Cost Overrun Alerts
```

### 🏢 Cost Centers
```text
├── Cost Center Setup
├── Zero-based Budgeting
```

### 🧮 Allocations
```text
├── Overhead Rule Builder
├── Direct & Indirect Cost Split
```

### 📉 Variances
```text
├── Standard vs Actual Cost
├── Project Profit & Loss
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Cost Code Map:** กำหนดรหัสศูนย์ต้นทุนผูกกับโครงสร้างบริษัท
- **Allocation Rules:** สูตรเทค่าใช้จ่ายกองกลาง (ค่าน้ำ/ค่าไฟ/เช่าออฟฟิศ) ไปให้แผนกต่างๆ ตามสัดส่วน (Headcount/Sq.m.)

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Standard vs Actual Engine:** คำนวณความคลาดเคลื่อน (Variance) จากแผน เช่น ประเมินต้นทุน 100 บาท แต่ทำจริง 120 บาท (ติดลบ 20)
- **Zero-Based Budgeting (ZBB):** เครื่องมือรีเซ็ตและขอกำหนดงบใหม่ในรอบปีหน้า

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Make-to-Stock:** รวมต้นทุนซื้อ (Material) + ต้นทุนผลิต (Machine + Labor DL) + ค่าเสื่อม ออกมาเป็น Cost Per Unit
- **Construction:** เช็คยอดใช้งบราย Phase เทียบกับ BOQ ว่าเลยจุดขาดทุนหรือยัง

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexFinance:** ดึงเลข Journal เงินออกจากสมุดมาประเมิน (แยกเป็นรหัส Cost Center)
- **เชื่อมต่อ NexProduce & NexAsset:** ดึงความยาวชั่วโมงเปิดเครื่อง และค่าเสื่อมมาคำนวณ

---

## 🛠️ Technical Stack & Notes
```text
OLAP Cube Engine
Variance Formula Parser
```

---

_NexOne Development Team | NexCost Specification | April 2026_
