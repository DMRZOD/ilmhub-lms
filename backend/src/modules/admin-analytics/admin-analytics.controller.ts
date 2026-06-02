import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';

import { AdminAnalyticsService } from './admin-analytics.service';

@ApiTags('admin-analytics')
@ApiBearerAuth('jwt')
@Roles('ADMIN')
@Controller('admin/analytics')
export class AdminAnalyticsController {
  constructor(private readonly analytics: AdminAnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard aggregates + moderation queue (admin)' })
  overview() {
    return this.analytics.getOverview();
  }

  @Get('users-growth')
  @ApiOperation({ summary: 'Daily new users for the last 30 days (admin)' })
  usersGrowth() {
    return this.analytics.getUsersGrowth();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Monthly gross revenue for the last 12 months (admin)' })
  revenue() {
    return this.analytics.getRevenue();
  }

  @Get('top-courses')
  @ApiOperation({ summary: 'Top 10 courses by enrollments (admin)' })
  topCourses() {
    return this.analytics.getTopCourses();
  }

  @Get('top-categories')
  @ApiOperation({ summary: 'Enrollments grouped by category (admin)' })
  topCategories() {
    return this.analytics.getTopCategories();
  }
}
