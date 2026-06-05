import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { BlogService } from './blog.service';
import { ListPublicBlogDto } from './dto/list-public-blog.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blog: BlogService) {}

  @Public()
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'List published blog posts (cached 5 min)' })
  list(@Query() query: ListPublicBlogDto) {
    return this.blog.listPublished(query);
  }

  // Declared before ':slug' so it is not captured as a post slug.
  @Public()
  @Get('categories')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('blog:categories')
  @CacheTTL(3_600_000)
  @ApiOperation({ summary: 'List blog categories (cached 1h)' })
  categories() {
    return this.blog.listCategories();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a published blog post by slug' })
  bySlug(@Param('slug') slug: string) {
    return this.blog.getBySlug(slug);
  }

  @Public()
  @Get(':slug/comments')
  @ApiOperation({ summary: 'List comments for a published blog post' })
  comments(@Param('slug') slug: string) {
    return this.blog.listComments(slug);
  }

  @ApiBearerAuth('jwt')
  @Post(':slug/comments')
  @ApiOperation({ summary: 'Add a comment or reply to a blog post' })
  addComment(
    @CurrentUser('id') userId: string,
    @Param('slug') slug: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.blog.createComment(userId, slug, dto);
  }

  @ApiBearerAuth('jwt')
  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete your own comment (admins can delete any)' })
  deleteComment(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.blog.deleteComment(user, id);
  }
}
