import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { RequestRefundDto } from './dto/request-refund.dto';

@ApiTags('orders')
@ApiBearerAuth('jwt')
@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a pending order for one or more paid courses',
  })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.orders.create(userId, dto);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get one of my orders with its items and status' })
  getById(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.orders.getById(userId, id);
  }

  @Get('me/orders')
  @ApiOperation({ summary: 'List my orders, paginated, newest first' })
  listMy(@CurrentUser('id') userId: string, @Query() query: ListOrdersDto) {
    return this.orders.listMy(userId, query);
  }

  @Post('me/refunds')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Request a refund for a purchased course (creates a request)',
  })
  requestRefund(
    @CurrentUser('id') userId: string,
    @Body() dto: RequestRefundDto,
  ) {
    return this.orders.requestRefund(userId, dto);
  }

  @Get('me/refunds')
  @ApiOperation({ summary: 'List my refund requests with their statuses' })
  listMyRefunds(@CurrentUser('id') userId: string) {
    return this.orders.listMyRefunds(userId);
  }
}
