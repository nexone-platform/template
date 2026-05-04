const { Client } = require('pg');

async function updatePorts() {
    const client = new Client({
        host: '203.151.66.51',
        port: 5434,
        user: 'postgres',
        password: 'qwerty',
        database: 'nexone_template'
    });

    try {
        await client.connect();
        console.log('Connected to DB');
        
        // Let's first SELECT to see what's in there
        const res = await client.query('SELECT app_id, app_name, route_path, api_path FROM nex_core.system_apps');
        console.log('Current system_apps:');
        console.table(res.rows);

        // Update the ports in route_path and api_path
        let count = 0;
        for (const row of res.rows) {
            let newRoutePath = row.route_path;
            let newApiPath = row.api_path;
            let changed = false;

            if (newRoutePath) {
                if (newRoutePath.includes(':3000')) { newRoutePath = newRoutePath.replace(':3000', ':3100'); changed = true; }
                if (newRoutePath.includes(':3001')) { newRoutePath = newRoutePath.replace(':3001', ':3101'); changed = true; }
                if (newRoutePath.includes(':3002')) { newRoutePath = newRoutePath.replace(':3002', ':3102'); changed = true; }
            }

            if (newApiPath) {
                if (newApiPath.includes(':8001')) { newApiPath = newApiPath.replace(':8001', ':8101'); changed = true; }
                if (newApiPath.includes(':8002')) { newApiPath = newApiPath.replace(':8002', ':8102'); changed = true; }
                if (newApiPath.includes(':8003')) { newApiPath = newApiPath.replace(':8003', ':8103'); changed = true; }
            }

            if (changed) {
                await client.query(
                    'UPDATE nex_core.system_apps SET route_path = $1, api_path = $2 WHERE app_id = $3',
                    [newRoutePath, newApiPath, row.app_id]
                );
                console.log(`Updated app_id ${row.app_id}: ${newRoutePath} / ${newApiPath}`);
                count++;
            }
        }
        
        console.log(`Updated ${count} rows.`);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

updatePorts();
