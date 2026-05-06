import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

async function test() {
  try {
    await AppDataSource.initialize();
    const rows = await AppDataSource.query(`SELECT * FROM nex_core.companies LIMIT 1`);
    console.log('Companies:', rows);
    const users = await AppDataSource.query(`SELECT * FROM nex_core.users LIMIT 1`);
    console.log('Users:', users);
  } catch (err) {
    console.error(err);
  } finally {
    await AppDataSource.destroy();
  }
}
test();
