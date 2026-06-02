import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { AdminInstructorsService } from './admin-instructors.service';
import { ListAdminInstructorsDto } from './dto/list-admin-instructors.dto';

@ApiTags('admin-instructors')
@ApiBearerAuth('jwt')
@Roles('ADMIN')
@Controller('admin/instructors')
export class AdminInstructorsController {
  constructor(private readonly service: AdminInstructorsService) {}

  @Get()
  @ApiOperation({ summary: 'List approved instructors with stats (admin)' })
  list(@Query() query: ListAdminInstructorsDto) {
    return this.service.list(query);
  }
}
