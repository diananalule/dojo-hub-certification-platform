import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

/**
 * A blank description means "not written yet" and is allowed, matching modules — authors
 * outline lessons title-first. Anything actually typed still has to be a real sentence.
 */
const DescriptionOptional = () =>
  ValidateIf((o: { description?: string }) => typeof o.description === 'string' && o.description.trim().length > 0);

export class SubtitleCueInputDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  timeSeconds: number;

  @ApiProperty()
  @IsString()
  text: string;
}

export class CreateTopicDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ required: false })
  @DescriptionOptional()
  @IsString()
  @MinLength(5)
  description?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  durationSeconds: number;

  /** A lesson may be reading/exercise only — no video is a valid topic. */
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceVideoUrl?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  tools: string[];

  @ApiProperty({ type: [SubtitleCueInputDto], required: false })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => SubtitleCueInputDto)
  subtitles?: SubtitleCueInputDto[];
}

export class UpdateTopicDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiProperty({ required: false })
  @DescriptionOptional()
  @IsString()
  @MinLength(5)
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationSeconds?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceVideoUrl?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tools?: string[];

  @ApiProperty({ type: [SubtitleCueInputDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubtitleCueInputDto)
  subtitles?: SubtitleCueInputDto[];
}
