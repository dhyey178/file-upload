import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}