import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

interface FileProcessingJobData {
  fileId: number;
  storagePath: string;
}

@Injectable()
@Processor('file-processing')
export class FileProcessorService extends WorkerHost {
  private readonly logger = new Logger(FileProcessorService.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<FileProcessingJobData, any, string>): Promise<any> {
    const { fileId, storagePath } = job.data;
    this.logger.log(`Processing job ${job.id} for file ID: ${fileId} from path: ${storagePath}`);

    try {
      await this.prisma.file.update({
        where: { id: fileId },
        data: { status: 'processing' },
      });
      this.logger.log(`File ID ${fileId} status updated to 'processing'.`);

      await new Promise(resolve => setTimeout(resolve, 5000));

      const fileHash = crypto.createHash('sha256').update(storagePath).digest('hex');

      if (Math.random() < 0.2) {
        this.logger.error(`Simulating failure for file ID: ${fileId}`);
        throw new Error('Simulated processing failure!');
      }

      await this.prisma.file.update({
        where: { id: fileId },
        data: {
          status: 'processed',
          extractedData: fileHash,
        },
      });
      this.logger.log(`Successfully processed file ID: ${fileId}. Status updated to 'processed'.`);

      return { success: true, fileId: fileId, extractedData: fileHash };
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id} for file ID: ${fileId}. Error: ${error.message}`);
      await this.prisma.file.update({
        where: { id: fileId },
        data: {
          status: 'failed',
          extractedData: `ERROR: ${error.message}`,
        },
      });
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<FileProcessingJobData>) {
    this.logger.log(`Job ${job.id} for file ID ${job.data.fileId} completed.`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<FileProcessingJobData>, err: Error) {
    this.logger.error(`Job ${job.id} for file ID ${job.data.fileId} failed with error: ${err.message}`);
  }

  @OnWorkerEvent('active')
  onActive(job: Job<FileProcessingJobData>) {
    this.logger.log(`Job ${job.id} for file ID ${job.data.fileId} is active.`);
  }
}