import { ApiProperty } from '@nestjs/swagger';
import { StoredFileKind } from '@dojo-hub/shared';
import { IsEnum, IsInt, IsString, Max, MinLength } from 'class-validator';

const MAX_UPLOAD_BYTES = 250 * 1024 * 1024; // 250MB

export class PresignUploadDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  originalName: string;

  @ApiProperty()
  @IsString()
  mimeType: string;

  @ApiProperty()
  @IsInt()
  @Max(MAX_UPLOAD_BYTES)
  sizeBytes: number;

  @ApiProperty({ enum: StoredFileKind })
  @IsEnum(StoredFileKind)
  kind: StoredFileKind;
}
