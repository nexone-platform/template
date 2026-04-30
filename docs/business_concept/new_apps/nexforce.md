# 👥 NexForce — ระบบบริหารบุคลากรและเวลาทำงาน (Workforce & HR)

**Path:** `docs/business_concept/new_apps/nexforce.md`

## 🎯 วัตถุประสงค์ (Objective)
ใช้จัดการข้อมูลพนักงาน ทักษะ กะการทำงาน การลงเวลาเข้าออก (Timesheet) และการประเมินทักษะที่เกี่ยวข้องกับหน้างาน

## 📂 กลุ่มที่ 1: ฟีเจอร์ข้อมูลหลัก (Master Data & Setup)
- **Employee Registry:** ลงทะเบียนข้อมูลพนักงาน ประวัติส่วนตัว ข้อมูลพื้นฐาน
- **Skill Matrix & Certification:** จัดการทักษะ ใบอนุญาตวิชาชีพ และวันหมดอายุของใบเซอร์
- **Leave Quota:** ตั้งค่าโควตาวันลา และระบบขออนุมัติวันหยุด
- **OT Rules:** ตั้งค่ากติกาและเงื่อนไขการทำงานล่วงเวลา (OT)

## ⚙️ กลุ่มที่ 2: ฟีเจอร์จัดการเวลาและรูปแบบงาน (Time & Shift)
- **Shift Management:** กำหนดและจัดกะทำงาน (Shift A/B/C, กะกลางวัน/กลางคืน)
- **Availability Calendar:** ตารางแสดงความพร้อมและความว่างในการรับงานของพนักงาน (ช่าง/พนักงานบริการ)
- **Timesheet ต่อ Project/Job:** การจดและดึงข้อมูลชั่วโมงทำงานตาม Project หรือ Job เพื่อใช้คิดต้นทุน (Billable Hours)
- **GPS Check-in / Check-out:** ระบบลงเวลาผ่านพิกัด GPS ณ ไซต์งาน จับตำแหน่งจริง (สำหรับพนักงานออกภาคสนาม)
- **Workforce Real-time Map:** แดชบอร์ดติดตามดูพนักงานบนแผนที่แบบ Real-time

## 🏢 กลุ่มที่ 3: ฟีเจอร์เฉพาะธุรกิจ (Business Specific Features)
- **Logistics:** บันทึกข้อมูลและวันหมดอายุใบขับขี่ของ Driver และจัดรอบ
- **Service / Field Service:** GPS Check-in, Skill Matrix สำหรับการจัดคิวให้ช่างเทคนิคซ่อม
- **Construction:** การทำ Daily Timesheet แยกระดับ Phases/โครงการ ควบคุมรอบพนักงานชั่วคราว
- **Manufacturing:** จัดการ Shift และรับรอง Certificate การใช้อุปกรณ์และเครื่องจักรเฉพาะทาง

## 🔗 กลุ่มที่ 4: การเชื่อมต่อ (Integrations)
- **NexPayroll:** ส่งข้อมูลชั่วโมงทำงาน กะ และ OT เพื่อคำนวณเงินเดือน
- **NexProduce / NexField:** คัดกรองพนักงานจาก Skill เพื่อจ่ายงาน (Dispatch)
