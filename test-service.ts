import { NestFactory } from '@nestjs/core';
import { AppModule } from './services/nex-core-api/src/app.module';
import { MenusService } from './services/nex-core-api/src/menus/menus.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const menusService = app.get(MenusService);

  try {
    const payload = {
      menu_seq: 1035,
      parent_id: "0138db9f-16c7-4455-90db-9079a2291b56"
    };
    const id = "f418beb3-43fd-45ea-8bc3-746d4571d906";
    
    console.log("Calling update...");
    const result = await menusService.update(id, payload);
    console.log("Update SUCCESS:", result);
  } catch (e: any) {
    console.error("Update FAILED:", e);
    if (e.response) {
      console.error("Response:", e.response);
    }
  }

  await app.close();
}
bootstrap();
