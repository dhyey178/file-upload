import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  NotFoundException,
  BadRequestException,
  Body,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, File as MulterFile } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesService } from './files.service';
import { AuthenticatedUser } from '../auth/auth.service';
import { extname } from 'path';
import { UserThrottlerGuard } from '../common/guards/user-throttler.guard';
import { CreateFileDto } from './dto/create-file.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from 'src/common/interface/paginated-response.interface';
import { FileResponseDto } from './dto/file-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  getSchemaPath,
} from '@nestjs/swagger';

@ApiTags('Files')
@ApiBearerAuth('JWT-auth')
@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get a paginated list of files for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved a paginated list of files.',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            $ref: getSchemaPath(FileResponseDto),
          },
          description: 'Array of file objects',
        },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })

  async getMyFiles(
    @Request() req,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<FileResponseDto>>  {
    const user = req.user as AuthenticatedUser;
    const paginatedFiles = await this.filesService.findFilesByUserId(
      user.id,
      paginationDto.page,
      paginationDto.limit,
    );
    return paginatedFiles;
  }


  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a single file by ID for the authenticated user' })
  @ApiParam({ name: 'id', description: 'The ID of the file to retrieve', type: 'number', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the file.',
    type: FileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'File not found or access denied.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getFileById(@Param('id') fileId: string, @Request() req): Promise<FileResponseDto> {
    const user = req.user as AuthenticatedUser;
    const file = await this.filesService.findFileById(parseInt(fileId, 10), user.id);

    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found or you do not have permission to access it.`);
    }

    return file;
  }


  @UseGuards(JwtAuthGuard, UserThrottlerGuard)
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload a new file with optional title and description' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The actual file to upload',
        },
        title: {
          type: 'string',
          description: 'Optional title for the file',
          example: 'Project Proposal 2025',
          maxLength: 255,
        },
        description: {
          type: 'string',
          description: 'Optional detailed description of the file content',
          example: 'This proposal outlines the plans and budget for Q3 2025.',
          maxLength: 1000,
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully and background processing initiated.',
    schema: {
      properties: {
        fileId: { type: 'number', example: 1 },
        status: { type: 'string', example: 'uploaded' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., no file provided, validation errors).' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 429, description: 'Too Many Requests (throttling).' })

  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const originalName = file.originalname;
          const fileExtension = extname(originalName);
          const filename = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
          console.log("!!! FILE !!!", file, file.title, file.description)
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )

  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Request() req,
    @Body() body: CreateFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided.');
    }

    const user = req.user as AuthenticatedUser;

    const { title, description } = body;

    try {
      const fileRecord = await this.filesService.createFileRecord({
        userId: user.id,
        originalFilename: file.originalname,
        storagePath: file.path,
        title,
        description,
      });
      return {
        fileId: fileRecord.id,
        status: fileRecord.status,
      };
    } catch (error) {
      throw new BadRequestException('Failed to save file.');
    }
  }
}
