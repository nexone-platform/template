const { Client } = require('pg');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

const hashPassword = (plain) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const users = [
  { employee_id: 'USR-001', display_name: 'สมชาย รักดี', email: 'somchai.r@nexone.co.th', role_name: 'Super Admin', role_id: 1 },
  { employee_id: 'USR-002', display_name: 'สมหญิง จริงใจ', email: 'somying.j@nexone.co.th', role_name: 'Fleet Manager', role_id: 2 },
  { employee_id: 'USR-003', display_name: 'วิชัย มั่นคง', email: 'wichai.m@nexone.co.th', role_name: 'Warehouse Lead', role_id: 3 },
  { employee_id: 'USR-004', display_name: 'นารี สวยสด', email: 'naree.s@nexone.co.th', role_name: 'Accountant', role_id: 4 },
  { employee_id: 'USR-005', display_name: 'เอกพงษ์ กล้าหาญ', email: 'ekapong.k@nexone.co.th', role_name: 'Dispatcher', role_id: 5 },
];

async function seed() {
  await client.connect();
  
  // Set schema
  await client.query('SET search_path TO nex_core');
  
  // Clean existing? Wait, what if there are existing users? 
  // Let's delete existing test users first
  await client.query("DELETE FROM users WHERE email IN ('somchai.r@nexone.co.th', 'somying.j@nexone.co.th', 'wichai.m@nexone.co.th', 'naree.s@nexone.co.th', 'ekapong.k@nexone.co.th')");

  for (const user of users) {
    const hashed = hashPassword('123456');
    await client.query(`
      INSERT INTO users (id, employee_id, display_name, email, password, role_id, role_name, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
    `, [uuidv4(), user.employee_id, user.display_name, user.email, hashed, user.role_id, user.role_name]);
    console.log(`Inserted ${user.display_name}`);
  }
  
  await client.end();
}

seed().catch(console.error);
