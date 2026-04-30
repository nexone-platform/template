import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nexone_techbiz',
  password: 'qwerty',
  port: 5432,
});

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM nex_core.companies ORDER BY id ASC LIMIT 1');
    if (result.rows.length > 0) {
      return NextResponse.json(result.rows[0]);
    } else {
      return NextResponse.json({});
    }
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      company_code, tax_id, name_th, name_en, contact_person, 
      address, country, city, province, zipcode, 
      email, phone, fax, website, logo_path, favicon_path 
    } = body;
    
    // Check if exists
    const checkResult = await pool.query('SELECT id FROM nex_core.companies LIMIT 1');
    if (checkResult.rows.length > 0) {
      const id = checkResult.rows[0].id;
      // Update
      const query = `
        UPDATE nex_core.companies 
        SET company_code = $1, tax_id = $2, name_th = $3, name_en = $4, contact_person = $5,
            address = $6, country = $7, city = $8, province = $9, zipcode = $10,
            email = $11, phone = $12, fax = $13, website = $14, logo_path = $15, favicon_path = $16,
            update_date = CURRENT_TIMESTAMP, update_by = 'system'
        WHERE id = $17
        RETURNING *;
      `;
      const values = [company_code, tax_id, name_th, name_en, contact_person, address, country, city, province, zipcode, email, phone, fax, website, logo_path, favicon_path, id];
      const result = await pool.query(query, values);
      return NextResponse.json(result.rows[0]);
    } else {
      // Insert
      const query = `
        INSERT INTO nex_core.companies (company_code, tax_id, name_th, name_en, contact_person, address, country, city, province, zipcode, email, phone, fax, website, logo_path, favicon_path, create_date, create_by, isactive)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP, 'system', true)
        RETURNING *;
      `;
      const values = [company_code, tax_id, name_th, name_en, contact_person, address, country, city, province, zipcode, email, phone, fax, website, logo_path, favicon_path];
      const result = await pool.query(query, values);
      return NextResponse.json(result.rows[0]);
    }

  } catch (error) {
    console.error('Error saving company:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
