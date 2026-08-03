import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpsertCategoryDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;
}
