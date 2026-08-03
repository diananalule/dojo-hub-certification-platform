import { Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@dojo-hub/shared';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.interface';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN)
  @Get()
  directory(@Query('role') role?: UserRole, @Query('search') search?: string) {
    return this.usersService.directory(role, search);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/suspend')
  suspend(@CurrentUser() actor: RequestUser, @Param('id') id: string) {
    return this.usersService.suspend(actor, id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/reactivate')
  reactivate(@CurrentUser() actor: RequestUser, @Param('id') id: string) {
    return this.usersService.reactivate(actor, id);
  }

  @Roles(UserRole.ADMIN)
  @Post(':id/terminate')
  terminate(@CurrentUser() actor: RequestUser, @Param('id') id: string) {
    return this.usersService.terminate(actor, id);
  }
}
