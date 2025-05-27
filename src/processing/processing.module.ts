import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FileProcessorService } from './file-processor/file-processor.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'file-processing',
    }),
  ],
  providers: [FileProcessorService, PrismaService],
  exports: [BullModule],
})
export class ProcessingModule {}
