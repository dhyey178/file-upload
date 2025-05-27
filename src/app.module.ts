import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // <-- ADD THIS IMPORT
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { FilesModule } from './files/files.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq'; // <-- ADD THIS IMPORT
import { ProcessingModule } from './processing/processing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    HealthModule,
    AuthModule,
    FilesModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    ProcessingModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
