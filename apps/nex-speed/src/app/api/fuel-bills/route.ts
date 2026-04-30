import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Auto-create table on first use
async function ensureTable() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS fuel_bills (
      id SERIAL PRIMARY KEY,
      bill_id VARCHAR(50) UNIQUE NOT NULL,
      bill_no VARCHAR(100),
      fill_date VARCHAR(200),
      station VARCHAR(200),
      branch VARCHAR(200),
      fuel_type VARCHAR(100),
      liters VARCHAR(50),
      price_per_liter VARCHAR(50),
      total_amount VARCHAR(50),
      odometer VARCHAR(50),
      tax_id VARCHAR(100),
      payment_method VARCHAR(100),
      vehicle_id VARCHAR(50),
      driver_id VARCHAR(50),
      driver_name VARCHAR(200),
      ocr_raw_text TEXT,
      image_data TEXT,
      scanned_at VARCHAR(200),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

// GET: List fuel bills (with optional driver_id / vehicle_id filter)
export async function GET(req: NextRequest) {
    try {
        await ensureTable();
        const { searchParams } = new URL(req.url);
        const driverId = searchParams.get('driver_id');
        const vehicleId = searchParams.get('vehicle_id');

        let query = 'SELECT * FROM fuel_bills';
        const params: string[] = [];
        const conditions: string[] = [];

        if (driverId) {
            conditions.push(`driver_id = $${params.length + 1}`);
            params.push(driverId);
        }
        if (vehicleId) {
            conditions.push(`vehicle_id = $${params.length + 1}`);
            params.push(vehicleId);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY created_at DESC LIMIT 100';

        const result = await pool.query(query, params);
        return NextResponse.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Fuel bills GET error:', error);
        return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
}

// POST: Create a new fuel bill
export async function POST(req: NextRequest) {
    try {
        await ensureTable();
        const body = await req.json();
        const {
            billId, billNo, fillDate, station, branch, fuelType,
            liters, pricePerLiter, totalAmount, odometer, taxId,
            paymentMethod, vehicleId, driverId, driverName,
            ocrRawText, imageData, scannedAt,
        } = body;

        const result = await pool.query(
            `INSERT INTO fuel_bills (
        bill_id, bill_no, fill_date, station, branch, fuel_type,
        liters, price_per_liter, total_amount, odometer, tax_id,
        payment_method, vehicle_id, driver_id, driver_name,
        ocr_raw_text, image_data, scanned_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *`,
            [
                billId, billNo, fillDate, station, branch, fuelType,
                liters, pricePerLiter, totalAmount, odometer, taxId,
                paymentMethod, vehicleId, driverId, driverName,
                ocrRawText, imageData, scannedAt,
            ]
        );

        return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
    } catch (error) {
        console.error('Fuel bills POST error:', error);
        return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
    }
}
