const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const client = new Client({
  host: '203.151.66.51',
  port: 5434,
  user: 'postgres',
  password: 'qwerty',
  database: 'nexone_template'
});

async function run() {
  try {
    await client.connect();
    const res = await client.query("SELECT app_name, route_path, api_path FROM nex_core.system_apps ORDER BY app_seq_no");
    
    const dbPorts = res.rows.map(row => {
      const routeMatch = row.route_path ? row.route_path.match(/:(\d+)/) : null;
      const apiMatch = row.api_path ? row.api_path.match(/:(\d+)/) : null;
      return {
        app_name: row.app_name,
        route_port: routeMatch ? routeMatch[1] : null,
        api_port: apiMatch ? apiMatch[1] : null,
        api_path: row.api_path
      };
    });

    console.log("=== DB EXPECTED PORTS ===");
    console.table(dbPorts);

    // Check frontend
    console.log("\n=== FRONTEND ACTUAL PORTS ===");
    const appsDir = path.join(__dirname, 'apps');
    if (fs.existsSync(appsDir)) {
      const apps = fs.readdirSync(appsDir);
      for (const app of apps) {
        const pkgPath = path.join(appsDir, app, 'package.json');
        if (fs.existsSync(pkgPath)) {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          const devScript = pkg.scripts && (pkg.scripts.dev || pkg.scripts.start);
          let port = "Unknown";
          if (devScript) {
            const portMatch = devScript.match(/(?:-p|--port)\s*(\d+)/);
            if (portMatch) port = portMatch[1];
          }
          console.log(`- ${app}: ${port} (Script: ${devScript})`);
        }
      }
    }

    // Check backend
    console.log("\n=== BACKEND ACTUAL PORTS ===");
    const servicesDir = path.join(__dirname, 'services');
    if (fs.existsSync(servicesDir)) {
      const services = fs.readdirSync(servicesDir);
      for (const svc of services) {
        const envPath = path.join(servicesDir, svc, '.env.development');
        const envPath2 = path.join(servicesDir, svc, '.env');
        let port = "Unknown";
        
        let targetEnv = fs.existsSync(envPath) ? envPath : (fs.existsSync(envPath2) ? envPath2 : null);
        if (targetEnv) {
          const envContent = fs.readFileSync(targetEnv, 'utf8');
          const portMatch = envContent.match(/^PORT\s*=\s*(\d+)/m);
          if (portMatch) port = portMatch[1];
        } else {
           // check main.ts
           const mainPath = path.join(servicesDir, svc, 'src', 'main.ts');
           if (fs.existsSync(mainPath)) {
              const mainContent = fs.readFileSync(mainPath, 'utf8');
              const portMatch = mainContent.match(/listen\(\s*(\d+)\s*\)/) || mainContent.match(/process\.env\.PORT\s*\|\|\s*(\d+)/);
              if (portMatch) port = `${portMatch[1]} (Hardcoded in main.ts)`;
           }
        }
        console.log(`- ${svc}: ${port}`);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
