import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpsertLevelDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  order: number;

  /**
   * Vestigial: advancement is driven by evaluator capstone approval, never by a score
   * threshold. Kept because the column is non-nullable, but no caller needs to set it.
   */
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  passingScore?: number = 0;
}
