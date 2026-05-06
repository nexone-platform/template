const { Client } = require('pg');
const crypto = require('crypto');

async function test() {
  const client = new Client({
    connectionString: 'postgresql://postgres:qwerty@203.151.66.51:5434/nexone_template' 
  });
  
  try {
    await client.connect();

    console.log('============================================================');
    console.log(' LOGIN FLOW VERIFICATION');
    console.log('============================================================');
    console.log(' Input: workspace_id=TEMPLATE, email=tigerlinly@gmail.com, password=123456');
    console.log('============================================================\n');

    // STEP 1: Find tenant by company_abbreviation = TEMPLATE
    console.log('--- STEP 1: Find tenant_registrations WHERE company_abbreviation = TEMPLATE ---');
    const tenants = await client.query(
      "SELECT id, company_abbreviation, schema_name, provisioning_status, company_name_th FROM nex_core.tenant_registrations WHERE LOWER(company_abbreviation) = LOWER('TEMPLATE')"
    );
    if (tenants.rows.length === 0) {
      console.log('  ❌ NOT FOUND! No tenant with abbreviation "TEMPLATE"');
      console.log('  Available abbreviations:');
      const allAbbr = await client.query("SELECT DISTINCT company_abbreviation, provisioning_status, schema_name FROM nex_core.tenant_registrations ORDER BY company_abbreviation");
      allAbbr.rows.forEach(r => console.log(`    "${r.company_abbreviation}" | status=${r.provisioning_status} | schema=${r.schema_name}`));
      
      console.log('\n  ⚠️ LOGIN WOULD FAIL AT STEP 1: "ไม่พบรหัสองค์กรนี้ในระบบ"');
      return;
    }
    
    const tenant = tenants.rows[0];
    console.log(`  ✅ FOUND: abbr="${tenant.company_abbreviation}" schema="${tenant.schema_name}" status="${tenant.provisioning_status}" name="${tenant.company_name_th}"`);

    // STEP 1b: Check provisioning status
    if (tenant.provisioning_status !== 'completed') {
      console.log(`\n  ❌ PROVISIONING NOT COMPLETED: status="${tenant.provisioning_status}"`);
      console.log('  ⚠️ LOGIN WOULD FAIL: "ระบบขององค์กรท่านกำลังอยู่ระหว่างการจัดสร้าง"');
      return;
    }
    console.log('  ✅ Provisioning status = completed');

    // STEP 2: Connect to tenant database (schema_name)
    const schemaName = tenant.schema_name;
    console.log(`\n--- STEP 2: Connect to tenant DB: ${schemaName} ---`);
    
    // Check if the database exists
    const dbCheck = await client.query("SELECT datname FROM pg_database WHERE datname = $1", [schemaName]);
    if (dbCheck.rows.length === 0) {
      console.log(`  ❌ DATABASE "${schemaName}" DOES NOT EXIST!`);
      console.log('  ⚠️ LOGIN WOULD FAIL WITH TECHNICAL ERROR');
      
      // List available databases
      const dbs = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname");
      console.log('  Available databases:');
      dbs.rows.forEach(r => console.log(`    ${r.datname}`));
      return;
    }
    console.log(`  ✅ Database "${schemaName}" exists`);

    // Connect to tenant database
    const tenantClient = new Client({
      host: '203.151.66.51',
      port: 5434,
      user: 'postgres',
      password: 'qwerty',
      database: schemaName,
    });
    await tenantClient.connect();
    console.log(`  ✅ Connected to ${schemaName}`);

    // STEP 3: Find user in tenant DB
    console.log(`\n--- STEP 3: Find user WHERE email = tigerlinly@gmail.com in ${schemaName} ---`);
    const userRes = await tenantClient.query(
      "SELECT u.*, r.role_name FROM nex_core.users u LEFT JOIN nex_core.roles r ON u.role_id = r.role_id WHERE u.email = $1",
      ['tigerlinly@gmail.com']
    );
    
    if (userRes.rows.length === 0) {
      console.log('  ❌ USER NOT FOUND in tenant database!');
      console.log('  ⚠️ LOGIN WOULD FAIL: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"');
      
      // Show all users in tenant DB
      const allUsers = await tenantClient.query("SELECT id, email, display_name, is_active FROM nex_core.users");
      console.log(`  Available users in ${schemaName}:`);
      allUsers.rows.forEach(r => console.log(`    ${r.email} | name=${r.display_name} | active=${r.is_active}`));
      await tenantClient.end();
      return;
    }

    const user = userRes.rows[0];
    console.log(`  ✅ FOUND: email="${user.email}" name="${user.display_name}" role="${user.role_name}" active=${user.is_active}`);
    console.log(`  failed_login_count = ${user.failed_login_count}`);
    console.log(`  locked_until = ${user.locked_until}`);

    // STEP 3b: Check is_active
    if (!user.is_active) {
      console.log('  ❌ ACCOUNT IS DISABLED');
      console.log('  ⚠️ LOGIN WOULD FAIL: "บัญชีถูกระงับ"');
      await tenantClient.end();
      return;
    }

    // STEP 3c: Check lockout
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      console.log(`  ❌ ACCOUNT IS LOCKED until ${user.locked_until}`);
      await tenantClient.end();
      return;
    }

    // STEP 4: Verify password
    console.log('\n--- STEP 4: Verify password "123456" against stored hash ---');
    const storedHash = user.password;
    if (!storedHash) {
      console.log('  ❌ NO PASSWORD STORED! (password is NULL)');
      console.log('  ⚠️ LOGIN WOULD FAIL: password verification would crash');
      await tenantClient.end();
      return;
    }

    const [salt, hash] = storedHash.split(':');
    console.log(`  Stored: ${storedHash.substring(0, 40)}...`);
    console.log(`  Salt: ${salt}`);
    console.log(`  Hash length: ${hash.length} chars`);

    // Use exact same algo as auth.service.ts: pbkdf2Sync(plain, salt, 100_000, 64, 'sha512')
    const testHash = crypto.pbkdf2Sync('123456', salt, 100_000, 64, 'sha512').toString('hex');
    const match = testHash === hash;
    console.log(`  Computed: ${testHash.substring(0, 40)}...`);
    console.log(`  Match: ${match ? '✅ PASSWORD CORRECT' : '❌ PASSWORD WRONG'}`);

    if (!match) {
      console.log('\n  ⚠️ LOGIN WOULD FAIL: "อีเมลหรือรหัสผ่านไม่ถูกต้อง"');
      console.log('  The password "123456" does NOT match the stored hash.');
      console.log('  The password was likely changed or set to something else.');
    }

    console.log('\n============================================================');
    console.log(' SUMMARY');
    console.log('============================================================');
    console.log(` Workspace "TEMPLATE": ${tenants.rows.length > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(` Schema "${schemaName}": ${dbCheck.rows.length > 0 ? '✅ Exists' : '❌ Missing'}`);
    console.log(` Email "tigerlinly@gmail.com": ${userRes.rows.length > 0 ? '✅ Found' : '❌ Not found'}`);
    console.log(` Account Active: ${user.is_active ? '✅ Yes' : '❌ No'}`);
    console.log(` Account Locked: ${(user.locked_until && new Date() < new Date(user.locked_until)) ? '❌ Yes' : '✅ No'}`);
    console.log(` Password "123456": ${match ? '✅ Correct' : '❌ Wrong'}`);
    console.log(` Failed Attempts: ${user.failed_login_count}`);

    await tenantClient.end();
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

test();
