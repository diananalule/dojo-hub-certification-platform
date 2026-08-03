import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ enum: ['APPROVE', 'REJECT'] })
  @IsIn(['APPROVE', 'REJECT'])
  decision: 'APPROVE' | 'REJECT';

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
