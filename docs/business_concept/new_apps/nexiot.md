# 📡 NexIoT — IoT & Sensor Integration Hub

**App Concept Document | April 2026**
**Path:** `docs/business_concept/new_apps/nexiot.md`
**Status:** 🆕 New App Proposal

---

## 🎯 วัตถุประสงค์

NexIoT คือ **Platform เชื่อมต่อ Sensor และ Device** จากโลกจริงเข้ากับ NexOne ERP ข้อมูลจาก Sensor (อุณหภูมิ, ความชื้น, GPS, Machine Status) จะถูกประมวลผล แจ้งเตือน และเชื่อมโยงกับ Business Process อัตโนมัติ

---

## 🏢 ธุรกิจที่ต้องการ

| ธุรกิจ | Sensor ที่ใช้ | Use Case |
|---|---|---|
| **Cold Chain Logistics** | Temperature + Humidity | ตรวจอุณหภูมิห้องเย็น/รถนม ตลอดเส้นทาง |
| **Manufacturing** | Machine Sensor, Power Meter | OEE Real-time, Predictive Maintenance |
| **Warehouse** | Weight Scale, Door Sensor | รับส่งสินค้าอัตโนมัติ |
| **Construction** | GPS + Motion Sensor | ติดตามเครื่องจักรหน้างาน |
| **Real Estate** | Energy Meter, Water Meter | ค่าไฟ/ค่าน้ำต่อ Unit อัตโนมัติ |
| **Fleet** | GPS + OBD-II | ติดตามรถ + สุขภาพเครื่องยนต์ |

---

## 📋 ฟีเจอร์หลัก

### Module 1: Device Registry
```
├── ลงทะเบียน Sensor/Device ทุกตัว
│       ├── Device ID, Type, Location
│       ├── Asset ที่ติดอยู่ ← [NexAsset]
│       └── Calibration Date + Next Cal Date
└── Dashboard: Device Online/Offline Status
```

### Module 2: Real-time Monitoring
```
├── Live Dashboard: ค่า Sensor แบบ Real-time
│       ├── Temperature: กราฟ + Min/Max
│       ├── Humidity: %RH
│       ├── Power: kW + kWh สะสม
│       └── GPS Location: แผนที่เคลื่อนที่
├── Historical Data: ย้อนดูข้อมูลย้อนหลัง
└── Data Export: CSV สำหรับ Report
```

### Module 3: Alert Engine
```
├── กำหนด Threshold ต่อ Sensor/Zone:
│       ├── Temperature เกิน -18°C (Cold Chain)
│       └── Vibration ผิดปกติ (Machine)
├── Alert ส่งผ่าน:
│       ├── Push Notification (NexField App)
│       ├── SMS
│       ├── LINE Notify
│       └── Email
└── Escalation: ถ้าไม่ได้รับการตอบสนองใน X นาที → แจ้งชั้นถัดไป
```

### Module 4: Business Rule Integration
```
├── Cold Chain:
│       ├── อุณหภูมิเกิน → สร้าง Ticket [NexSales] อัตโนมัติ
│       └── บันทึกลง Report สำหรับ Compliance
├── Manufacturing:
│       ├── Machine หยุด (Downtime) → สร้าง Work Order [NexMaint]
│       └── Power เกิน Baseline → แจ้ง Engineer
├── Fleet:
│       ├── GPS ออกนอก Zone (Geofence) → แจ้งเตือน
│       └── OBD Error Code → สร้าง PM [NexMaint]
└── Real Estate:
        └── อ่านค่ามิเตอร์ → [NexFinance] คำนวณค่าไฟ/น้ำอัตโนมัติ
```

### Module 5: OEE (Manufacturing)
```
├── Availability: เครื่องเดิน vs หยุด (จาก Machine Sensor)
├── Performance: ความเร็วจริง vs Nominal
├── Quality: ของดี vs ของเสีย (จาก Sensor ปลาย Line)
└── OEE = A × P × Q → แสดงใน [NexBI]
```

### Module 6: Certificate & Compliance (Cold Chain)
```
├── Temperature Log ตลอด Trip
├── ออก Temperature Certificate อัตโนมัติ
│       ├── แนบ PDF ไปกับ Delivery Note
└── Audit Trail: ใครแก้ Threshold, เมื่อไหร่
```

---

## 🔗 Integration

```
NexIoT ←→ NexAsset     (Device ติดกับ Asset ไหน)
NexIoT ←→ NexMaint     (Alert → Work Order ซ่อม)
NexIoT ←→ NexSales     (Alert → Service Ticket)
NexIoT ←→ NexFinance   (Auto-billing จาก Meter)
NexIoT ←→ NexBI        (Real-time Sensor Dashboard)
NexIoT ←→ NexLess      (Certificate, Log Export)
NexIoT ← MQTT Broker   (Sensor Protocol)
NexIoT ← REST API      (Device ที่ Push Data มาเอง)
NexIoT ← GPS Tracker   (Fleet, Construction)
```

---

## 🛠️ Technical Architecture

```
┌──────────────────────────────────────────┐
│           Physical Layer                  │
│  Sensor → Gateway → Internet             │
│  (MQTT / HTTP POST / LoRaWAN)            │
└─────────────────┬────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│           NexIoT Platform                │
│  ├── MQTT Broker (Mosquitto/EMQ)         │
│  ├── Stream Processing (Time-Series DB)  │
│  │       └── InfluxDB / TimescaleDB      │
│  ├── Alert Engine (Rule-based)           │
│  └── REST API → NexOne Apps             │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│           NexOne ERP                     │
│  NexMaint / NexSales / NexFinance / NexBI│
└──────────────────────────────────────────┘
```

---

## 📊 Success Metrics

| KPI | เป้าหมาย |
|---|---|
| Alert Response Time | < 30 วินาที จาก Event |
| Data Ingestion Rate | > 10,000 Data Points/วินาที |
| Uptime | 99.9% |
| False Alert Rate | < 2% |
| OEE Accuracy vs Manual | ±2% |

---

## 🗓️ Development Timeline (ประมาณการ)

| Phase | ระยะเวลา | สิ่งที่ทำ |
|---|---|---|
| Phase 1 | 8 สัปดาห์ | MQTT Broker, Device Registry, Basic Alert → Cold Chain |
| Phase 2 | 6 สัปดาห์ | OEE Integration, Maintenance Trigger, GPS Fleet |
| Phase 3 | 4 สัปดาห์ | Auto-billing, Certificate Generator, BI Dashboard |

---

_NexOne Development Team | NexIoT App Concept | April 2026_
