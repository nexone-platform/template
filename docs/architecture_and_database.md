# NexOne ERP — Architecture, Tech Stack & Database Concept

เอกสารฉบับนี้รวบรวมสถาปัตยกรรมทางเทคโนโลยี (Technical Architecture) และคอนเซ็ปต์การออกแบบฐานข้อมูล (Database Concept) สำหรับพัฒนาแพลตฟอร์ม NexOne ERP ซึ่งเป็นระบบ Monorepo แพลตฟอร์มที่ครอบคลุม 21 แอปพลิเคชัน

---

## 1. 🚀 Technology Stack (เทคโนโลยีที่เจาะจงใช้งาน)

เพื่อความชัดเจนในการพัฒนาของทีม ระบบถูกออกแบบเป็น **Polyglot Microservices** คือมีการใช้ภาษาที่เหมาะสมตามหน้าที่ของแต่ละส่วน ดังนี้:

### 🖥️ Frontend (User Interface)
โมดูลทั้งหมดในฝั่ง Web Application (แอปพลิเคชัน 21 ตัว เช่น NexSpeed, NexStock ฯลฯ และ Component Library)
*   **Framework:** **React + Next.js** (รองรับทั้ง App Router / Pages Router ตามความเหมาะสม)
*   **Language:** **TypeScript** (เพื่อให้ Type ปลอดภัยทั้งระบบ)
*   **Styling:** TailwindCSS + CSS Variables (กำหนดโทนสีและ Design Token ส่วนกลางใน `packages/ui`)
*   **State Management:** React Query (จัดการ Server State/API) และ Zustand (จัดการ Client State)

### ⚙️ Backend (Microservices & Gateway)
แยกระบบหลังบ้านตามความเหมาะสมเพื่อรีดประสิทธิภาพให้ได้สูงสุด:
*   **API Gateway & Shared Services (เช่น Auth Service):**
    *   **Framework:** **NestJS** (รันบน Node.js)
    *   **Language:** **TypeScript**
    *   **หน้าที่:** เป็นประตูทางเข้ากลาง (Gateway) คอยจัดการ Routing ส่งไปหา Service แกนหลัก, จัดการ Authentication (JWT/SSO), Validation, และ Rate Limiting เนื่องจากฝั่งนี้ใช้คลังความรู้ TypeScript เดียวกับ Frontend ทำให้แชร์ Code/Types กันง่าย
*   **Core Business Microservices (เช่น `nex-speed-api`):**
    *   **Language:** **Go (Golang)**
    *   **หน้าที่:** รับผิดชอบ Business logic ที่มีการคำนวณหนัก หรือต้องการ Concurrency สูงแบบ Low-latency เช่น การจัดคิวรถ, คำนวณสต็อก, ระบบเชื่อมต่อ GPS (WebSocket) โดยใช้ความโดดเด่นด้าน Performance ของ Go มาขับเคลื่อน

---

## 2. 🗄️ Database Architecture (คอนเซ็ปต์ฐานข้อมูลลูกค้า)

ระบบเป็น **PostgreSQL** โดยใช้สถาปัตยกรรมกั้นข้อมูลลูกค้าแบบ **Database-per-Tenant** เพื่อรับประกันความปลอดภัยของข้อมูลลูกค้าองค์กร (Isolate Data) ขั้นสูงสุด

### 2.1 การสร้าง Database อัตโนมัติเมื่อลูกค้าลงทะเบียน
เมื่อองค์กร/บริษัท ทำการสมัครแพ็กเกจเริ่มใช้งาน ระบบต้อนรับ (Onboarding Service) จะสั่งการไปยัง Database Server ให้ **"สร้าง Database ก้อนใหม่และแยกขาดกัน"** ตามลูกค้ารายนั้นๆ
*   **Database Naming Convention:** `nexone_{ชื่อบริษัทลูกค้า หรือ tenant_id}`
*   **ตัวอย่าง 1:** ลูกค้าบริษัท ABC ลงทะเบียน → ระบบสร้าง Database ชื่อ `nexone_abc`
*   **ตัวอย่าง 2:** ลูกค้าบริษัท XYZ ลงทะเบียน → ระบบสร้าง Database ชื่อ `nexone_xyz`

### 2.2 โครงสร้าง Schema (การกั้นห้องแยกแอปภายใน DB ลูกค้า)
ภายใน Database ย่อยของลูกค้าแต่ละราย (เช่น ภายในก้อน `nexone_abc`) จะถูกสร้าง **Schema** แยกย่อยเพื่อลดการตีกันของชื่อตารางระหว่างแอปพลิเคชัน 21 ตัว แต่ยังคงความสามารถในการทำ `JOIN` ตารางหากันได้:

*   **🌟 1. Core Schema (ข้อมูลระดับกลางของบริษัท)**
    *   **ชื่อ Schema:** `nex_core`
    *   **บทบาท:** เก็บข้อมูลหลัก (Master Data) ที่ต้องลากไปแชร์ให้แอปอื่นๆ ทุกแอปใช้ เช่น ตารางพนักงาน `users`, แผนก `departments`, สิทธิ์ `roles`, `permissions`, ผังโครงสร้างองค์กร 
    *   **สาเหตุ:** เป็น Single Source of Truth ป้องกันความซ้ำซ้อน

*   **📱 2. App-specific Schemas (ข้อมูลระดับแอปพลิเคชัน)**
    *   **ชื่อ Schema:** `nex_{ชื่อย่อแอป}`
    *   **บทบาท:** เเยก Application Context ออกจากกันอย่างเป็นระเบียบ
    *   **ตัวอย่าง Schema:**
        *   `nex_speed` : เก็บข้อมูลเส้นทาง (trips), ยานพาหนะ, ข้อมูลจัดคิวยานพาหนะ
        *   `nex_stock` : เก็บข้อมูล Location สินค้าคลัง, ใบรับเข้า (GR), เบิกออก (GI)
        *   `nex_finance`: เก็บสมุดบัญชีแยกประเภท (GL), ลูกหนี้ (AR), เจ้าหนี้ (AP)
        *   `nex_sales` : เก็บใบเสนอราคาราคา (Quotation), ดีลลูกค้า (Deals)

> **💡 Best Practice ยามเมื่อใช้งาน (Use Case Analysis):**
> สมมติว่าระบบ *NexSpeed* ต้องการดึงรายชื่อ "พนักงานขับรถ" ซึ่งข้อมูลนั้นมาจากระบบกลาง (หรือ NexForce)
> ระบบหลังบ้านสามารถยิง Query ข้าม Schema ได้ทันที เช่น:
> ```sql
> SELECT t.trip_id, t.status, u.first_name, u.last_name 
> FROM nex_speed.trips t
> JOIN nex_core.users u ON t.driver_id = u.id;
> ```
> *ไม่ต้องทำ API ข้าม Service หรือ Event Bus ให้ซับซ้อน ทำให้การพัฒนามีสปีดที่เร็วมาก*

---

## 3. 📂 โครงสร้าง GitHub Repository (Turborepo)

```text
nex-solution/                          ← GitHub Repo (Monorepo)
│
├── apps/                              ← ส่วนประมวลผล Frontend React + Next.js
│   ├── nex-speed/                     (TMS)
│   ├── nex-stock/                     (WMS)
│   ├── nex-finance/                   (Finance)
│   └── ...แอปอื่นๆ จนครบ 21 แอป
│
├── packages/                          ← Shared Libraries ใช้ร่วมกันแพลตฟอร์ม
│   ├── ui/                            (Design System: React, UI Components)
│   ├── config/                        (Constants, ESLint)
│   └── types/                         (Shared TS Interfaces)
│
├── services/                          ← ส่วนประมวลผล Backend
│   ├── gateway/                       (NestJS API Gateway)
│   ├── nex-speed-api/                 (Go Service สำหรับ TMS)
│   └── ...Service อื่นๆ ตามระบบ
│
├── docs/                              ← ไฟล์เอกสารเช่นไฟล์ Architecture ฉบับนี้
├── turbo.json
└── package.json
```
