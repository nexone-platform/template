const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template',
});

async function run() {
  await client.connect();
  try {
    await client.query(`SET search_path TO nex_core;`);

    // Helper to drop PK
    const dropPk = async (tableName) => {
      const res = await client.query(`
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = '${tableName}'::regclass AND contype = 'p';
      `);
      if (res.rows.length > 0) {
        await client.query(`ALTER TABLE ${tableName} DROP CONSTRAINT "${res.rows[0].conname}" CASCADE;`);
      }
    };

    const changeToUuid = async (tableName, columnName) => {
      try { await client.query(`ALTER TABLE ${tableName} ALTER COLUMN ${columnName} DROP DEFAULT;`); } catch(e){}
      try { await client.query(`ALTER TABLE ${tableName} ALTER COLUMN ${columnName} DROP NOT NULL;`); } catch(e){}
      await client.query(`ALTER TABLE ${tableName} ALTER COLUMN ${columnName} TYPE uuid USING NULL;`);
    };

    // 1. Modify menus
    await dropPk('menus');
    try { await client.query(`ALTER TABLE menus ALTER COLUMN menu_id DROP IDENTITY IF EXISTS;`); } catch(e){}
    try { await client.query(`ALTER TABLE menus ALTER COLUMN menu_id DROP DEFAULT;`); } catch(e){}
    await client.query(`ALTER TABLE menus ALTER COLUMN menu_id TYPE uuid USING gen_random_uuid();`);
    await client.query(`ALTER TABLE menus ADD PRIMARY KEY (menu_id);`);
    await changeToUuid('menus', 'parent_id');
    await changeToUuid('menus', 'create_by');
    await changeToUuid('menus', 'update_by');
    console.log('menus table modified');

    // 2. Modify languages
    await dropPk('languages');
    try { await client.query(`ALTER TABLE languages ALTER COLUMN language_id DROP IDENTITY IF EXISTS;`); } catch(e){}
    try { await client.query(`ALTER TABLE languages ALTER COLUMN language_id DROP DEFAULT;`); } catch(e){}
    await client.query(`ALTER TABLE languages ALTER COLUMN language_id TYPE uuid USING gen_random_uuid();`);
    await client.query(`ALTER TABLE languages ADD PRIMARY KEY (language_id);`);
    await changeToUuid('languages', 'create_by');
    await changeToUuid('languages', 'update_by');
    console.log('languages table modified');

    // 3. Modify language_translations
    await dropPk('language_translations');
    try { await client.query(`ALTER TABLE language_translations ALTER COLUMN translation_id DROP IDENTITY IF EXISTS;`); } catch(e){}
    try { await client.query(`ALTER TABLE language_translations ALTER COLUMN translation_id DROP DEFAULT;`); } catch(e){}
    await client.query(`ALTER TABLE language_translations ALTER COLUMN translation_id TYPE uuid USING gen_random_uuid();`);
    await client.query(`ALTER TABLE language_translations ADD PRIMARY KEY (translation_id);`);
    await changeToUuid('language_translations', 'create_by');
    await changeToUuid('language_translations', 'update_by');
    console.log('language_translations table modified');

    // 4. Modify role_permissions (menu_id)
    await changeToUuid('role_permissions', 'menu_id');
    console.log('role_permissions table updated with menu_id uuid');

    // 5. Modify companies
    await changeToUuid('companies', 'create_by');
    await changeToUuid('companies', 'update_by');
    console.log('companies table modified');

    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error updating db:', err);
  } finally {
    await client.end();
  }
}
run();
