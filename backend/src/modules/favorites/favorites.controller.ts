import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PageQueryDto } from '../../common/dto/pagination.dto';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiBearerAuth('jwt')
@Controller()
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get('me/favorites')
  @ApiOperation({ summary: 'List my favorite courses (paginated)' })
  listMy(
    @CurrentUser('id') userId: string,
    @Query() query: PageQueryDto,
  ) {
    return this.favorites.listMy(userId, query.page, query.limit);
  }

  @Post('favorites/:courseId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a course to my favorites (idempotent)' })
  add(
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    return this.favorites.add(userId, courseId);
  }

  @Delete('favorites/:courseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a course from my favorites (idempotent)' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
  ) {
    await this.favorites.remove(userId, courseId);
  }
}
