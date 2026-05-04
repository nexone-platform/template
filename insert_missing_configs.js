const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template',
});

async function main() {
  await client.connect();

  const configs = [
    { key: 'SHOW_TENANT_NAME', value: '1' },
    { key: 'TENANT_NAME_DISPLAY_POSITION', value: 'TOP_HEADER_RIGHT' },
  ];

  for (const config of configs) {
    const res = await client.query(
      `SELECT * FROM nex_core.system_config WHERE system_key = $1`,
      [config.key]
    );

    if (res.rows.length === 0) {
      await client.query(
        `INSERT INTO nex_core.system_config (system_key, system_value, description, system_type, is_active, create_date)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [config.key, config.value, `Configuration for ${config.key}`, 'FRONTEND', true]
      );
      console.log(`Inserted ${config.key} = ${config.value}`);
    } else {
      console.log(`${config.key} already exists.`);
    }
  }

  await client.end();
}

main().catch(console.error);
