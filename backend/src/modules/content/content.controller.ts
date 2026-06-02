import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { ContentService } from './content.service';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Public()
  @Get('home')
  @ApiOperation({ summary: 'Public home-page content (hero, stats, testimonials, FAQ)' })
  home() {
    return this.content.home();
  }
}
