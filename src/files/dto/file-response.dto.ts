import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({ example: 1, description: 'Unique ID of the file' })
  id: number;

  @ApiProperty({ example: 101, description: 'ID of the user who uploaded the file' })
  userId: number;

  @ApiProperty({ example: 'my-document.pdf', description: 'Original filename of the uploaded file' })
  originalFilename: string;

  @ApiProperty({ example: './uploads/file-12345.pdf', description: 'Internal storage path of the file' })
  storagePath: string;

  @ApiProperty({ example: 'My Important Project Report', description: 'Title of the file', nullable: true })
  title: string | null;

  @ApiProperty({ example: 'A detailed report about the project phases.', description: 'Description of the file', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'processed', description: 'Current status of the file (e.g., uploaded, processing, processed, failed)' })
  status: string;

  @ApiProperty({
    example: 'a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890a1b2c3d4e5f67890',
    description: 'Extracted data from the file, typically a hash value, or null if not yet processed/failed.',
    type: 'string',
    nullable: true,
  })
  extractedData: string | null;

  @ApiProperty({ example: '2025-05-27T08:00:00.000Z', description: 'Timestamp when the file was uploaded' })
  uploadedAt: Date;
}