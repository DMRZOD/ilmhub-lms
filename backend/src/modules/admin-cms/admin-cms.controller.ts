import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminCmsService } from './admin-cms.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import {
  CreateAchievementDto,
  UpdateAchievementDto,
} from './dto/achievement.dto';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { UpdateHomeDto } from './dto/home.dto';

@ApiTags('admin-cms')
@ApiBearerAuth('jwt')
@Roles('ADMIN')
@Controller('admin/cms')
export class AdminCmsController {
  constructor(private readonly cms: AdminCmsService) {}

  // ---------- Course categories ----------

  @Get('categories')
  @ApiOperation({ summary: 'List course categories (admin)' })
  listCategories() {
    return this.cms.listCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a course category (admin)' })
  createCategory(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.cms.createCategory(adminId, dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a course category (admin)' })
  updateCategory(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.cms.updateCategory(adminId, id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a course category (admin)' })
  deleteCategory(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.cms.deleteCategory(adminId, id);
  }

  // ---------- Achievements ----------

  @Get('achievements')
  @ApiOperation({ summary: 'List achievements (admin)' })
  listAchievements() {
    return this.cms.listAchievements();
  }

  @Post('achievements')
  @ApiOperation({ summary: 'Create an achievement (admin)' })
  createAchievement(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateAchievementDto,
  ) {
    return this.cms.createAchievement(adminId, dto);
  }

  @Patch('achievements/:id')
  @ApiOperation({ summary: 'Update an achievement (admin)' })
  updateAchievement(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateAchievementDto,
  ) {
    return this.cms.updateAchievement(adminId, id, dto);
  }

  @Delete('achievements/:id')
  @ApiOperation({ summary: 'Delete an achievement (admin)' })
  deleteAchievement(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.cms.deleteAchievement(adminId, id);
  }

  // ---------- Testimonials ----------

  @Get('testimonials')
  @ApiOperation({ summary: 'List testimonials (admin)' })
  listTestimonials() {
    return this.cms.listTestimonials();
  }

  @Post('testimonials')
  @ApiOperation({ summary: 'Create a testimonial (admin)' })
  createTestimonial(
    @CurrentUser('id') adminId: string,
    @Body() dto: CreateTestimonialDto,
  ) {
    return this.cms.createTestimonial(adminId, dto);
  }

  @Patch('testimonials/:id')
  @ApiOperation({ summary: 'Update a testimonial (admin)' })
  updateTestimonial(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateTestimonialDto,
  ) {
    return this.cms.updateTestimonial(adminId, id, dto);
  }

  @Delete('testimonials/:id')
  @ApiOperation({ summary: 'Delete a testimonial (admin)' })
  deleteTestimonial(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.cms.deleteTestimonial(adminId, id);
  }

  // ---------- FAQ ----------

  @Get('faqs')
  @ApiOperation({ summary: 'List FAQ entries (admin)' })
  listFaqs() {
    return this.cms.listFaqs();
  }

  @Post('faqs')
  @ApiOperation({ summary: 'Create a FAQ entry (admin)' })
  createFaq(@CurrentUser('id') adminId: string, @Body() dto: CreateFaqDto) {
    return this.cms.createFaq(adminId, dto);
  }

  @Patch('faqs/:id')
  @ApiOperation({ summary: 'Update a FAQ entry (admin)' })
  updateFaq(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateFaqDto,
  ) {
    return this.cms.updateFaq(adminId, id, dto);
  }

  @Delete('faqs/:id')
  @ApiOperation({ summary: 'Delete a FAQ entry (admin)' })
  deleteFaq(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.cms.deleteFaq(adminId, id);
  }

  // ---------- Home content ----------

  @Get('home')
  @ApiOperation({ summary: 'Get editable home content (hero + stats)' })
  getHome() {
    return this.cms.getHome();
  }

  @Patch('home')
  @ApiOperation({ summary: 'Update home content (hero + stats)' })
  updateHome(@CurrentUser('id') adminId: string, @Body() dto: UpdateHomeDto) {
    return this.cms.updateHome(adminId, dto);
  }
}
