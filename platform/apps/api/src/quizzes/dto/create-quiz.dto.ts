import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateModuleQuizDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ required: false, default: 70 })
  @IsOptional()
  @IsInt()
  @Min(1)
  passThreshold?: number = 70;
}

export class CreateTrackAssessmentDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ required: false, default: 70 })
  @IsOptional()
  @IsInt()
  @Min(1)
  passThreshold?: number = 70;
}
