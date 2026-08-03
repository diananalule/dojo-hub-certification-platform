import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class GradeAttemptDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  feedback: string;
}
