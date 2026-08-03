import { ApiProperty } from '@nestjs/swagger';
import { TrackDifficulty } from '@dojo-hub/shared';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTrackDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty()
  @IsString()
  icon: string;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty({ enum: TrackDifficulty })
  @IsEnum(TrackDifficulty)
  difficulty: TrackDifficulty;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(52)
  durationWeeks: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  examEnabled?: boolean = true;
}
