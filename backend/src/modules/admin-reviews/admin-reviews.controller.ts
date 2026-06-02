import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminReviewsService } from './admin-reviews.service';
import { ListReportsDto } from './dto/list-reports.dto';

@ApiTags('admin-reviews')
@ApiBearerAuth('jwt')
@Roles('ADMIN')
@Controller('admin/reports')
export class AdminReviewsController {
  constructor(private readonly reports: AdminReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List review complaints, filtered by status (admin)' })
  list(@Query() query: ListReportsDto) {
    return this.reports.list(query);
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss a complaint, keeping the review (admin)' })
  dismiss(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.reports.dismiss(id, adminId);
  }

  @Patch(':id/remove')
  @ApiOperation({
    summary: 'Remove the reported review and recompute course rating (admin)',
  })
  removeReview(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.reports.removeReview(id, adminId);
  }
}
