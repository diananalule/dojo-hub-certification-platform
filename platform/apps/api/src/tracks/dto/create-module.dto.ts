import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

/**
 * A blank description means "not written yet" and is allowed, so authors can outline a
 * curriculum title-first and fill the detail in later. Anything actually typed still has
 * to be a real sentence.
 */
const DescriptionOptional = () =>
  ValidateIf((o: { description?: string }) => typeof o.description === 'string' && o.description.trim().length > 0);

export class CreateModuleDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  title: string;

  @ApiProperty({ required: false })
  @DescriptionOptional()
  @IsString()
  @MinLength(5)
  description?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  quizEnabled?: boolean = true;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tools?: string[];
}

export class UpdateModuleDto {
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
  @IsBoolean()
  quizEnabled?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tools?: string[];
}
