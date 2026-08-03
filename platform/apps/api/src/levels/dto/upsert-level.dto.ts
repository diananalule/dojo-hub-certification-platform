import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, MinLength } from 'class-validator';

export class UpsertLevelDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  passingScore: number;
}
