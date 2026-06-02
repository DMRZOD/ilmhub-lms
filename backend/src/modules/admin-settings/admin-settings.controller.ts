import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminSettingsService } from './admin-settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ListAuditDto } from './dto/list-audit.dto';

@ApiTags('admin-settings')
@ApiBearerAuth('jwt')
@Roles('ADMIN')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settings: AdminSettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Platform settings overview (admin)' })
  overview() {
    return this.settings.getOverview();
  }

  @Patch()
  @ApiOperation({ summary: 'Update platform settings (admin)' })
  update(@CurrentUser('id') adminId: string, @Body() dto: UpdateSettingsDto) {
    return this.settings.update(adminId, dto);
  }

  @Get('audit')
  @ApiOperation({ summary: 'Paginated platform audit log (admin)' })
  audit(@Query() query: ListAuditDto) {
    return this.settings.listAudit(query);
  }
}
