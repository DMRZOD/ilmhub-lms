import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminBlogService } from './admin-blog.service';
import { ListBlogDto } from './dto/list-blog.dto';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog-post.dto';
import {
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
} from './dto/blog-category.dto';

@ApiTags('admin-blog')
@ApiBearerAuth('jwt')
@Roles('ADMIN')
@Controller('admin/blog')
export class AdminBlogController {
  constructor(private readonly blog: AdminBlogService) {}

  // --- Blog categories (declared before :id so they aren't captured by it) ---

  @Get('categories')
  @ApiOperation({ summary: 'List blog categories (admin)' })
  listCategories() {
    return this.blog.listCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a blog category (admin)' })
  createCategory(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateBlogCategoryDto,
  ) {
    return this.blog.createCategory(adminId, dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a blog category (admin)' })
  updateCategory(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateBlogCategoryDto,
  ) {
    return this.blog.updateCategory(adminId, id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a blog category (admin)' })
  deleteCategory(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.blog.deleteCategory(adminId, id);
  }

  // --- Blog posts ---

  @Get()
  @ApiOperation({ summary: 'List blog posts with filters (admin)' })
  list(@Query() query: ListBlogDto) {
    return this.blog.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a blog post (admin)' })
  create(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateBlogPostDto,
  ) {
    return this.blog.create(adminId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Blog post detail with content (admin)' })
  detail(@Param('id') id: string) {
    return this.blog.detail(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blog post / change status (admin)' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateBlogPostDto,
  ) {
    return this.blog.update(adminId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a blog post (admin)' })
  remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.blog.remove(adminId, id);
  }
}
