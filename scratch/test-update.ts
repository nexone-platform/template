import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  schema: process.env.DATABASE_SCHEMA,
  entities: [User],
});

async function test() {
  try {
    await AppDataSource.initialize();
    console.log('DB connected');
    const userRepo = AppDataSource.getRepository(User);
    
    // Find the first user
    const user = await userRepo.findOne({ where: {} });
    if (!user) {
      console.log('No user found');
      return;
    }
    
    console.log('Testing update on user:', user.email);
    
    // Simulate what the update does
    user.firstName = user.firstName + ' Test';
    user.updateBy = null;
    
    await userRepo.save(user);
    console.log('Update successful');
  } catch (err) {
    console.error('Update failed:', err.message);
  } finally {
    await AppDataSource.destroy();
  }
}
test();
