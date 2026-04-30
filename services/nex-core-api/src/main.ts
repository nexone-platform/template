import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('NexCore API')
    .setDescription('NexOne ERP Core API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8001;
  await app.listen(port);
  console.log(`NexCore API is running on port ${port}`);
  console.log(`Swagger UI is available at http://localhost:${port}/api/docs`);
}
bootstrap();
