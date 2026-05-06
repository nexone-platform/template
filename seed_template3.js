const { Client } = require('pg');

async function seed() {
    const client = new Client({
        user: 'postgres',
        host: '203.151.66.51',
        database: 'nexone_template',
        password: 'qwerty',
        port: 5434,
    });
    
    try {
        await client.connect();
        
        // 1. Insert 30 records into template_checkbox
        console.log('Inserting 30 records into template_checkbox...');
        for(let i=1; i<=30; i++) {
            const id = `ORD-${Math.floor(Date.now() / 1000)}-${i.toString().padStart(3, '0')}`;
            const customer_name = `Customer ${i}`;
            const origin = `Origin ${i}`;
            const destination = `Destination ${i}`;
            const cargo_type = i % 2 === 0 ? 'สินค้าทั่วไป' : 'อาหาร';
            const weight = Math.floor(Math.random() * 1000);
            const status = i % 3 === 0 ? 'pending' : (i % 3 === 1 ? 'in-transit' : 'completed');
            const priority = i % 3 === 0 ? 'normal' : (i % 3 === 1 ? 'urgent' : 'express');
            const delivery_date = new Date().toISOString().split('T')[0];
            const estimated_cost = Math.floor(Math.random() * 5000);
            
            await client.query(`
                INSERT INTO nex_core.template_checkbox 
                (id, customer_name, origin, destination, cargo_type, weight, status, priority, delivery_date, estimated_cost, create_by) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'system')
                ON CONFLICT (id) DO NOTHING
            `, [id, customer_name, origin, destination, cargo_type, weight, status, priority, delivery_date, estimated_cost]);
        }
        
        console.log('Inserted 30 records into template_checkbox');
        
        // 2. Insert translations for Template Master 3
        const translations = [
            // Statuses
            { key: 'status_pending', th: 'รอจัดส่ง', en: 'Pending' },
            { key: 'status_in_transit', th: 'กำลังขนส่ง', en: 'In Transit' },
            { key: 'status_completed', th: 'สำเร็จ', en: 'Completed' },
            { key: 'status_cancelled', th: 'ยกเลิก', en: 'Cancelled' },
            
            // Priorities
            { key: 'priority_normal', th: 'ปกติ', en: 'Normal' },
            { key: 'priority_urgent', th: '🔥 เร่งด่วน', en: '🔥 Urgent' },
            { key: 'priority_express', th: '⚡ ด่วนพิเศษ', en: '⚡ Express' },
            
            // Cargo types
            { key: 'cargo_food', th: 'อาหาร', en: 'Food' },
            { key: 'cargo_material', th: 'วัสดุก่อสร้าง', en: 'Construction Material' },
            { key: 'cargo_chemical', th: 'เคมีภัณฑ์', en: 'Chemicals' },
            { key: 'cargo_electronic', th: 'อิเล็กทรอนิกส์', en: 'Electronics' },
            { key: 'cargo_general', th: 'สินค้าทั่วไป', en: 'General Goods' },
            { key: 'cargo_oil', th: 'น้ำมัน', en: 'Oil' },
            { key: 'cargo_agri', th: 'เกษตร', en: 'Agriculture' },
            { key: 'cargo_others', th: 'อื่นๆ', en: 'Others' },
            
            // Table headers / form labels
            { key: 'order_id', th: 'รหัสเอกสาร', en: 'Order ID' },
            { key: 'customer_name', th: 'ชื่อลูกค้า', en: 'Customer Name' },
            { key: 'route', th: 'เส้นทาง', en: 'Route' },
            { key: 'cargo_type', th: 'ประเภทสินค้า', en: 'Cargo Type' },
            { key: 'weight', th: 'น้ำหนัก (กก.)', en: 'Weight (kg)' },
            { key: 'priority', th: 'ความเร่งด่วน', en: 'Priority' },
            { key: 'estimated_cost', th: 'ค่าใช้จ่ายโดยประมาณ', en: 'Estimated Cost' },
            { key: 'delivery_date', th: 'วันที่จัดส่ง', en: 'Delivery Date' },
            { key: 'status', th: 'สถานะ', en: 'Status' },
            
            // Modals
            { key: 'add_order', th: 'เพิ่มเอกสาร', en: 'Add Order' },
            { key: 'edit_order', th: 'แก้ไขเอกสาร', en: 'Edit Order' },
            { key: 'view_order', th: 'รายละเอียดเอกสาร', en: 'View Order' },
            { key: 'delete_order', th: 'ลบเอกสาร', en: 'Delete Order' },
            
            // Placeholders
            { key: 'search', th: 'ค้นหา...', en: 'Search...' },
            { key: 'save', th: 'บันทึก', en: 'Save' },
            { key: 'cancel', th: 'ยกเลิก', en: 'Cancel' },
            { key: 'export', th: 'ส่งออก', en: 'Export' },
            { key: 'import', th: 'นำเข้า', en: 'Import' },
            { key: 'add_new', th: 'เพิ่มใหม่', en: 'Add New' }
        ];
        
        console.log('Inserting translations...');
        for(const t of translations) {
            // Insert TH
            await client.query(`
                INSERT INTO nex_core.language_translations (translation_id, language_code, page_key, label_key, label_value)
                VALUES (gen_random_uuid(), 'th', 'template-master-3', $1, $2)
            `, [t.key, t.th]);
            
            // Insert EN
            await client.query(`
                INSERT INTO nex_core.language_translations (translation_id, language_code, page_key, label_key, label_value)
                VALUES (gen_random_uuid(), 'en', 'template-master-3', $1, $2)
            `, [t.key, t.en]);
        }
        
        console.log('Done inserting translations.');
        await client.end();
        console.log('Done.');
    } catch(err) {
        console.error('Error:', err);
    }
}

seed();
