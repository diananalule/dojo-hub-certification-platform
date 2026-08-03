import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSlotDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  topic: string;

  @ApiProperty()
  @IsDateString()
  startTime: string;

  @ApiProperty()
  @IsDateString()
  endTime: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(100)
  capacity: number;
}
