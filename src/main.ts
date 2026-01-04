// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global desde ENV (carga por @nestjs/config) — simple fallback:
  const prefix = process.env.PATH_SUBDOMAIN || 'api';
  app.setGlobalPrefix(prefix);

  // CORS: restringe a orígenes declarados en ENV (separados por coma)
  const allowedOrigins = (process.env.FRONTEND_PUBLIC_URL ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter((o) => o.length > 0);
  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: true,
  });

  // Validación/transformación de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,         // quita propiedades no declaradas en DTO
    forbidNonWhitelisted: true,
    transform: true,         // convierte tipos según DTOs
    transformOptions: {
        enableImplicitConversion: true,
      },
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Documentación Swagger accesible en /{prefix}/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Proforma')
    .setDescription('Documentación de la API Proforma')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Token JWT en Authorization: Bearer <token>' },
      'jwt',
    )
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument, {
    useGlobalPrefix: true, // evita duplicar prefijo en llamadas desde Swagger UI
    swaggerOptions: { persistAuthorization: true },
    jsonDocumentUrl: 'swagger/json',
  });

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}
bootstrap();
