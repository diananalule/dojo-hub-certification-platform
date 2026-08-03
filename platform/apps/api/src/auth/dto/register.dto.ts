import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@dojo-hub/shared';
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiProperty({ enum: [UserRole.STUDENT, UserRole.EVALUATOR] })
  @IsIn([UserRole.STUDENT, UserRole.EVALUATOR])
  role: UserRole;
}
