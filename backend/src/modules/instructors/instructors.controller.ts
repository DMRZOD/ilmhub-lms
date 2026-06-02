import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { InstructorsService } from './instructors.service';
import { ListInstructorsDto } from './dto/list-instructors.dto';

@ApiTags('instructors')
@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructors: InstructorsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List instructors (paginated, filters, sort)' })
  list(@Query() query: ListInstructorsDto) {
    return this.instructors.list(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Public instructor profile + their published courses',
  })
  byId(@Param('id') id: string) {
    return this.instructors.findById(id);
  }
}
