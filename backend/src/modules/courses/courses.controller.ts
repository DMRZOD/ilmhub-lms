import {
  CacheInterceptor,
  CacheTTL,
} from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CoursesService } from './courses.service';
import { ReviewsService } from './reviews.service';
import { ListCoursesDto } from './dto/list-courses.dto';
import { FeaturedCoursesDto } from './dto/featured-courses.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly courses: CoursesService,
    private readonly reviews: ReviewsService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published courses (filters + pagination)' })
  list(@Query() query: ListCoursesDto) {
    return this.courses.list(query);
  }

  @Public()
  @Get('featured')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300_000)
  @ApiOperation({ summary: 'Top N published courses (cached 5 min)' })
  featured(@Query() query: FeaturedCoursesDto) {
    return this.courses.featured(query.limit);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug')
  @ApiOperation({
    summary: 'Get a course by slug (videoAssetId hidden for non-enrolled)',
  })
  bySlug(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    return this.courses.findBySlug(slug, user?.id ?? null);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':slug/reviews')
  @ApiOperation({ summary: 'List reviews for a course (paginated)' })
  reviewsList(
    @Param('slug') slug: string,
    @Query() query: ListReviewsDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    return this.reviews.listBySlug(slug, query.page, query.limit, {
      rating: query.rating,
      sort: query.sort,
      viewerId: user?.id ?? null,
    });
  }

  @Post(':slug/reviews')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Create a review (requires enrolled + email verified)',
  })
  createReview(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviews.create(slug, user, dto);
  }
}
