import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { ProcessingModule } from '../processing/processing.module';

@Module({
  imports: [
    AuthModule,
    ProcessingModule,
  ],
  controllers: [FilesController],
  providers: [FilesService, PrismaService],
  exports: [FilesService],
})
export class FilesModule {}
