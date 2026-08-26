import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@dojo-hub/shared';
import { IsIn } from 'class-validator';

export class ChangeRoleDto {
  @ApiProperty({ enum: [UserRole.STUDENT, UserRole.EVALUATOR, UserRole.ADMIN] })
  @IsIn([UserRole.STUDENT, UserRole.EVALUATOR, UserRole.ADMIN])
  role: UserRole;
}
