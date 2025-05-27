import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { File as PrismaFile } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PaginatedResponse } from '../common/interface/paginated-response.interface';

interface CreateFileRecordData {
  userId: number;
  originalFilename: string;
  storagePath: string;
  title?: string;
  description?: string;
}


@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('file-processing') private readonly fileProcessingQueue: Queue,
  ) {}

  async findFilesByUserId(userId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<PrismaFile>> {
    const skip = (page - 1) * limit;

    const [files, total] = await this.prisma.$transaction([
      this.prisma.file.findMany({
        where: { userId: userId },
        select: {
          id: true,
          userId: true,
          originalFilename: true,
          storagePath: true,
          title: true,
          description: true,
          status: true,
          extractedData: true,
          uploadedAt: true,
        },
        orderBy: {
          uploadedAt: 'desc',
        },
        skip: skip,
        take: limit,
      }),
      this.prisma.file.count({
        where: { userId: userId },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: files,
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages,
    };
  }

  async findFileById(fileId: number, userId: number) {
    return this.prisma.file.findUnique({
      where: {
        id: fileId,
        userId: userId,
      },
      select: {
        id: true,
        userId: true,
        originalFilename: true,
        storagePath: true,
        title: true,
        description: true,
        status: true,
        extractedData: true,
        uploadedAt: true,
      },
    });
  }

  async createFileRecord(fileData: CreateFileRecordData): Promise<PrismaFile> {
    try {
      const fileRecord = await this.prisma.file.create({
        data: {
          userId: fileData.userId,
          originalFilename: fileData.originalFilename,
          storagePath: fileData.storagePath,
          status: 'uploaded',
          title: fileData.title,
          description: fileData.description,
        },
      });

      await this.fileProcessingQueue.add(
        'process-uploaded-file',
        {
          fileId: fileRecord.id,
          storagePath: fileRecord.storagePath,
        }
      );
      return fileRecord;
    } catch (error) {
      throw new InternalServerErrorException('Failed to process file upload due to an internal server error.');
    }
  }
}
