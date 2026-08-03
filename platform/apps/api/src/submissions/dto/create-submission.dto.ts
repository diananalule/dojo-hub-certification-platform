import { ApiProperty } from '@nestjs/swagger';
import { SubmissionType } from '@dojo-hub/shared';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class SubmissionLinkInputDto {
  @ApiProperty()
  @IsUrl({ require_protocol: true })
  url: string;

  @ApiProperty()
  @IsString()
  description: string;
}

function isType(type: SubmissionType) {
  return (o: CreateSubmissionDto) => o.type === type;
}

export class CreateSubmissionDto {
  @ApiProperty({ enum: SubmissionType })
  @IsEnum(SubmissionType)
  type: SubmissionType;

  @ApiProperty({
    required: false,
    description: 'Required when type is CAPSTONE',
  })
  @ValidateIf(isType(SubmissionType.CAPSTONE))
  @IsString()
  levelId?: string;

  @ApiProperty({
    required: false,
    description:
      'For COMPETENCY submissions against a specific lesson topic. Supply either topicId or moduleId.',
  })
  @IsOptional()
  @IsString()
  topicId?: string;

  @ApiProperty({
    required: false,
    description:
      'For COMPETENCY submissions against a whole module (modules that ship without topics). Supply either topicId or moduleId.',
  })
  @IsOptional()
  @IsString()
  moduleId?: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  submissionText: string;

  @ApiProperty({ type: [SubmissionLinkInputDto], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => SubmissionLinkInputDto)
  links?: SubmissionLinkInputDto[];

  @ApiProperty({
    type: [String],
    required: false,
    description: 'IDs of previously-uploaded StoredFile records',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileIds?: string[];
}
