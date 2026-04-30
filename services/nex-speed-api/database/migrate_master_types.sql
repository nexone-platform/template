-- Migration: Add 7 Master Data Type Tables
-- Run this against the nexspeed database to add missing tables

-- ========== PARKING TYPES ==========
CREATE TABLE IF NOT EXISTS nexspeed.parking_types (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.parking_types (name, description, status) VALUES
('ลานจอดของบริษัท', 'พื้นที่จอดรถที่บริษัทเป็นเจ้าของ', 'active'),
('ลานจอดเช่า', 'พื้นที่จอดรถที่เช่าเป็นรายเดือน/ปี', 'active'),
('จุดพักรถ', 'จุดพักแวะระหว่างทาง', 'active'),
('ลานคอนเทนเนอร์', 'ลานสำหรับจอดและวางตู้คอนเทนเนอร์', 'active'),
('ลานจอดชั่วคราว', 'พื้นที่จอดรถที่ใช้ครั้งคราว', 'inactive')
ON CONFLICT DO NOTHING;

-- ========== STORAGE TYPES ==========
CREATE TABLE IF NOT EXISTS nexspeed.storage_types (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.storage_types (name, description, status) VALUES
('คลังสินค้าทั่วไป', 'พื้นที่จัดเก็บสินค้าและชิ้นส่วนทั่วไป', 'active'),
('คลังสินค้าควบคุมอุณหภูมิ', 'พื้นที่จัดเก็บที่ต้องควบคุมอุณหภูมิ', 'active'),
('พื้นที่เก็บของเหลว/น้ำมัน', 'พื้นที่พิเศษสำหรับของเหลวและสารเคมี', 'active'),
('ลานกองวัตถุดิบชั่วคราว', 'พื้นที่ภายนอกอาคารสำหรับพักของ', 'inactive')
ON CONFLICT DO NOTHING;

-- ========== PART CATEGORIES ==========
CREATE TABLE IF NOT EXISTS nexspeed.part_categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.part_categories (name, description, status) VALUES
('เครื่องยนต์', 'อะไหล่เครื่องยนต์หลัก', 'active'),
('ระบบเบรก', 'ระบบเบรกและอุปกรณ์', 'active'),
('ช่วงล่าง', 'ระบบกันสะเทือนและช่วงล่าง', 'active'),
('ระบบไฟฟ้า', 'ระบบไฟฟ้าและอิเล็กทรอนิกส์', 'active'),
('กรอง (น้ำมัน/อากาศ)', 'ไส้กรองต่างๆ', 'active'),
('สายพาน', 'สายพานขับเคลื่อนและสายพานไทม์มิ่ง', 'active'),
('ยาง & ล้อ', 'ยางรถยนต์และกระทะล้อ', 'active'),
('อะไหล่ทั่วไป', 'อะไหล่ทั่วไปและเบ็ดเตล็ด', 'active')
ON CONFLICT DO NOTHING;

-- ========== LIQUID TYPES ==========
CREATE TABLE IF NOT EXISTS nexspeed.liquid_types (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.liquid_types (name, description, status) VALUES
('น้ำมันเครื่อง', 'น้ำมันเครื่องสำหรับเครื่องยนต์', 'active'),
('น้ำมันเกียร์', 'น้ำมันเกียร์และระบบส่งกำลัง', 'active'),
('น้ำมันเบรก', 'น้ำมันเบรกทุกเกรด', 'active'),
('จาระบี', 'จาระบีหล่อลื่น', 'active'),
('น้ำยาหล่อเย็น', 'น้ำยาหล่อเย็นหม้อน้ำ', 'inactive')
ON CONFLICT DO NOTHING;

-- ========== UNIT TYPES ==========
CREATE TABLE IF NOT EXISTS nexspeed.unit_types (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.unit_types (name, description, status) VALUES
('ชิ้น', 'หน่วยชิ้นทั่วไป', 'active'),
('ลิตร', 'หน่วยสำหรับของเหลว', 'active'),
('ชุด', 'อะไหล่ที่มาเป็นชุด', 'active'),
('ตัน', 'หน่วยน้ำหนัก', 'active'),
('กิโลกรัม', 'หน่วยน้ำหนัก', 'active'),
('กล่อง', 'หีบห่อแบบกล่อง', 'inactive')
ON CONFLICT DO NOTHING;

-- ========== MECHANIC TYPES ==========
CREATE TABLE IF NOT EXISTS nexspeed.mechanic_types (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.mechanic_types (name, description, status) VALUES
('ช่างซ่อมรถยนต์', 'ช่างซ่อมบำรุงรถยนต์ หัวลาก รถบรรทุก', 'active'),
('ช่างซ่อมตู้คอนเทนเนอร์', 'ช่างซ่อมบำรุงตู้คอนเทนเนอร์', 'active')
ON CONFLICT DO NOTHING;

-- ========== MECHANIC EXPERTISE ==========
CREATE TABLE IF NOT EXISTS nexspeed.mechanic_expertise (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    mechanic_type VARCHAR(100) NOT NULL DEFAULT '',
    description   TEXT NOT NULL DEFAULT '',
    status        VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.mechanic_expertise (name, mechanic_type, description, status) VALUES
-- ช่างซ่อมรถยนต์
('เครื่องยนต์ดีเซล', 'ช่างซ่อมรถยนต์', 'ซ่อมบำรุงเครื่องยนต์ดีเซล', 'active'),
('ระบบเบรก', 'ช่างซ่อมรถยนต์', 'ซ่อมบำรุงระบบเบรก', 'active'),
('ระบบไฟฟ้า', 'ช่างซ่อมรถยนต์', 'ซ่อมระบบไฟฟ้ารถยนต์', 'active'),
('ช่วงล่าง', 'ช่างซ่อมรถยนต์', 'ซ่อมบำรุงระบบช่วงล่าง', 'active'),
('ระบบแอร์', 'ช่างซ่อมรถยนต์', 'ซ่อมระบบปรับอากาศ', 'active'),
('งานตัวถัง/ทำสี', 'ช่างซ่อมรถยนต์', 'ซ่อมตัวถังและพ่นสี', 'active'),
('เกียร์/คลัทช์', 'ช่างซ่อมรถยนต์', 'ซ่อมบำรุงเกียร์และคลัทช์', 'active'),
('ซ่อมทั่วไป', 'ช่างซ่อมรถยนต์', 'งานซ่อมทั่วไป', 'active'),
-- ช่างซ่อมตู้คอนเทนเนอร์
('ซ่อมทั่วไป', 'ช่างซ่อมตู้คอนเทนเนอร์', 'งานซ่อมตู้คอนเทนเนอร์ทั่วไป', 'active'),
('ซ่อมพื้นตู้', 'ช่างซ่อมตู้คอนเทนเนอร์', 'ซ่อมพื้นตู้คอนเทนเนอร์', 'active'),
('ซ่อมผนังตู้', 'ช่างซ่อมตู้คอนเทนเนอร์', 'ซ่อมผนังตู้คอนเทนเนอร์', 'active'),
('ซ่อมประตูตู้', 'ช่างซ่อมตู้คอนเทนเนอร์', 'ซ่อมประตูตู้คอนเทนเนอร์', 'active'),
('งานเชื่อม/โครงสร้าง', 'ช่างซ่อมตู้คอนเทนเนอร์', 'งานเชื่อมและโครงสร้างตู้', 'active'),
('ระบบทำความเย็น', 'ช่างซ่อมตู้คอนเทนเนอร์', 'ซ่อมระบบทำความเย็นตู้', 'active'),
('ซ่อมหลังคาตู้', 'ช่างซ่อมตู้คอนเทนเนอร์', 'ซ่อมหลังคาตู้คอนเทนเนอร์', 'active'),
('ทำสี/เคลือบกันสนิม', 'ช่างซ่อมตู้คอนเทนเนอร์', 'ทำสีและเคลือบกันสนิมตู้', 'active')
ON CONFLICT DO NOTHING;

-- ========== VEHICLE TYPES ==========
CREATE TABLE IF NOT EXISTS nexspeed.vehicle_types (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status      VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO nexspeed.vehicle_types (name, description, status) VALUES
('รถบรรทุกหัวลาก (Tractor)', 'รถหัวลากสำหรับลากหางพ่วงหรือตู้คอนเทนเนอร์', 'active'),
('รถบรรทุก 10 ล้อ (10-Wheel)', 'รถบรรทุกขนาด 10 ล้อทั่วไป', 'active'),
('รถบรรทุก 6 ล้อ (6-Wheel)', 'รถบรรทุกขนาด 6 ล้อทั่วไป', 'active'),
('รถกระบะขนส่ง (Pickup)', 'รถกระบะแบบตู้ทึบหรือคอกสำหรับส่งของ', 'active'),
('หางกึ่งพ่วง (Semi-Trailer)', 'หางพ่วงแบบกึ่งพ่วงทั่วไป', 'active'),
('หางพ่วงตู้คอนเทนเนอร์ (Chassis)', 'หางพ่วงสำหรับวางตู้คอนเทนเนอร์', 'active'),
('รถตู้เย็น (Refrigerated Truck)', 'รถบรรทุกห้องเย็นควบคุมอุณหภูมิ', 'active'),
('หางพ่วงพื้นเรียบ (Flatbed)', 'หางพ่วงพื้นเรียบสำหรับขนส่งสินค้าหนัก', 'active')
ON CONFLICT DO NOTHING;

-- ========== FIX LOCATIONS TABLE (add status column if missing) ==========
ALTER TABLE nexspeed.locations ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
