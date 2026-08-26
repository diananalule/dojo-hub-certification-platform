import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { UserRole } from '@dojo-hub/shared';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.interface';
import { CredentialsService } from './credentials.service';

class RevokeCredentialDto {
  @IsString()
  @MinLength(5)
  reason: string;
}

@ApiTags('credentials')
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @ApiBearerAuth()
  @Roles(UserRole.STUDENT)
  @Get('me')
  listMine(@CurrentUser() user: RequestUser) {
    return this.credentialsService.listForStudent(user.id);
  }

  /** Claims the certificate for a course the student has finished. */
  @ApiBearerAuth()
  @Roles(UserRole.STUDENT)
  @Post('tracks/:trackId')
  @HttpCode(HttpStatus.OK)
  claimForTrack(
    @CurrentUser() user: RequestUser,
    @Param('trackId') trackId: string,
  ) {
    return this.credentialsService.claimForTrack(user.id, trackId);
  }

  @Public()
  @Get('verify/:id')
  verify(@Param('id') id: string) {
    return this.credentialsService.verify(id);
  }

  @Public()
  @Get(':id/qr')
  async qr(@Param('id') id: string) {
    return { dataUrl: await this.credentialsService.qrCodeDataUrl(id) };
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id/countersign')
  countersign(@CurrentUser() actor: RequestUser, @Param('id') id: string) {
    return this.credentialsService.countersign(actor, id);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Patch(':id/revoke')
  revoke(
    @CurrentUser() actor: RequestUser,
    @Param('id') id: string,
    @Body() dto: RevokeCredentialDto,
  ) {
    return this.credentialsService.revoke(actor, id, dto.reason);
  }
}
