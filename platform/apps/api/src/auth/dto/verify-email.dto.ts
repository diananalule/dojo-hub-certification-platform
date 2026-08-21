import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
