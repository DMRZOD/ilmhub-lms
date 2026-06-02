import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReportReviewDto } from './dto/report-review.dto';

@ApiTags('reviews')
@ApiBearerAuth('jwt')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Edit your own review (within 30 days)' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviews.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete your own review (within 30 days)' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.reviews.remove(userId, id);
  }

  @Post(':id/helpful')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a review as helpful' })
  addHelpful(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.reviews.addHelpful(userId, id);
  }

  @Delete(':id/helpful')
  @ApiOperation({ summary: 'Remove your helpful vote from a review' })
  removeHelpful(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.reviews.removeHelpful(userId, id);
  }

  @Post(':id/report')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Report a review as inappropriate' })
  report(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ReportReviewDto,
  ) {
    return this.reviews.report(userId, id, dto.reason);
  }
}
