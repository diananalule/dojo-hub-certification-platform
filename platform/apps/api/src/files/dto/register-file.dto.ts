import { ApiProperty } from '@nestjs/swagger';
import { StoredFileKind } from '@dojo-hub/shared';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterFileDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  storageKey: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  originalName: string;

  @ApiProperty()
  @IsInt()
  sizeBytes: number;

  @ApiProperty()
  @IsString()
  mimeType: string;

  @ApiProperty({ enum: StoredFileKind })
  @IsEnum(StoredFileKind)
  kind: StoredFileKind;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  submissionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  topicId?: string;
}
