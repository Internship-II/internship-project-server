import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import compression from 'compression';
import { join } from 'path';
import { performanceConfig } from './config/performance.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // Only show errors and warnings
    bufferLogs: true,
  });
  
  const reflector = app.get(Reflector);

  // Configure body parser limits for file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Enable compression for better performance
  app.use(compression(performanceConfig.compression));

  // Only serve static files in production or when needed
  if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
    app.use('/public', express.static(join(__dirname, '..', 'uploads')));
  }
  
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  
  // Optimize CORS for production
  const corsOptions = process.env.NODE_ENV === 'production' 
    ? {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type,Authorization',
        credentials: true,
      }
    : {
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type,Authorization',
        credentials: true,
      };
  
  app.enableCors(corsOptions);

  // Only setup Swagger in development
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Question Bank API')
      .setDescription('API for managing questions in the Question Bank system')
      .setVersion('1.0')
      .addTag('questions', 'Endpoints for managing questions')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Server running on: http://localhost:${port}`);
}
bootstrap();