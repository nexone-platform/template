# 💸 NexPayroll — ระบบเงินเดือนและประกันสังคม (Payroll Management)

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexpayroll.md`
**Status:** 🆕 App Specification

---

## 🎯 วัตถุประสงค์ (Objective)

คำนวณเบี้ยจ่ายพนักงาน เคลียร์โอที สวัสดิการ จัดทำประกันสังคม และ ภ.ง.ด.1 ลิงก์ตรงธนาคาร

---

## 📂 ศูนย์รวมเมนูระบบ (Menu Breakdown)

### 📌 Payroll Board
```text
├── ภาพรวมรอบจ่าย (Payroll Cycle) ปัจจุบัน
```

### 💵 Processing
```text
├── Salary Processor (รันดึงข้อมูล)
├── Additions/Deductions (ใส่โบนัส/หักเงิน)
```

### 🏦 Bank & Tax
```text
├── Direct Export (ทำไฟล์จ่ายเข้าแบงค์)
├── SSO Report (ประกันสังคม)
├── Tax ภ.ง.ด. 1
```

### 📄 Employee Portal
```text
├── e-Payslip Center
├── Loan & Advance (ขอกู้/เบิกทดรอง)
```

---

## 🚀 ฟีเจอร์แยกตามกลุ่มการพัฒนา (Feature breakdown)

### 📂 กลุ่ม 1: ข้อมูลหลัก (Master Data & Setup)
- **Compensation Structure:** เรทการจ่าย เงินเดือนฐาน กฎการคืนทุน เบี้ยขยัน
- **Tax/SSO Configuration:** เรทอัตราภาษี ขั้นบันไดประกันสังคม

### ⚙️ กลุ่ม 2: กระบวนการหลัก (Core Operations)
- **Payroll Run Engine:** ทำสรุป 1 คลิก ระบบดูดการมาสาย การลา ขาดงาน OT จากระบบเวลา มาคำนวณเป็นยอดสลิป
- **Bank Format Export:** บิวต์ไฟล์สกุล txt ตามโครงสร้างระบบธนาคาร พาณิชย์ (Payroll Direct Credit)

### 🧩 กลุ่ม 3: ฟีเจอร์เฉพาะธุรกิจที่ครอบคลุม (Business-specific extensions)
- **Construction / Logistics:** มีค่าเบี้ยเลี้ยงรายวัน (Per Diem) เบี้ยการเดินทางตามรอบวิ่ง หรือเหมาจ่าย
- **Service:** มีส่วนรับคอมมิชชันและทิป เพิ่มเติมจากการขายจริง

### 🔗 กลุ่ม 4: การเชื่อมต่อและการบูรณาการ (Integrations)
- **เชื่อมต่อ NexForce:** รับข้อมูลชั่วโมงทำงานและชนิดวันหยุด มาคำนวณ (ข้อมูลตั้งต้น)
- **เชื่อมต่อ NexFinance:** ส่งยอดจ่ายรวม ไปตั้งหนี้บริษัทค้างพนักงานในบัญชี GL (Salary Payable)

---

## 🛠️ Technical Stack & Notes
```text
Thailand Tax Tier Calculation
File Generator (TXT/CSV specific)
```

---

_NexOne Development Team | NexPayroll Specification | April 2026_
