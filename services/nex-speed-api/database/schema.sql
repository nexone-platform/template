-- NexSpeed TMS Database Schema
-- DB: nexspeed | Schema: nexspeed

CREATE SCHEMA IF NOT EXISTS nexspeed;
SET search_path TO nexspeed;

-- ========== VEHICLES ==========
CREATE TABLE IF NOT EXISTS nexspeed.vehicles (
    id              VARCHAR(20) PRIMARY KEY,
    plate_number    VARCHAR(20) NOT NULL UNIQUE,
    type            VARCHAR(50) NOT NULL,
    brand           VARCHAR(50) NOT NULL,
    model           VARCHAR(50) NOT NULL,
    year            INTEGER NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'available',
    fuel_level      INTEGER NOT NULL DEFAULT 100,
    mileage         NUMERIC(10,1) NOT NULL DEFAULT 0,
    next_maintenance DATE,
    insurance_expiry DATE,
    driver_id       VARCHAR(20),
    current_lat     NUMERIC(10,6),
    current_lng     NUMERIC(10,6),
    capacity        NUMERIC(6,1) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ========== DRIVERS ==========
CREATE TABLE IF NOT EXISTS nexspeed.drivers (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    license_type    VARCHAR(10) NOT NULL,
    license_expiry  DATE NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'off-duty',
    safety_score    INTEGER NOT NULL DEFAULT 100,
    hours_today     NUMERIC(4,1) NOT NULL DEFAULT 0,
    total_trips     INTEGER NOT NULL DEFAULT 0,
    vehicle_id      VARCHAR(20),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ========== ORDERS ==========
CREATE TABLE IF NOT EXISTS nexspeed.orders (
    id              VARCHAR(30) PRIMARY KEY,
    customer_name   VARCHAR(200) NOT NULL,
    origin          VARCHAR(200) NOT NULL,
    destination     VARCHAR(200) NOT NULL,
    cargo_type      VARCHAR(100) NOT NULL,
    weight          NUMERIC(8,2) NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority        VARCHAR(20) NOT NULL DEFAULT 'normal',
    delivery_date   DATE,
    estimated_cost  NUMERIC(12,2) NOT NULL DEFAULT 0,
    vehicle_id      VARCHAR(20),
    driver_id       VARCHAR(20),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ========== TRIPS ==========
CREATE TABLE IF NOT EXISTS nexspeed.trips (
    id                  VARCHAR(20) PRIMARY KEY,
    order_id            VARCHAR(30) NOT NULL,
    vehicle_id          VARCHAR(20) NOT NULL,
    driver_id           VARCHAR(20) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'planned',
    origin              VARCHAR(200) NOT NULL,
    destination         VARCHAR(200) NOT NULL,
    departure_time      TIMESTAMP,
    estimated_arrival   TIMESTAMP,
    actual_arrival      TIMESTAMP,
    distance            NUMERIC(8,1) NOT NULL DEFAULT 0,
    progress            INTEGER NOT NULL DEFAULT 0,
    current_lat         NUMERIC(10,6) NOT NULL DEFAULT 0,
    current_lng         NUMERIC(10,6) NOT NULL DEFAULT 0,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- ========== INVOICES ==========
CREATE TABLE IF NOT EXISTS nexspeed.invoices (
    id              VARCHAR(30) PRIMARY KEY,
    customer_name   VARCHAR(200) NOT NULL,
    trip_id         VARCHAR(20),
    order_id        VARCHAR(30),
    amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE,
    paid_date       DATE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ========== SUBCONTRACTORS ==========
CREATE TABLE IF NOT EXISTS nexspeed.subcontractors (
    id                  VARCHAR(20) PRIMARY KEY,
    company_name        VARCHAR(200) NOT NULL,
    contact_person      VARCHAR(100) NOT NULL,
    phone               VARCHAR(20) NOT NULL,
    tier                VARCHAR(10) NOT NULL DEFAULT 'bronze',
    vehicle_count       INTEGER NOT NULL DEFAULT 0,
    performance_score   INTEGER NOT NULL DEFAULT 0,
    on_time_rate        NUMERIC(5,1) NOT NULL DEFAULT 0,
    bounce_rate         NUMERIC(5,1) NOT NULL DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending-approval',
    total_trips         INTEGER NOT NULL DEFAULT 0,
    license_valid       BOOLEAN NOT NULL DEFAULT false,
    insurance_valid     BOOLEAN NOT NULL DEFAULT false,
    join_date           DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- ========== ALERTS ==========
CREATE TABLE IF NOT EXISTS nexspeed.alerts (
    id              SERIAL PRIMARY KEY,
    type            VARCHAR(20) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT,
    severity        VARCHAR(10) NOT NULL DEFAULT 'info',
    is_read         BOOLEAN NOT NULL DEFAULT false,
    entity_type     VARCHAR(20),
    entity_id       VARCHAR(30),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ========== REVENUE DATA (monthly aggregation) ==========
CREATE TABLE IF NOT EXISTS nexspeed.revenue_monthly (
    id              SERIAL PRIMARY KEY,
    month           VARCHAR(10) NOT NULL,
    year            INTEGER NOT NULL,
    revenue         NUMERIC(14,2) NOT NULL DEFAULT 0,
    cost            NUMERIC(14,2) NOT NULL DEFAULT 0,
    profit          NUMERIC(14,2) NOT NULL DEFAULT 0,
    UNIQUE(month, year)
);
-- ========== SEED DATA ==========

-- ePOD Table (create if not exists)
CREATE TABLE IF NOT EXISTS nexspeed.epod (
    id                  SERIAL PRIMARY KEY,
    trip_id             VARCHAR(20) NOT NULL,
    receiver_name       VARCHAR(200) NOT NULL,
    signature_url       TEXT DEFAULT '',
    photo_url           TEXT DEFAULT '',
    product_photo_url   TEXT DEFAULT '',
    delivery_photo_url  TEXT DEFAULT '',
    notes               TEXT DEFAULT '',
    lat                 DOUBLE PRECISION DEFAULT 0,
    lng                 DOUBLE PRECISION DEFAULT 0,
    submitted_at        TIMESTAMP DEFAULT NOW(),
    UNIQUE(trip_id)
);

-- ========== SEED DATA ==========

-- Vehicles
INSERT INTO nexspeed.vehicles (id, plate_number, type, brand, model, year, status, fuel_level, mileage, next_maintenance, insurance_expiry, capacity, driver_id, current_lat, current_lng) VALUES
('V001', '1กก 1234', 'รถ 10 ล้อ', 'HINO', 'FL8J', 2024, 'on-trip', 72, 45320, '2026-04-15', '2026-12-31', 15, 'D001', 13.7563, 100.5018),
('V002', '2ขข 5678', 'รถเทรลเลอร์', 'ISUZU', 'GXZ', 2023, 'on-trip', 45, 82100, '2026-03-20', '2026-06-30', 25, 'D002', 14.0723, 100.6048),
('V003', '3คค 9012', 'รถ 6 ล้อ', 'MITSUBISHI', 'FE85', 2025, 'available', 90, 12500, '2026-05-01', '2027-01-15', 8, NULL, NULL, NULL),
('V004', '4งง 3456', 'รถ 10 ล้อ', 'HINO', 'FM8J', 2024, 'on-trip', 55, 58900, '2026-04-10', '2026-11-30', 15, 'D004', 13.3611, 100.9847),
('V005', '5จจ 7890', 'รถตู้', 'TOYOTA', 'HiAce', 2025, 'available', 85, 8200, '2026-06-01', '2027-02-28', 2, NULL, NULL, NULL),
('V006', '6ฉฉ 2345', 'รถห้องเย็น', 'ISUZU', 'NPR', 2024, 'maintenance', 30, 67800, '2026-03-10', '2026-08-15', 5, NULL, NULL, NULL),
('V007', '7ชช 6789', 'รถ 10 ล้อ', 'HINO', 'FL8J', 2023, 'available', 95, 91200, '2026-05-20', '2026-10-31', 15, NULL, NULL, NULL),
('V008', '8ซซ 0123', 'รถ 6 ล้อ', 'MITSUBISHI', 'FE85', 2025, 'inactive', 0, 5400, '2026-07-01', '2027-03-31', 8, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Drivers
INSERT INTO nexspeed.drivers (id, name, phone, license_type, license_expiry, status, safety_score, hours_today, total_trips, vehicle_id) VALUES
('D001', 'สมชาย พิทักษ์', '081-234-5678', 'ท.4', '2027-06-15', 'on-duty', 92, 6.5, 245, 'V001'),
('D002', 'วิชัย สมใจ', '089-876-5432', 'ท.4', '2027-03-20', 'on-duty', 88, 4.2, 312, 'V002'),
('D003', 'ประเสริฐ แก้วมณี', '085-111-2233', 'ท.3', '2026-09-10', 'off-duty', 95, 0, 178, NULL),
('D004', 'สุรศักดิ์ ชัยวงศ์', '087-444-5566', 'ท.4', '2027-01-05', 'on-duty', 78, 7.8, 289, 'V004'),
('D005', 'อนุชา ลิ้มสกุล', '082-777-8899', 'ท.2', '2026-11-30', 'off-duty', 90, 0, 156, NULL),
('D006', 'ธนพล ศรีสุข', '083-333-4455', 'ท.4', '2027-08-22', 'on-leave', 85, 0, 201, NULL),
('D007', 'วรากร จันทร์ฉาย', '086-666-7788', 'ท.3', '2026-12-15', 'off-duty', 91, 0, 132, NULL)
ON CONFLICT (id) DO NOTHING;

-- Orders
INSERT INTO nexspeed.orders (id, customer_name, origin, destination, cargo_type, weight, status, priority, delivery_date, estimated_cost, vehicle_id, driver_id) VALUES
('ORD-2026-0001', 'บริษัท สยามซีเมนต์ จำกัด', 'คลังสินค้าสระบุรี', 'ท่าเรือแหลมฉบัง', 'วัสดุก่อสร้าง', 22, 'in-transit', 'normal', '2026-03-08', 15800, 'V001', 'D001'),
('ORD-2026-0002', 'บริษัท ซีพี ออลล์ จำกัด', 'DC ลาดกระบัง', 'คลังสินค้าชลบุรี', 'สินค้าอุปโภค', 12, 'in-transit', 'express', '2026-03-08', 8500, 'V002', 'D002'),
('ORD-2026-0003', 'บริษัท ปูนซิเมนต์ไทย จำกัด', 'โรงงานท่าหลวง', 'กรุงเทพฯ (คลองเตย)', 'ปูนซีเมนต์', 14, 'pending', 'normal', '2026-03-09', 11200, NULL, NULL),
('ORD-2026-0004', 'บริษัท เบทาโกร จำกัด', 'โรงงานลพบุรี', 'คลัง DC สมุทรปราการ', 'อาหารแช่แข็ง', 8, 'pending', 'urgent', '2026-03-09', 9800, NULL, NULL),
('ORD-2026-0005', 'บริษัท โตโยต้า มอเตอร์ จำกัด', 'โรงงานเกตเวย์', 'ท่าเรือแหลมฉบัง', 'ชิ้นส่วนยานยนต์', 18, 'completed', 'normal', '2026-03-07', 18900, 'V004', 'D004')
ON CONFLICT (id) DO NOTHING;

-- Trips
INSERT INTO nexspeed.trips (id, order_id, vehicle_id, driver_id, status, origin, destination, departure_time, estimated_arrival, distance, progress, current_lat, current_lng) VALUES
('TRP-001', 'ORD-2026-0001', 'V001', 'D001', 'in-transit', 'คลังสินค้าสระบุรี', 'ท่าเรือแหลมฉบัง', '2026-03-08 06:00:00', '2026-03-08 12:30:00', 185, 65, 13.7563, 100.5018),
('TRP-002', 'ORD-2026-0002', 'V002', 'D002', 'in-transit', 'DC ลาดกระบัง', 'คลังสินค้าชลบุรี', '2026-03-08 07:30:00', '2026-03-08 10:00:00', 95, 80, 14.0723, 100.6048),
('TRP-003', 'ORD-2026-0005', 'V004', 'D004', 'loading', 'โรงงานเกตเวย์', 'ท่าเรือแหลมฉบัง', '2026-03-08 08:00:00', '2026-03-08 11:00:00', 45, 10, 13.3611, 100.9847)
ON CONFLICT (id) DO NOTHING;

-- Invoices
INSERT INTO nexspeed.invoices (id, customer_name, trip_id, order_id, amount, status, issue_date, due_date) VALUES
('INV-2026-001', 'บริษัท สยามซีเมนต์ จำกัด', 'TRP-001', 'ORD-2026-0001', 15800, 'paid', '2026-03-01', '2026-03-15'),
('INV-2026-002', 'บริษัท ซีพี ออลล์ จำกัด', 'TRP-002', 'ORD-2026-0002', 8500, 'pending', '2026-03-03', '2026-03-17'),
('INV-2026-003', 'บริษัท เบทาโกร จำกัด', NULL, 'ORD-2026-0004', 12500, 'overdue', '2026-02-20', '2026-03-05'),
('INV-2026-004', 'บริษัท ทรู คอร์ปอเรชั่น จำกัด', NULL, NULL, 4200, 'paid', '2026-03-05', '2026-03-19'),
('INV-2026-005', 'บริษัท โตโยต้า มอเตอร์ จำกัด', 'TRP-003', 'ORD-2026-0005', 18900, 'pending', '2026-03-07', '2026-03-21'),
('INV-2026-006', 'บริษัท ลาซาด้า จำกัด', NULL, NULL, 5100, 'paid', '2026-03-02', '2026-03-16'),
('INV-2026-007', 'บริษัท ปตท. จำกัด (มหาชน)', NULL, NULL, 28000, 'draft', '2026-03-08', '2026-03-22'),
('INV-2026-008', 'บริษัท บุญรอด บริวเวอรี่ จำกัด', NULL, NULL, 13500, 'pending', '2026-03-06', '2026-03-20')
ON CONFLICT (id) DO NOTHING;

-- Subcontractors
INSERT INTO nexspeed.subcontractors (id, company_name, contact_person, phone, tier, vehicle_count, performance_score, on_time_rate, bounce_rate, status, total_trips, license_valid, insurance_valid, join_date) VALUES
('SUB-001', 'หจก. ขนส่งเจริญยิ่ง', 'สมศักดิ์ เจริญกิจ', '081-555-0001', 'gold', 25, 95, 97, 2, 'active', 450, true, true, '2024-06-15'),
('SUB-002', 'บจก. สปีดทรานส์', 'วิชัย สุขสำราญ', '089-555-0002', 'gold', 18, 92, 95, 3, 'active', 380, true, true, '2024-08-20'),
('SUB-003', 'บจก. ขนส่งไทยเร็ว', 'ประเสริฐ ดีมาก', '085-555-0003', 'silver', 12, 85, 88, 8, 'active', 210, true, true, '2025-01-10'),
('SUB-004', 'หจก. รถหกล้อทอง', 'ทองดี มีสุข', '087-555-0004', 'silver', 8, 80, 85, 10, 'active', 145, true, false, '2025-03-05'),
('SUB-005', 'บจก. โลจิสติกส์แม่น้ำ', 'อนุชา น้ำใจดี', '082-555-0005', 'bronze', 5, 72, 78, 15, 'suspended', 65, false, true, '2025-06-20'),
('SUB-006', 'บจก. ส่งด่วนตะวันออก', 'ศักดิ์ดา แซ่ตั้ง', '086-555-0006', 'bronze', 3, 68, 75, 18, 'pending-approval', 0, true, true, '2026-03-01')
ON CONFLICT (id) DO NOTHING;

-- Alerts
INSERT INTO nexspeed.alerts (type, title, message, severity, entity_type, entity_id) VALUES
('maintenance', 'V006 ถึงกำหนดเข้าซ่อมบำรุง', 'รถทะเบียน 6ฉฉ 2345 ถึงกำหนดเข้าซ่อมบำรุงตาม Schedule', 'warning', 'vehicle', 'V006'),
('hos', 'D004 ชั่วโมงขับใกล้ถึงลิมิต', 'คนขับ สุรศักดิ์ ชัยวงศ์ ขับมาแล้ว 7.8 ชม. (ลิมิต 8 ชม.)', 'danger', 'driver', 'D004'),
('fuel', 'V002 น้ำมันเหลือต่ำ', 'น้ำมันเหลือ 45% ควรเติมก่อนถึงปลายทาง', 'warning', 'vehicle', 'V002'),
('delivery', 'TRP-001 กำลังจะถึงปลายทาง', 'ทริป สระบุรี → แหลมฉบัง เหลืออีก ~35% ของเส้นทาง', 'info', 'trip', 'TRP-001'),
('insurance', 'V002 ประกันภัยใกล้หมดอายุ', 'ประกันภัย 2ขข 5678 จะหมดอายุวันที่ 30 มิ.ย. 2026', 'warning', 'vehicle', 'V002');

-- Revenue Monthly
INSERT INTO nexspeed.revenue_monthly (month, year, revenue, cost, profit) VALUES
('ม.ค.', 2026, 2450000, 1850000, 600000),
('ก.พ.', 2026, 2680000, 1920000, 760000),
('มี.ค.', 2026, 2890000, 2010000, 880000),
('เม.ย.', 2025, 2350000, 1780000, 570000),
('พ.ค.', 2025, 2720000, 1950000, 770000),
('มิ.ย.', 2025, 3100000, 2150000, 950000)
ON CONFLICT (month, year) DO NOTHING;

-- ========== NOTIFICATIONS ==========
CREATE TABLE IF NOT EXISTS nexspeed.notifications (
    id              SERIAL PRIMARY KEY,
    type            VARCHAR(30) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL DEFAULT '',
    icon            VARCHAR(10) NOT NULL DEFAULT '📢',
    is_read         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.notifications (type, title, message, icon, is_read, created_at) VALUES
('trip_complete', 'ทริป TRP-003 เสร็จสิ้น', 'DC บางนา → ขอนแก่น ถึงปลายทางแล้ว', '🚛', false, NOW() - INTERVAL '2 minutes'),
('maintenance', 'V005 ถึงกำหนดซ่อมบำรุง', 'ระยะทาง 89,500/90,000 กม. - ควรนัดเข้าศูนย์', '🔧', false, NOW() - INTERVAL '15 minutes'),
('hos_warning', 'คนขับ D007 เกิน HOS', 'ขับมาแล้ว 7.5 ชม. เหลืออีก 30 นาที ควรหยุดพัก', '⚠️', false, NOW() - INTERVAL '25 minutes'),
('fuel_alert', 'V011 น้ำมันต่ำ', 'ระดับน้ำมัน 12% — แนะนำเติมที่ปั๊มใกล้สุด', '⛽', true, NOW() - INTERVAL '30 minutes'),
('new_order', 'ออเดอร์ใหม่ ORD-018', 'สินค้า 2.5 ตัน กรุงเทพ → เชียงใหม่ Priority: เร่งด่วน', '📦', true, NOW() - INTERVAL '45 minutes'),
('speed_alert', 'V009 ขับเกินความเร็ว', 'ความเร็ว 105 กม./ชม. เกินกำหนด 90 กม./ชม.', '🚨', true, NOW() - INTERVAL '1 hour'),
('geofence', 'V002 ออกนอกเขต Geofence', 'รถเบี่ยงออกจากเส้นทาง กม.45 ชลบุรี', '📍', true, NOW() - INTERVAL '90 minutes'),
('invoice', 'Invoice INV-006 เกินกำหนด', 'ลูกค้า บจก.สยามเทรด ค้างชำระ ฿125,000', '💰', true, NOW() - INTERVAL '2 hours');

-- ========== AI INSIGHTS ==========
CREATE TABLE IF NOT EXISTS nexspeed.ai_insights (
    id              SERIAL PRIMARY KEY,
    type            VARCHAR(20) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    detail          TEXT NOT NULL,
    impact          VARCHAR(200) NOT NULL,
    priority        VARCHAR(10) NOT NULL DEFAULT 'medium',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.ai_insights (type, title, detail, impact, priority) VALUES
('fuel', 'ลดต้นทุนน้ำมัน 15%', 'รถ V003, V007, V011 ใช้น้ำมันสูงกว่าค่าเฉลี่ย — แนะนำตรวจสภาพเครื่องยนต์และยางลม', 'ประหยัด ฿45,000/เดือน', 'high'),
('time', 'เส้นทาง กรุงเทพ→ขอนแก่น สามารถลดเวลา 40 นาที', 'ใช้เส้นทาง มอเตอร์เวย์ 6 + ถนน 2 แทนเส้นทางเดิม — หลีกเลี่ยงจุดติดที่ สระบุรี', 'ลด 40 นาที/ทริป', 'medium'),
('cost', 'Consolidate ออเดอร์ เพื่อลด Empty Mile', '3 ออเดอร์ปลายทาง นครราชสีมา สามารถรวมเป็น 1 ทริป — ลด Empty Mile จาก 32% เหลือ 18%', 'ประหยัด ฿28,000/สัปดาห์', 'high'),
('safety', 'คนขับ 4 คน เกิน HOS สัปดาห์นี้', 'D003 (สมชัย), D007 (วิทยา), D011 (ประสิทธิ์), D014 (สุรชัย) ขับเกิน 8 ชม./วัน — ควรจัดตารางพักใหม่', 'ลดความเสี่ยงอุบัติเหตุ', 'high'),
('fuel', 'เปลี่ยนเส้นทางขาเปล่าเพื่อรับงาน backhaul', 'รถ 5 คันกลับโกดังโดยไม่มีของ — จับคู่กับออเดอร์ใกล้เคียงเพื่อลดต้นทุน', 'เพิ่มรายได้ ฿65,000/เดือน', 'medium'),
('cost', 'พัสดุด่วน 3 รายการ ควรใช้รถตู้เล็กแทน 6 ล้อ', 'ออเดอร์น้ำหนัก <500 กก. ใช้รถ 6 ล้อไม่คุ้มค่า — เปลี่ยนเป็นรถตู้ ลดต้นทุนน้ำมัน 60%', 'ประหยัด ฿12,000/สัปดาห์', 'low');

-- ========== USERS ==========
CREATE TABLE IF NOT EXISTS nexspeed.users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(100),
    role            VARCHAR(20) NOT NULL DEFAULT 'viewer',
    avatar          VARCHAR(10) DEFAULT '',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    last_login      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Seed users (passwords are bcrypt-hashed "password123")
INSERT INTO nexspeed.users (username, password_hash, name, email, role, avatar, is_active, last_login) VALUES
('patinya', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ปติญญา ผู้ดูแลระบบ', 'patinya@nexspeed.co.th', 'admin', '👨‍💼', true, '2026-03-09 08:15:00'),
('somchai', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'สมชาย ผู้จัดการรถบริษัท', 'somchai@nexspeed.co.th', 'fleet-manager', '👨', true, '2026-03-09 07:30:00'),
('wipa', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'วิภา บัญชี', 'wipa@nexspeed.co.th', 'finance', '👩', true, '2026-03-08 17:00:00'),
('tanapol', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ธนพล ดิสแพตช์', 'tanapol@nexspeed.co.th', 'dispatcher', '👨', true, '2026-03-09 06:00:00'),
('nittaya', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'นิตยา CS', 'nittaya@nexspeed.co.th', 'customer-service', '👩', true, '2026-03-08 16:30:00'),
('amnuay', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'อำนวย ช่างซ่อม', 'amnuay@nexspeed.co.th', 'maintenance', '🔧', false, '2026-03-01 09:00:00'),
('kitti', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'กิตติ คลังสินค้า', 'kitti@nexspeed.co.th', 'warehouse', '📦', true, '2026-03-09 07:45:00'),
('rattana', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'รัตนา รายงาน', 'rattana@nexspeed.co.th', 'analyst', '📊', true, '2026-03-08 15:00:00')
ON CONFLICT (username) DO NOTHING;

-- ========== MAINTENANCE RECORDS ==========
CREATE TABLE IF NOT EXISTS nexspeed.maintenance_records (
    id              VARCHAR(30) PRIMARY KEY,
    vehicle_id      VARCHAR(20) NOT NULL,
    type            VARCHAR(50) NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    status          VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    priority        VARCHAR(20) NOT NULL DEFAULT 'normal',
    scheduled_date  DATE,
    completed_date  DATE,
    cost            NUMERIC(12,2) NOT NULL DEFAULT 0,
    mechanic        VARCHAR(100) DEFAULT '',
    garage          VARCHAR(200) DEFAULT '',
    mileage_at      NUMERIC(10,1) DEFAULT 0,
    notes           TEXT DEFAULT '',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.maintenance_records (id, vehicle_id, type, description, status, priority, scheduled_date, completed_date, cost, mechanic, garage, mileage_at) VALUES
('MNT-001', 'V001', 'เปลี่ยนถ่ายน้ำมันเครื่อง', 'เปลี่ยนน้ำมันเครื่อง + กรอง', 'completed', 'normal', '2026-02-15', '2026-02-15', 3500, 'ช่างสมชาย', 'อู่เจริญยนต์', 42000),
('MNT-002', 'V002', 'เปลี่ยนผ้าเบรก', 'เปลี่ยนผ้าเบรกหน้า-หลัง', 'in-progress', 'high', '2026-03-08', NULL, 8500, 'ช่างวิทยา', 'ศูนย์ ISUZU สระบุรี', 80000),
('MNT-003', 'V006', 'ซ่อมระบบทำความเย็น', 'คอมเพรสเซอร์ห้องเย็นไม่ทำงาน', 'scheduled', 'urgent', '2026-03-12', NULL, 25000, '', 'ร้าน เจริญแอร์', 67800),
('MNT-004', 'V003', 'ตรวจเช็คตามระยะ', 'ตรวจเช็ค 10,000 กม.', 'completed', 'normal', '2026-02-20', '2026-02-20', 4200, 'ช่างสมชาย', 'อู่เจริญยนต์', 10000),
('MNT-005', 'V004', 'เปลี่ยนยาง', 'เปลี่ยนยางหน้า 2 เส้น', 'scheduled', 'normal', '2026-03-15', NULL, 16000, '', 'ร้านยาง ป.ยางยนต์', 58900)
ON CONFLICT (id) DO NOTHING;

-- ========== MECHANICS ==========
CREATE TABLE IF NOT EXISTS nexspeed.mechanics (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    specialization  VARCHAR(100) NOT NULL DEFAULT '',
    experience      INTEGER NOT NULL DEFAULT 0,
    rating          NUMERIC(3,1) NOT NULL DEFAULT 0,
    garage          VARCHAR(200) DEFAULT '',
    address         VARCHAR(300) DEFAULT '',
    certification   VARCHAR(200) DEFAULT '',
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    notes           TEXT DEFAULT '',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.mechanics (id, name, phone, specialization, experience, rating, garage, address, certification, status) VALUES
('MCH-001', 'ช่างสมชาย วิเศษ', '081-111-2222', 'เครื่องยนต์ดีเซล', 15, 4.8, 'อู่เจริญยนต์', 'ถ.พหลโยธิน กม.42 สระบุรี', 'ใบรับรอง HINO, ISUZU', 'active'),
('MCH-002', 'ช่างวิทยา กล้าหาญ', '089-333-4444', 'ระบบเบรก & ช่วงล่าง', 10, 4.5, 'ศูนย์ ISUZU สระบุรี', 'ถ.มิตรภาพ กม.5 สระบุรี', 'ใบรับรอง ISUZU', 'active'),
('MCH-003', 'ช่างประเสริฐ ดีเลิศ', '085-555-6666', 'ระบบไฟฟ้า & แอร์', 8, 4.2, 'ร้าน เจริญแอร์', 'ถ.เทศบาล 1 สระบุรี', '', 'active'),
('MCH-004', 'ช่างอำนวย ใจดี', '087-777-8888', 'เครื่องยนต์ทั่วไป', 20, 4.9, 'อู่อำนวยยนต์', 'ถ.พหลโยธิน กม.50 สระบุรี', 'ใบรับรอง HINO, MITSUBISHI', 'active')
ON CONFLICT (id) DO NOTHING;

-- ========== CONTAINER MECHANICS ==========
CREATE TABLE IF NOT EXISTS nexspeed.container_mechanics (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    specialization  VARCHAR(100) NOT NULL DEFAULT '',
    experience      INTEGER NOT NULL DEFAULT 0,
    rating          NUMERIC(3,1) NOT NULL DEFAULT 0,
    garage          VARCHAR(200) DEFAULT '',
    address         VARCHAR(300) DEFAULT '',
    certification   VARCHAR(200) DEFAULT '',
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    notes           TEXT DEFAULT '',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.container_mechanics (id, name, phone, specialization, experience, rating, garage, address, certification, status) VALUES
('CMH-001', 'ช่างทองดี แน่นหนา', '081-222-3333', 'ซ่อมพื้น/ผนังตู้', 12, 4.6, 'อู่ทองดี คอนเทนเนอร์', 'ท่าเรือแหลมฉบัง ชลบุรี', 'IICL Certified', 'active'),
('CMH-002', 'ช่างสุรชัย เชื่อม', '089-444-5555', 'งานเชื่อม & โครงสร้าง', 18, 4.8, 'อู่สุรชัย เวลดิ้ง', 'ถ.สุขุมวิท ศรีราชา ชลบุรี', 'AWS Welding Cert', 'active'),
('CMH-003', 'ช่างวิรัช ทำความเย็น', '085-666-7777', 'ระบบทำความเย็น (Reefer)', 10, 4.4, 'ร้าน วิรัช รีเฟอร์', 'นิคมอุตฯ ลาดกระบัง', 'Carrier/Thermoking Cert', 'active')
ON CONFLICT (id) DO NOTHING;

-- ========== PARTS SHOPS ==========
CREATE TABLE IF NOT EXISTS nexspeed.parts_shops (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    contact_person  VARCHAR(100) NOT NULL DEFAULT '',
    phone           VARCHAR(20) NOT NULL,
    line_id         VARCHAR(50) DEFAULT '',
    category        VARCHAR(100) NOT NULL DEFAULT '',
    address         VARCHAR(300) DEFAULT '',
    rating          NUMERIC(3,1) NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    notes           TEXT DEFAULT '',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.parts_shops (id, name, contact_person, phone, line_id, category, address, rating, status) VALUES
('SHP-001', 'ร้าน เจริญอะไหล่', 'คุณเจริญ', '036-111-222', '@charoen-part', 'อะไหล่เครื่องยนต์, กรอง', 'ถ.พหลโยธิน กม.40 สระบุรี', 4.7, 'active'),
('SHP-002', 'ป.เบรค เซ็นเตอร์', 'คุณประเสริฐ', '036-333-444', '@p-brake', 'ผ้าเบรก, ระบบเบรก', 'ถ.มิตรภาพ สระบุรี', 4.5, 'active'),
('SHP-003', 'ไฟฟ้ายนต์ พาร์ท', 'คุณสมศรี', '081-555-666', '', 'ระบบไฟฟ้า, แบตเตอรี่', 'ถ.เทศบาล สระบุรี', 4.3, 'active'),
('SHP-004', 'ศูนย์ HINO สระบุรี', 'คุณวิทยา', '036-777-888', '@hino-saraburi', 'อะไหล่ HINO แท้', 'ถ.พหลโยธิน กม.45 สระบุรี', 4.9, 'active')
ON CONFLICT (id) DO NOTHING;

-- ========== STOCK PARTS ==========
CREATE TABLE IF NOT EXISTS nexspeed.stock_parts (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    part_number     VARCHAR(50) NOT NULL DEFAULT '',
    category        VARCHAR(100) NOT NULL DEFAULT '',
    quantity        INTEGER NOT NULL DEFAULT 0,
    min_stock       INTEGER NOT NULL DEFAULT 5,
    unit            VARCHAR(20) NOT NULL DEFAULT 'ชิ้น',
    unit_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
    location        VARCHAR(100) DEFAULT '',
    supplier        VARCHAR(200) DEFAULT '',
    status          VARCHAR(20) NOT NULL DEFAULT 'in-stock',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.stock_parts (id, name, part_number, category, quantity, min_stock, unit, unit_price, location, supplier, status) VALUES
('SP-001', 'กรองน้ำมันเครื่อง HINO', 'HN-OF-001', 'กรอง (น้ำมัน/อากาศ)', 45, 10, 'ชิ้น', 350, 'คลัง A-01', 'ร้าน เจริญอะไหล่', 'in-stock'),
('SP-002', 'ผ้าเบรกหน้า 10 ล้อ', 'BK-FP-010', 'ระบบเบรก', 8, 10, 'ชุด', 2800, 'คลัง B-03', 'ป.เบรค เซ็นเตอร์', 'low-stock'),
('SP-003', 'แบตเตอรี่ 12V 150Ah', 'EL-BT-150', 'ระบบไฟฟ้า', 12, 5, 'ลูก', 4500, 'คลัง A-02', 'ไฟฟ้ายนต์ พาร์ท', 'in-stock'),
('SP-004', 'สายพาน V-Belt B68', 'EN-VB-068', 'สายพาน', 0, 5, 'เส้น', 280, 'คลัง C-01', 'ร้าน เจริญอะไหล่', 'out-of-stock'),
('SP-005', 'กรองอากาศ ISUZU FRR', 'IS-AF-FRR', 'กรอง (น้ำมัน/อากาศ)', 22, 8, 'ชิ้น', 850, 'คลัง A-01', 'ร้าน เจริญอะไหล่', 'in-stock'),
('SP-006', 'โช้คอัพหน้า HINO 500', 'HN-SA-500', 'ช่วงล่าง', 4, 4, 'ต้น', 6500, 'คลัง B-01', 'ศูนย์ HINO สระบุรี', 'low-stock')
ON CONFLICT (id) DO NOTHING;

-- ========== STOCK OIL ==========
CREATE TABLE IF NOT EXISTS nexspeed.stock_oil (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    type            VARCHAR(100) NOT NULL DEFAULT '',
    brand           VARCHAR(100) NOT NULL DEFAULT '',
    quantity        INTEGER NOT NULL DEFAULT 0,
    min_stock       INTEGER NOT NULL DEFAULT 10,
    unit            VARCHAR(20) NOT NULL DEFAULT 'ลิตร',
    unit_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
    location        VARCHAR(100) DEFAULT '',
    supplier        VARCHAR(200) DEFAULT '',
    expiry_date     DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'in-stock',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.stock_oil (id, name, type, brand, quantity, min_stock, unit, unit_price, location, supplier, expiry_date, status) VALUES
('OIL-001', 'น้ำมันเครื่อง Shell Rimula R4 15W-40', 'น้ำมันเครื่อง', 'Shell', 120, 30, 'ลิตร', 180, 'คลังน้ำมัน A', 'อรุณ ออยล์', '2027-06-30', 'in-stock'),
('OIL-002', 'น้ำมันเกียร์ PTT Performa ATF', 'น้ำมันเกียร์', 'PTT', 25, 20, 'ลิตร', 220, 'คลังน้ำมัน A', 'อรุณ ออยล์', '2027-03-15', 'low-stock'),
('OIL-003', 'น้ำมันเบรก DOT 4', 'น้ำมันเบรก', 'Bosch', 40, 15, 'ลิตร', 350, 'คลังน้ำมัน B', 'ร้าน เจริญอะไหล่', '2027-12-31', 'in-stock'),
('OIL-004', 'จาระบี Mobil XHP 222', 'จาระบี', 'Mobil', 0, 10, 'กก.', 280, 'คลังน้ำมัน B', 'อรุณ ออยล์', '2027-09-30', 'out-of-stock'),
('OIL-005', 'น้ำยาหม้อน้ำ Prestone', 'น้ำยาหม้อน้ำ', 'Prestone', 50, 15, 'ลิตร', 150, 'คลังน้ำมัน A', 'ร้าน เจริญอะไหล่', '2028-01-31', 'in-stock')
ON CONFLICT (id) DO NOTHING;

-- ========== STORAGE LOCATIONS ==========
CREATE TABLE IF NOT EXISTS nexspeed.storage_locations (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    type            VARCHAR(100) NOT NULL DEFAULT '',
    address         VARCHAR(300) DEFAULT '',
    capacity        VARCHAR(50) DEFAULT '',
    current_usage   VARCHAR(10) DEFAULT '0%',
    contact_person  VARCHAR(100) DEFAULT '',
    phone           VARCHAR(20) DEFAULT '',
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    notes           TEXT DEFAULT '',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.storage_locations (id, name, type, address, capacity, current_usage, contact_person, phone, status) VALUES
('WH-001', 'คลังอะไหล่ สำนักงานใหญ่', 'คลังอะไหล่', 'ถ.พหลโยธิน กม.42 สระบุรี', '500 ตร.ม.', '65%', 'คุณสมชาย', '081-111-2222', 'active'),
('WH-002', 'คลังน้ำมัน A', 'คลังน้ำมัน', 'ถ.พหลโยธิน กม.42 สระบุรี', '10,000 ลิตร', '45%', 'คุณวิทยา', '081-333-4444', 'active'),
('WH-003', 'คลังน้ำมัน B', 'คลังน้ำมัน', 'นิคมอุตฯ ลาดกระบัง', '15,000 ลิตร', '80%', 'คุณประเสริฐ', '089-555-6666', 'active'),
('WH-004', 'โกดังสินค้า ชลบุรี', 'โกดังสินค้า', 'ถ.สุขุมวิท ศรีราชา ชลบุรี', '2,000 ตร.ม.', '92%', 'คุณสมศรี', '038-111-222', 'full'),
('WH-005', 'คลังยาง สระบุรี', 'คลังยาง', 'ถ.มิตรภาพ สระบุรี', '200 ตร.ม.', '30%', 'คุณเจริญ', '036-333-444', 'active')
ON CONFLICT (id) DO NOTHING;

-- ========== PARKING LOTS ==========
CREATE TABLE IF NOT EXISTS nexspeed.parking_lots (
    id              VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    address         VARCHAR(300) DEFAULT '',
    total_slots     INTEGER NOT NULL DEFAULT 0,
    used_slots      INTEGER NOT NULL DEFAULT 0,
    type            VARCHAR(100) NOT NULL DEFAULT '',
    facilities      VARCHAR(300) DEFAULT '',
    contact_person  VARCHAR(100) DEFAULT '',
    phone           VARCHAR(20) DEFAULT '',
    monthly_rent    NUMERIC(12,2) NOT NULL DEFAULT 0,
    latitude        NUMERIC(10, 6),
    longitude       NUMERIC(10, 6),
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    notes           TEXT DEFAULT '',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.parking_lots (id, name, address, total_slots, used_slots, type, facilities, contact_person, phone, monthly_rent, latitude, longitude, status) VALUES
('PKG-001', 'ลานจอดรถ สำนักงานใหญ่', 'ถ.พหลโยธิน กม.42 สระบุรี', 30, 22, 'ลานจอดของบริษัท', 'กล้องวงจรปิด, ไฟส่องสว่าง, รปภ.', 'คุณสมชาย', '081-111-2222', 0, 14.528, 100.916, 'active'),
('PKG-002', 'ลานจอดรถ ลาดกระบัง', 'นิคมอุตฯ ลาดกระบัง กรุงเทพฯ', 50, 48, 'ลานจอดเช่า', 'กล้องวงจรปิด, รปภ. 24 ชม.', 'คุณประเสริฐ', '089-333-4444', 150000, 13.754, 100.771, 'full'),
('PKG-003', 'จุดพักรถ นครราชสีมา', 'ถ.มิตรภาพ กม.180 นครราชสีมา', 20, 8, 'จุดพักรถ', 'ห้องน้ำ, ร้านอาหาร', 'คุณวิทยา', '044-111-222', 30000, 14.869, 101.990, 'active'),
('PKG-004', 'ลานคอนเทนเนอร์ แหลมฉบัง', 'ท่าเรือแหลมฉบัง ชลบุรี', 100, 65, 'ลานคอนเทนเนอร์', 'เครน, กล้อง CCTV, รปภ.', 'คุณสมศรี', '038-222-333', 250000, 13.082, 100.880, 'active'),
('PKG-005', 'ลานจอด สระบุรี 2', 'ถ.พหลโยธิน กม.55 สระบุรี', 15, 0, 'ลานจอดชั่วคราว', 'ไฟส่องสว่าง', 'คุณเจริญ', '036-444-555', 20000, 14.630, 100.890, 'inactive')
ON CONFLICT (id) DO NOTHING;

-- ========== BRANDS ==========
CREATE TABLE IF NOT EXISTS nexspeed.brands (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    name_en         VARCHAR(100) NOT NULL,
    country         VARCHAR(100) NOT NULL DEFAULT '',
    logo            VARCHAR(10) NOT NULL DEFAULT '🚛',
    models          TEXT NOT NULL DEFAULT '',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.brands (id, name, name_en, country, logo, models) VALUES
(1, 'ฮีโน่', 'HINO', 'ญี่ปุ่น', '🚛', 'FL8J,FM8J,FG8J,FC9J,XZU'),
(2, 'อีซูซุ', 'ISUZU', 'ญี่ปุ่น', '🚚', 'GXZ,FXZ,FVM,NPR,NMR,Deca'),
(3, 'มิตซูบิชิ ฟูโซ่', 'MITSUBISHI FUSO', 'ญี่ปุ่น', '🚛', 'FE85,FI,FJ,FV'),
(4, 'โตโยต้า', 'TOYOTA', 'ญี่ปุ่น', '🚐', 'HiAce,Hilux Revo,Dyna'),
(5, 'นิสสัน', 'NISSAN', 'ญี่ปุ่น', '🚐', 'Urvan,Navara,Atlas'),
(6, 'สแกนเนีย', 'SCANIA', 'สวีเดน', '🚛', 'P-Series,G-Series,R-Series,S-Series'),
(7, 'วอลโว่', 'VOLVO', 'สวีเดน', '🚛', 'FM,FH,FMX,FE'),
(8, 'เมอร์เซเดส-เบนซ์', 'MERCEDES-BENZ', 'เยอรมนี', '🚛', 'Actros,Axor,Atego,Sprinter'),
(9, 'แมน', 'MAN', 'เยอรมนี', '🚛', 'TGX,TGS,TGM,TGL'),
(10, 'UD ทรัคส์', 'UD TRUCKS', 'ญี่ปุ่น', '🚛', 'Quester,Croner,Kuzer'),
(11, 'ฟอร์ด', 'FORD', 'สหรัฐอเมริกา', '🚐', 'Ranger,Transit,F-150'),
(12, 'ยาว', 'JAC', 'จีน', '🚚', 'N-Series,K-Series,T-Series'),
(13, 'โฟตอน', 'FOTON', 'จีน', '🚚', 'Aumark,Auman,Tunland'),
(14, 'ทาทา', 'TATA', 'อินเดีย', '🚛', 'Ultra,Prima,LPT'),
(15, 'ฮุนได', 'HYUNDAI', 'เกาหลีใต้', '🚚', 'Mighty,Xcient,HD')
ON CONFLICT (id) DO NOTHING;

SELECT setval('nexspeed.brands_id_seq', 15, true);

-- ========== PROVINCES ==========
CREATE TABLE IF NOT EXISTS nexspeed.provinces (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    name_en         VARCHAR(100) NOT NULL,
    abbr            VARCHAR(5) NOT NULL DEFAULT '',
    region          VARCHAR(100) NOT NULL DEFAULT '',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.provinces (id, name, name_en, abbr, region) VALUES
(1,'กรุงเทพมหานคร','Bangkok','กท','กลาง'),
(2,'กระบี่','Krabi','กบ','ใต้'),
(3,'กาญจนบุรี','Kanchanaburi','กจ','ตะวันตก'),
(4,'กาฬสินธุ์','Kalasin','กส','ตะวันออกเฉียงเหนือ'),
(5,'กำแพงเพชร','Kamphaeng Phet','กพ','กลาง'),
(6,'ขอนแก่น','Khon Kaen','ขก','ตะวันออกเฉียงเหนือ'),
(7,'จันทบุรี','Chanthaburi','จบ','ตะวันออก'),
(8,'ฉะเชิงเทรา','Chachoengsao','ฉช','ตะวันออก'),
(9,'ชลบุรี','Chon Buri','ชบ','ตะวันออก'),
(10,'ชัยนาท','Chainat','ชน','กลาง'),
(11,'ชัยภูมิ','Chaiyaphum','ชย','ตะวันออกเฉียงเหนือ'),
(12,'ชุมพร','Chumphon','ชพ','ใต้'),
(13,'เชียงราย','Chiang Rai','ชร','เหนือ'),
(14,'เชียงใหม่','Chiang Mai','ชม','เหนือ'),
(15,'ตรัง','Trang','ตง','ใต้'),
(16,'ตราด','Trat','ตร','ตะวันออก'),
(17,'ตาก','Tak','ตก','ตะวันตก'),
(18,'นครนายก','Nakhon Nayok','นย','กลาง'),
(19,'นครปฐม','Nakhon Pathom','นฐ','กลาง'),
(20,'นครพนม','Nakhon Phanom','นพ','ตะวันออกเฉียงเหนือ'),
(21,'นครราชสีมา','Nakhon Ratchasima','นม','ตะวันออกเฉียงเหนือ'),
(22,'นครศรีธรรมราช','Nakhon Si Thammarat','นศ','ใต้'),
(23,'นครสวรรค์','Nakhon Sawan','นว','กลาง'),
(24,'นนทบุรี','Nonthaburi','นบ','กลาง'),
(25,'นราธิวาส','Narathiwat','นธ','ใต้'),
(26,'น่าน','Nan','นน','เหนือ'),
(27,'บุรีรัมย์','Buri Ram','บร','ตะวันออกเฉียงเหนือ'),
(28,'บึงกาฬ','Bueng Kan','บก','ตะวันออกเฉียงเหนือ'),
(29,'ปทุมธานี','Pathum Thani','ปท','กลาง'),
(30,'ประจวบคีรีขันธ์','Prachuap Khiri Khan','ปข','ตะวันตก'),
(31,'ปราจีนบุรี','Prachin Buri','ปจ','ตะวันออก'),
(32,'ปัตตานี','Pattani','ปน','ใต้'),
(33,'พระนครศรีอยุธยา','Phra Nakhon Si Ayutthaya','อย','กลาง'),
(34,'พะเยา','Phayao','พย','เหนือ'),
(35,'พังงา','Phangnga','พง','ใต้'),
(36,'พัทลุง','Phatthalung','พท','ใต้'),
(37,'พิจิตร','Phichit','พช','กลาง'),
(38,'พิษณุโลก','Phitsanulok','พล','กลาง'),
(39,'เพชรบุรี','Phetchaburi','พบ','ตะวันตก'),
(40,'เพชรบูรณ์','Phetchabun','พช','กลาง'),
(41,'แพร่','Phrae','พร','เหนือ'),
(42,'ภูเก็ต','Phuket','ภก','ใต้'),
(43,'มหาสารคาม','Maha Sarakham','มค','ตะวันออกเฉียงเหนือ'),
(44,'มุกดาหาร','Mukdahan','มห','ตะวันออกเฉียงเหนือ'),
(45,'แม่ฮ่องสอน','Mae Hong Son','มส','เหนือ'),
(46,'ยโสธร','Yasothon','ยส','ตะวันออกเฉียงเหนือ'),
(47,'ยะลา','Yala','ยล','ใต้'),
(48,'ร้อยเอ็ด','Roi Et','รอ','ตะวันออกเฉียงเหนือ'),
(49,'ระนอง','Ranong','รน','ใต้'),
(50,'ระยอง','Rayong','รย','ตะวันออก'),
(51,'ราชบุรี','Ratchaburi','รบ','ตะวันตก'),
(52,'ลพบุรี','Lop Buri','ลบ','กลาง'),
(53,'ลำปาง','Lampang','ลป','เหนือ'),
(54,'ลำพูน','Lamphun','ลพ','เหนือ'),
(55,'เลย','Loei','ลย','ตะวันออกเฉียงเหนือ'),
(56,'ศรีสะเกษ','Si Sa Ket','ศก','ตะวันออกเฉียงเหนือ'),
(57,'สกลนคร','Sakon Nakhon','สน','ตะวันออกเฉียงเหนือ'),
(58,'สงขลา','Songkhla','สข','ใต้'),
(59,'สตูล','Satun','สต','ใต้'),
(60,'สมุทรปราการ','Samut Prakan','สป','กลาง'),
(61,'สมุทรสงคราม','Samut Songkhram','สส','กลาง'),
(62,'สมุทรสาคร','Samut Sakhon','สค','กลาง'),
(63,'สระแก้ว','Sa Kaeo','สก','ตะวันออก'),
(64,'สระบุรี','Saraburi','สบ','กลาง'),
(65,'สิงห์บุรี','Sing Buri','สห','กลาง'),
(66,'สุโขทัย','Sukhothai','สท','กลาง'),
(67,'สุพรรณบุรี','Suphan Buri','สพ','กลาง'),
(68,'สุราษฎร์ธานี','Surat Thani','สฎ','ใต้'),
(69,'สุรินทร์','Surin','สร','ตะวันออกเฉียงเหนือ'),
(70,'หนองคาย','Nong Khai','นค','ตะวันออกเฉียงเหนือ'),
(71,'หนองบัวลำภู','Nong Bua Lam Phu','นภ','ตะวันออกเฉียงเหนือ'),
(72,'อ่างทอง','Ang Thong','อท','กลาง'),
(73,'อำนาจเจริญ','Amnat Charoen','อจ','ตะวันออกเฉียงเหนือ'),
(74,'อุดรธานี','Udon Thani','อด','ตะวันออกเฉียงเหนือ'),
(75,'อุตรดิตถ์','Uttaradit','อต','เหนือ'),
(76,'อุทัยธานี','Uthai Thani','อน','กลาง'),
(77,'อุบลราชธานี','Ubon Ratchathani','อบ','ตะวันออกเฉียงเหนือ')
ON CONFLICT (id) DO NOTHING;

SELECT setval('nexspeed.provinces_id_seq', 77, true);

-- ========== LOCATIONS ==========
CREATE TABLE IF NOT EXISTS nexspeed.locations (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    type            VARCHAR(20) NOT NULL DEFAULT 'both',
    address         VARCHAR(300) DEFAULT '',
    province        VARCHAR(100) DEFAULT '',
    lat             NUMERIC(10,4) NOT NULL DEFAULT 0,
    lng             NUMERIC(10,4) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.locations (id, name, type, address, province, lat, lng) VALUES
(1, 'คลังสินค้ากรุงเทพ', 'origin', '123 ถ.พระราม 2 บางขุนเทียน', 'กรุงเทพฯ', 13.6585, 100.4783),
(2, 'คลังสินค้าบางนา', 'both', '456 ถ.บางนา-ตราด กม.5', 'สมุทรปราการ', 13.6513, 100.6421),
(3, 'นิคมอุตสาหกรรมอมตะ', 'destination', '700 นิคมอมตะ ต.คลองตำหรุ', 'ชลบุรี', 13.3246, 101.1071),
(4, 'ท่าเรือแหลมฉบัง', 'destination', 'ถ.สุขุมวิท ต.ทุ่งสุขลา', 'ชลบุรี', 13.0829, 100.8808),
(5, 'คลังสินค้าเชียงใหม่', 'both', '88 ถ.ซุปเปอร์ไฮเวย์ ต.หนองป่าครั่ง', 'เชียงใหม่', 18.7813, 98.9853),
(6, 'โรงงานนครราชสีมา', 'origin', '299 ถ.มิตรภาพ ต.สุรนารี', 'นครราชสีมา', 14.9799, 102.0977),
(7, 'คลังกลางขอนแก่น', 'both', '555 ถ.มิตรภาพ ต.ศิลา', 'ขอนแก่น', 16.4322, 102.8236),
(8, 'ท่าเรือกรุงเทพ (คลองเตย)', 'destination', 'ถ.ทางรถไฟสายปากน้ำ คลองเตย', 'กรุงเทพฯ', 13.7066, 100.5790),
(9, 'ศูนย์กระจายสินค้าหาดใหญ่', 'both', '111 ถ.กาญจนวนิช ต.หาดใหญ่', 'สงขลา', 7.0057, 100.4785),
(10, 'โรงงานระยอง', 'origin', '200 นิคมมาบตาพุด ต.มาบตาพุด', 'ระยอง', 12.7176, 101.1523),
(11, 'คลังสินค้าสุราษฎร์ธานี', 'both', '77 ถ.ศรีวิชัย ต.มะขามเตี้ย', 'สุราษฎร์ธานี', 9.1382, 99.3217),
(12, 'นิคมอุตสาหกรรมลำพูน', 'destination', '198 นิคมอุตสาหกรรมลำพูน', 'ลำพูน', 18.5598, 99.0087)
ON CONFLICT (id) DO NOTHING;

SELECT setval('nexspeed.locations_id_seq', 12, true);

-- ========== SYSTEM APPS ==========
CREATE TABLE IF NOT EXISTS nexspeed.system_apps (
    id              SERIAL PRIMARY KEY,
    app_name        VARCHAR(100) NOT NULL,
    desc_en         VARCHAR(200) NOT NULL,
    desc_th         VARCHAR(200) NOT NULL,
    icon_path       VARCHAR(200) NOT NULL,
    theme_color     VARCHAR(20) NOT NULL,
    status          VARCHAR(20) DEFAULT 'active',
    seq_no          INTEGER NOT NULL DEFAULT 99,
    created_at      TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.system_apps (app_name, desc_en, desc_th, icon_path, theme_color, seq_no) VALUES
('NexSpeed', 'Transportation Management System (TMS)', 'ระบบบริหารจัดการการขนส่งและโลจิสติกส์', '/apps/nexspeed.svg', '#1D4ED8', 1),
('NexSite', 'Enterprise Website Management', 'ระบบบริหารจัดการเว็บไซต์องค์กร', '/apps/nexsite.svg', '#2563EB', 2),
('NexCost', 'Enterprise Cost Optimization', 'แพลตฟอร์มบริหารและเพิ่มประสิทธิภาพต้นทุน', '/apps/nexcost.svg', '#D97706', 3),
('NexForce', 'Human Resource Management System (HRMS)', 'ระบบบริหารจัดการทรัพยากรบุคคลครบวงจร', '/apps/nexforce.svg', '#7C3AED', 4),
('NexLess', 'Smart Paperless & Document Management', 'ระบบจัดการเอกสารดิจิทัลอัจฉริยะ', '/apps/nexless.svg', '#059669', 5),
('NexStock', 'Inventory Management System', 'ระบบบริหารจัดการสินค้าคงคลัง', '/apps/nexstock.svg', '#EA580C', 6),
('NexSales', 'Sales Order Management & CRM', 'ระบบบริหารงานขายและลูกค้าสัมพันธ์', '/apps/nexsales.svg', '#DC2626', 7),
('NexFinance', 'Enterprise Financial Management', 'ระบบบัญชีและการเงินระดับองค์กร', '/apps/nexfinance.svg', '#CA8A04', 8),
('NexProcure', 'Enterprise Procurement System', 'ระบบบริหารจัดการจัดซื้อจัดจ้าง', '/apps/nexprocure.svg', '#0891B2', 9),
('NexProduce', 'Manufacturing Execution System (MES / MRP)', 'ระบบวางแผนและควบคุมการผลิต', '/apps/nexproduce.svg', '#4F46E5', 10),
('NexBI', 'Executive Dashboard & Data Analytics', 'ระบบศูนย์กลางวิเคราะห์ข้อมูลสำหรับผู้บริหาร', '/apps/nexbi.svg', '#DB2777', 11)
ON CONFLICT DO NOTHING;
