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
import { AdminUsersService } from './admin-users.service';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EmailUsersDto } from './dto/email-users.dto';

@ApiTags('admin-users')
@ApiBearerAuth('jwt')
@Roles('ADMIN')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly users: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users with search / filters / sort (admin)' })
  list(@Query() query: ListUsersDto) {
    return this.users.list(query);
  }

  @Post('email')
  @ApiOperation({ summary: 'Send an email to selected users (admin)' })
  email(@CurrentUser('id') adminId: string, @Body() dto: EmailUsersDto) {
    return this.users.emailUsers(adminId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'User detail: profile, courses, orders, audit log' })
  detail(@Param('id') id: string) {
    return this.users.detail(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Change a user role or suspension status (admin)' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.users.update(id, adminId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hard-delete a user (admin)' })
  remove(@Param('id') id: string, @CurrentUser('id') adminId: string) {
    return this.users.remove(id, adminId);
  }
}
