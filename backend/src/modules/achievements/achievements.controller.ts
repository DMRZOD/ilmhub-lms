import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AchievementsService } from './achievements.service';

@ApiTags('achievements')
@ApiBearerAuth('jwt')
@Controller()
export class AchievementsController {
  constructor(private readonly achievements: AchievementsService) {}

  @Get('me/achievements')
  @ApiOperation({ summary: 'List achievements (earned + locked) for current user' })
  listMy(@CurrentUser('id') userId: string) {
    return this.achievements.listMy(userId);
  }
}
