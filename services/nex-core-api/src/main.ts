import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';

  // ── Security Headers ──
  app.use(helmet({
    contentSecurityPolicy: isProduction ? undefined : false, // Disable CSP in dev for Swagger
    crossOriginEmbedderPolicy: false,
    hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true } : false,
  }));

  // ── Cookie Parser ──
  app.use(cookieParser());

  // ── CORS ──
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Accept'],
  });

  // ── Validation ──
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,      // Strip unknown properties
    transform: true,      // Auto-transform types
    forbidNonWhitelisted: true,  // Reject unknown properties
  }));

  app.setGlobalPrefix('api');

  // ── Swagger: Development only ──
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('NexCore API')
      .setDescription('NexOne ERP Core API Documentation')
      .setVersion('1.0')
      .addCookieAuth('nexone_sid')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 8001;
  await app.listen(port);
  console.log(`NexCore API is running on port ${port} [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
  if (!isProduction) {
    console.log(`Swagger UI is available at http://localhost:${port}/api/docs`);
  }
}
bootstrap();
