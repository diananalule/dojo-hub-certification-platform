import { ApiProperty } from '@nestjs/swagger';
import { QuizQuestionType } from '@dojo-hub/shared';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsString,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

function isType(type: QuizQuestionType) {
  return (o: CreateQuestionDto) => o.type === type;
}

export class CreateQuestionDto {
  @ApiProperty({ enum: QuizQuestionType })
  @IsEnum(QuizQuestionType)
  type: QuizQuestionType;

  // Objective fields
  @ApiProperty({ required: false })
  @ValidateIf(isType(QuizQuestionType.OBJECTIVE))
  @IsString()
  @MinLength(5)
  question?: string;

  @ApiProperty({ type: [String], required: false })
  @ValidateIf(isType(QuizQuestionType.OBJECTIVE))
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options?: string[];

  @ApiProperty({ required: false })
  @ValidateIf(isType(QuizQuestionType.OBJECTIVE))
  @IsInt()
  @Min(0)
  correctIndex?: number;

  @ApiProperty({ required: false })
  @ValidateIf(isType(QuizQuestionType.OBJECTIVE))
  @IsString()
  @MinLength(5)
  explanation?: string;

  // Subjective fields
  @ApiProperty({ required: false })
  @ValidateIf(isType(QuizQuestionType.SUBJECTIVE))
  @IsString()
  @MinLength(10)
  prompt?: string;

  @ApiProperty({ required: false })
  @ValidateIf(isType(QuizQuestionType.SUBJECTIVE))
  @IsString()
  @MinLength(5)
  guidelines?: string;

  @ApiProperty({ type: [String], required: false })
  @ValidateIf(isType(QuizQuestionType.SUBJECTIVE))
  @IsArray()
  @IsString({ each: true })
  sampleKeywords?: string[];
}
