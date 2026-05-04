import { createConnection } from 'typeorm';
import { Menu } from './services/nex-core-api/src/entities/menu.entity';

createConnection({
  type: 'postgres',
  host: '203.151.66.51',
  port: 5434,
  username: 'postgres',
  password: 'qwerty',
  database: 'nexone_template',
  entities: [Menu]
}).then(async conn => {
  const repo = conn.getRepository(Menu);
  const menu = await repo.findOne({ where: { menu_id: '020f2d9a-78ce-4142-a31a-ce48d5aae9d8' as any } });
  
  if (!menu) {
    console.log('MENU NOT FOUND');
    process.exit(1);
  }

  const dto = {
    "menu_id": "020f2d9a-78ce-4142-a31a-ce48d5aae9d8",
    "menu_seq": 1030,
    "app_name": "nex-core",
    "icon": "megaphone",
    "is_active": false,
    "menu_code": "nex-core:announcements",
    "page_key": "announcements",
    "parent_id": "0138db9f-16c7-4455-90db-9079a2291b56",
    "route": "/announcements",
    "title": "Announcements",
    "translations": {}
  };

  Object.assign(menu, dto);
  menu.parent_id = (!menu.parent_id || menu.parent_id === 'null') ? null : menu.parent_id;
  menu.create_by = (!menu.create_by || menu.create_by === 'null') ? null : menu.create_by;
  menu.update_by = null;
  menu.update_date = new Date();
  
  try {
    await repo.save(menu);
    console.log('SAVED SUCCESSFULLY');
  } catch (err) {
    console.error('SAVE ERROR:', err);
  }
  
  process.exit(0);
}).catch(err => {
  console.error('CONNECTION ERROR:', err);
  process.exit(1);
});
