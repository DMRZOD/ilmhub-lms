import {
  CacheInterceptor,
  CacheKey,
  CacheTTL,
} from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { CategoriesService } from './categories.service';
import { ListCategoryCoursesDto } from './dto/list-category-courses.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Public()
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('categories:all')
  @CacheTTL(3_600_000)
  @ApiOperation({ summary: 'List all categories (cached 1h)' })
  list() {
    return this.categories.findAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({
    summary: 'Get a category with its published courses (paginated)',
  })
  bySlug(@Param('slug') slug: string, @Query() query: ListCategoryCoursesDto) {
    return this.categories.findBySlug(slug, query.page, query.limit);
  }
}
