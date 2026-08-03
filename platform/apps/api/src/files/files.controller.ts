import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.interface';
import { FilesService } from './files.service';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { RegisterFileDto } from './dto/register-file.dto';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('presign')
  presign(@CurrentUser() user: RequestUser, @Body() dto: PresignUploadDto) {
    return this.filesService.presignUpload(dto, user.id);
  }

  @Post()
  register(@CurrentUser() user: RequestUser, @Body() dto: RegisterFileDto) {
    return this.filesService.register(dto, user.id);
  }
}
