import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { UserRole } from '@dojo-hub/shared';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/types/request-user.interface';
import { BookmarksService } from './bookmarks.service';

class CreateCollectionDto {
  @IsString()
  @MinLength(2)
  name: string;
}

@ApiTags('bookmarks')
@ApiBearerAuth()
@Controller()
@Roles(UserRole.STUDENT)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get('bookmarks')
  listMine(@CurrentUser() actor: RequestUser) {
    return this.bookmarksService.listMine(actor.id);
  }

  @Post('bookmarks/tracks/:trackId/toggle')
  toggle(@CurrentUser() actor: RequestUser, @Param('trackId') trackId: string) {
    return this.bookmarksService.toggle(actor.id, trackId);
  }

  @Get('collections')
  listCollections(@CurrentUser() actor: RequestUser) {
    return this.bookmarksService.listCollections(actor.id);
  }

  @Post('collections')
  createCollection(
    @CurrentUser() actor: RequestUser,
    @Body() dto: CreateCollectionDto,
  ) {
    return this.bookmarksService.createCollection(actor.id, dto.name);
  }

  @Delete('collections/:collectionId')
  deleteCollection(
    @CurrentUser() actor: RequestUser,
    @Param('collectionId') collectionId: string,
  ) {
    return this.bookmarksService.deleteCollection(actor, collectionId);
  }

  @Post('collections/:collectionId/tracks/:trackId')
  addToCollection(
    @CurrentUser() actor: RequestUser,
    @Param('collectionId') collectionId: string,
    @Param('trackId') trackId: string,
  ) {
    return this.bookmarksService.addToCollection(actor, collectionId, trackId);
  }

  @Delete('collections/:collectionId/tracks/:trackId')
  removeFromCollection(
    @CurrentUser() actor: RequestUser,
    @Param('collectionId') collectionId: string,
    @Param('trackId') trackId: string,
  ) {
    return this.bookmarksService.removeFromCollection(
      actor,
      collectionId,
      trackId,
    );
  }
}
