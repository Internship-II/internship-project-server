import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MailController } from './modules/mail/mail.controller';
import { MailModule } from './modules/mail/mail.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { UploadModule } from './modules/upload/upload.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { TestsModule } from './modules/tests/tests.module';
import { TestResultsModule } from './modules/test-results/test-results.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: configService.get('DB_HOST'),
    //     port: configService.get('DB_PORT'),
    //     username: configService.get('DB_USERNAME'),
    //     password: configService.get('DB_PASSWORD'),
    //     database: configService.get('DB_NAME'),        
    //     entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //     synchronize: configService.get('NODE_ENV') !== 'production', // set to false in production
    //     timezone: '+07:00',
    //     // Performance optimizations
    //     extra: {
    //       connectionLimit: 20,
    //       acquireTimeout: 60000,
    //       timeout: 60000,
    //     },
    //     poolSize: 20,
    //     maxQueryExecutionTime: 10000,
    //     logging: false, // Disable verbose database logging
    //     cache: {
    //       duration: 30000, // 30 seconds
    //     },
    //   }),
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'), // use full Render DB URL
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        timezone: '+07:00',
        extra: {
          connectionLimit: 20,
          acquireTimeout: 60000,
          timeout: 60000,
        },
        poolSize: 20,
        maxQueryExecutionTime: 10000,
        logging: false,
        cache: { duration: 30000 },
      }),
    }),
    UsersModule,
    AuthModule,
    MailModule,
    UploadModule,
    QuestionsModule,
    TestsModule,
    TestResultsModule,
    DashboardModule,
   ],
  controllers: [AppController, MailController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
   ],
})
export class AppModule {}
