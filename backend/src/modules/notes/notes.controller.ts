import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ListNotesDto } from './dto/list-notes.dto';

@ApiTags('notes')
@ApiBearerAuth('jwt')
@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Create a personal note on a lesson, optionally pinned to a video timestamp. 403 if not enrolled.',
  })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateNoteDto) {
    return this.notes.create(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'List my notes filtered by lessonId or courseId. courseId responses include lesson grouping info.',
  })
  list(@CurrentUser('id') userId: string, @Query() query: ListNotesDto) {
    return this.notes.list(userId, query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update my note content and/or timestamp.' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notes.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete my note.' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notes.remove(userId, id);
  }
}
