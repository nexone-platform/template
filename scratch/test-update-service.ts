import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import { UsersService } from './src/master-data/users/users.service';
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
    
    const service = new UsersService(userRepo);
    
    // Find the first user
    const user = await userRepo.findOne({ where: {} });
    if (!user) {
      console.log('No user found');
      return;
    }
    
    console.log('Testing UsersService.update on user:', user.email);
    
    const dto = {
        firstName: user.firstName + ' Test2',
        lastName: user.lastName,
        email: user.email,
        status: user.status || 'ACTIVE',
        roleId: (user as any).roleId || null
    };
    
    await service.update(user.id, dto as any, null as any);
    console.log('UsersService.update successful');
  } catch (err) {
    console.error('UsersService.update failed:', err.message);
  } finally {
    await AppDataSource.destroy();
  }
}
test();
