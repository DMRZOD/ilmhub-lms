import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { ListNotesDto } from './dto/list-notes.dto';
import { toNoteDto, type NoteDto } from './note.mapper';

const NOTE_LESSON_INCLUDE = {
  lesson: {
    select: {
      id: true,
      title: true,
      order: true,
      section: { select: { id: true, title: true, order: true } },
    },
  },
} as const;

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly enrollments: EnrollmentsService,
  ) {}

  async create(userId: string, dto: CreateNoteDto): Promise<NoteDto> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: dto.lessonId },
      select: { id: true, section: { select: { courseId: true } } },
    });
    if (!lesson) throw new NotFoundException('lesson_not_found');

    const enrolled = await this.enrollments.isUserEnrolled(
      userId,
      lesson.section.courseId,
    );
    if (!enrolled) throw new ForbiddenException('not_enrolled');

    const note = await this.prisma.note.create({
      data: {
        userId,
        lessonId: dto.lessonId,
        content: dto.content,
        timestampSeconds: dto.timestampSeconds ?? null,
      },
    });
    return toNoteDto(note);
  }

  async list(userId: string, query: ListNotesDto): Promise<NoteDto[]> {
    if (!query.lessonId && !query.courseId) {
      throw new BadRequestException('lessonId_or_courseId_required');
    }

    if (query.lessonId) {
      const notes = await this.prisma.note.findMany({
        where: { userId, lessonId: query.lessonId },
        orderBy: { createdAt: 'desc' },
      });
      return notes.map(toNoteDto);
    }

    const notes = await this.prisma.note.findMany({
      where: { userId, lesson: { section: { courseId: query.courseId } } },
      include: NOTE_LESSON_INCLUDE,
      orderBy: [
        { lesson: { section: { order: 'asc' } } },
        { lesson: { order: 'asc' } },
        { timestampSeconds: 'asc' },
        { createdAt: 'asc' },
      ],
    });
    return notes.map(toNoteDto);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateNoteDto,
  ): Promise<NoteDto> {
    await this.ensureOwner(userId, id);
    const note = await this.prisma.note.update({
      where: { id },
      data: {
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.timestampSeconds !== undefined
          ? { timestampSeconds: dto.timestampSeconds }
          : {}),
      },
    });
    return toNoteDto(note);
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    await this.ensureOwner(userId, id);
    await this.prisma.note.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureOwner(userId: string, id: string): Promise<void> {
    const note = await this.prisma.note.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!note || note.userId !== userId) {
      throw new NotFoundException('note_not_found');
    }
  }
}
