const { Client } = require('pg');

async function checkUser() {
    const client = new Client({
        user: 'postgres',
        host: '203.151.66.51',
        database: 'nexone_template',
        password: 'qwerty',
        port: 5434,
    });

    try {
        await client.connect();
        const res = await client.query("SELECT id, email, role_id, employee_id, create_by, update_by FROM nex_core.users WHERE id = 'baa6f7ca-bb1b-435b-81a2-6966a9476a01'");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkUser();
