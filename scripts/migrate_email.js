const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  password: 'qwerty',
  host: 'localhost',
  database: 'nexone_techbiz'
});

client.connect().then(async () => {
  // Step 1: Check current column type
  const check = await client.query(`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'nex_core'
      AND table_name = 'email_templates'
      AND column_name = 'app_name'
  `);
  console.log('Current column type:', check.rows[0]);

  const currentType = check.rows[0]?.udt_name || check.rows[0]?.data_type || '';

  if (currentType === 'jsonb') {
    console.log('✅ app_name is already jsonb. No migration needed.');
    await client.end();
    return;
  }

  // Step 2: Preview problematic rows first
  const preview = await client.query(`
    SELECT template_id, app_name
    FROM nex_core.email_templates
    WHERE app_name IS NOT NULL AND TRIM(app_name) != ''
    LIMIT 10
  `);
  console.log('Sample rows to migrate:', preview.rows);

  // Step 3: Migrate with robust CASE (trim + blank check)
  await client.query(`
    ALTER TABLE nex_core.email_templates
    ALTER COLUMN app_name TYPE jsonb
    USING CASE
      WHEN app_name IS NULL             THEN '[]'::jsonb
      WHEN TRIM(app_name) = ''          THEN '[]'::jsonb
      WHEN TRIM(app_name) = 'NULL'      THEN '[]'::jsonb
      ELSE jsonb_build_array(TRIM(app_name))
    END
  `);

  console.log('✅ Migration successful! app_name is now jsonb.');
  await client.end();
}).catch(async (e) => {
  console.error('❌ Migration failed:', e.message);
  console.error('Detail:', e.detail);
  await client.end();
});
