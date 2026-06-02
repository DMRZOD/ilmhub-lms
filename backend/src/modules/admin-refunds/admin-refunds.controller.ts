import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRefundsService } from './admin-refunds.service';
import { ListRefundsDto } from './dto/list-refunds.dto';
import { RejectRefundDto } from './dto/reject-refund.dto';

@ApiTags('admin-refunds')
@ApiBearerAuth('jwt')
@Roles('ADMIN')
@Controller('admin/refunds')
export class AdminRefundsController {
  constructor(private readonly refunds: AdminRefundsService) {}

  @Get()
  @ApiOperation({ summary: 'List refund requests, filtered by status (admin)' })
  list(@Query() query: ListRefundsDto) {
    return this.refunds.list(query);
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve a refund → gateway refund + revoke enrollment',
  })
  approve(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.refunds.approve(id, adminId);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a refund request with a reason (admin)' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: RejectRefundDto,
  ) {
    return this.refunds.reject(id, adminId, dto.reason);
  }
}
