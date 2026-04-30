import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'qwerty',
    database: process.env.DB_NAME || 'nexspeed',
    ssl: false,
    max: 5,
});

// Set search_path to match Go backend schema
pool.on('connect', (client) => {
    client.query(`SET search_path TO ${process.env.DB_SCHEMA || 'nexspeed'}`);
});

export default pool;
