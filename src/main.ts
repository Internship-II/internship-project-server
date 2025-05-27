// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ConfigService } from '@nestjs/config';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   // const configService = app.get(ConfigService);
//   // console.log('DB_HOST:', configService.get('DB_HOST'));
//   // console.log('DB_PORT:', configService.get('DB_PORT'));
//   // console.log('DB_USERNAME:', configService.get('DB_USERNAME'));
//   // console.log('DB_PASSWORD:', configService.get('DB_PASSWORD'));
//   // console.log('DB_NAME:', configService.get('DB_NAME'));
//   app.enableCors({
//     origin: 'http://localhost:3000', // Allow frontend to make requests from this origin
//     methods: 'GET,POST,PUT,DELETE',
//     allowedHeaders: 'Content-Type,Authorization',
//   });
//   await app.listen(3001);
// }
// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);

  app.use('/public', express.static(join(__dirname, '..', 'uploads')));
  
  // app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Question Bank API')
    .setDescription('API for managing questions in the Question Bank system')
    .setVersion('1.0')
    .addTag('questions', 'Endpoints for managing questions')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();