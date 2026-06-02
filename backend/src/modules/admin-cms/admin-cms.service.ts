import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SettingsService } from '../settings/settings.service';
import {
  HomeHero,
  HomeStat,
  HOME_HERO_DEFAULT,
  HOME_STATS_DEFAULT,
  SETTING_KEYS,
} from '../settings/settings.constants';
import { slugify } from '../../common/utils/slugify';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import {
  CreateAchievementDto,
  UpdateAchievementDto,
} from './dto/achievement.dto';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { UpdateHomeDto } from './dto/home.dto';

@Injectable()
export class AdminCmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly settings: SettingsService,
  ) {}

  // ---------- Course categories ----------

  listCategories() {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createCategory(adminId: string, dto: CreateCategoryDto) {
    const slug = await this.uniqueCategorySlug(dto.slug || dto.name, null);
    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description ?? null,
        iconName: dto.iconName ?? null,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    await this.audit.log(adminId, 'CMS_CATEGORY_CREATED', 'CATEGORY', category.id, {
      name: category.name,
    });
    return category;
  }

  async updateCategory(adminId: string, id: string, dto: UpdateCategoryDto) {
    await this.findCategoryOrThrow(id);
    const data: Prisma.CategoryUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.iconName !== undefined) data.iconName = dto.iconName;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.slug !== undefined) {
      data.slug = await this.uniqueCategorySlug(dto.slug, id);
    }
    const category = await this.prisma.category.update({ where: { id }, data });
    await this.audit.log(adminId, 'CMS_CATEGORY_UPDATED', 'CATEGORY', id, {
      name: category.name,
    });
    return category;
  }

  async deleteCategory(adminId: string, id: string) {
    const category = await this.findCategoryOrThrow(id);
    const courses = await this.prisma.course.count({ where: { categoryId: id } });
    if (courses > 0) throw new ConflictException('category_has_courses');
    await this.prisma.category.delete({ where: { id } });
    await this.audit.log(adminId, 'CMS_CATEGORY_DELETED', 'CATEGORY', id, {
      name: category.name,
    });
    return { id, deleted: true };
  }

  // ---------- Achievements ----------

  listAchievements() {
    return this.prisma.achievement.findMany({ orderBy: { code: 'asc' } });
  }

  async createAchievement(adminId: string, dto: CreateAchievementDto) {
    const exists = await this.prisma.achievement.findUnique({
      where: { code: dto.code },
    });
    if (exists) throw new ConflictException('achievement_code_taken');
    const achievement = await this.prisma.achievement.create({
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        iconName: dto.iconName ?? null,
        criteria: (dto.criteria ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
    await this.audit.log(
      adminId,
      'CMS_ACHIEVEMENT_CREATED',
      'ACHIEVEMENT',
      achievement.id,
      { code: achievement.code },
    );
    return achievement;
  }

  async updateAchievement(adminId: string, id: string, dto: UpdateAchievementDto) {
    const existing = await this.prisma.achievement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('achievement_not_found');
    if (dto.code && dto.code !== existing.code) {
      const taken = await this.prisma.achievement.findUnique({
        where: { code: dto.code },
      });
      if (taken) throw new ConflictException('achievement_code_taken');
    }
    const data: Prisma.AchievementUpdateInput = {};
    if (dto.code !== undefined) data.code = dto.code;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.iconName !== undefined) data.iconName = dto.iconName;
    if (dto.criteria !== undefined) {
      data.criteria = (dto.criteria ?? Prisma.JsonNull) as Prisma.InputJsonValue;
    }
    const achievement = await this.prisma.achievement.update({
      where: { id },
      data,
    });
    await this.audit.log(adminId, 'CMS_ACHIEVEMENT_UPDATED', 'ACHIEVEMENT', id, {
      code: achievement.code,
    });
    return achievement;
  }

  async deleteAchievement(adminId: string, id: string) {
    const existing = await this.prisma.achievement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('achievement_not_found');
    await this.prisma.achievement.delete({ where: { id } });
    await this.audit.log(adminId, 'CMS_ACHIEVEMENT_DELETED', 'ACHIEVEMENT', id, {
      code: existing.code,
    });
    return { id, deleted: true };
  }

  // ---------- Testimonials ----------

  listTestimonials() {
    return this.prisma.testimonial.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createTestimonial(adminId: string, dto: CreateTestimonialDto) {
    const testimonial = await this.prisma.testimonial.create({
      data: {
        studentName: dto.studentName,
        studentAvatar: dto.studentAvatar ?? null,
        studentRole: dto.studentRole ?? null,
        courseName: dto.courseName ?? null,
        rating: dto.rating ?? 5,
        text: dto.text,
        sortOrder: dto.sortOrder ?? 0,
        published: dto.published ?? true,
      },
    });
    await this.audit.log(
      adminId,
      'CMS_TESTIMONIAL_CREATED',
      'TESTIMONIAL',
      testimonial.id,
      { studentName: testimonial.studentName },
    );
    return testimonial;
  }

  async updateTestimonial(adminId: string, id: string, dto: UpdateTestimonialDto) {
    await this.findTestimonialOrThrow(id);
    const testimonial = await this.prisma.testimonial.update({
      where: { id },
      data: {
        ...(dto.studentName !== undefined && { studentName: dto.studentName }),
        ...(dto.studentAvatar !== undefined && { studentAvatar: dto.studentAvatar }),
        ...(dto.studentRole !== undefined && { studentRole: dto.studentRole }),
        ...(dto.courseName !== undefined && { courseName: dto.courseName }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.text !== undefined && { text: dto.text }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.published !== undefined && { published: dto.published }),
      },
    });
    await this.audit.log(adminId, 'CMS_TESTIMONIAL_UPDATED', 'TESTIMONIAL', id);
    return testimonial;
  }

  async deleteTestimonial(adminId: string, id: string) {
    await this.findTestimonialOrThrow(id);
    await this.prisma.testimonial.delete({ where: { id } });
    await this.audit.log(adminId, 'CMS_TESTIMONIAL_DELETED', 'TESTIMONIAL', id);
    return { id, deleted: true };
  }

  // ---------- FAQ ----------

  listFaqs() {
    return this.prisma.faq.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async createFaq(adminId: string, dto: CreateFaqDto) {
    const faq = await this.prisma.faq.create({
      data: {
        question: dto.question,
        answer: dto.answer,
        sortOrder: dto.sortOrder ?? 0,
        published: dto.published ?? true,
      },
    });
    await this.audit.log(adminId, 'CMS_FAQ_CREATED', 'FAQ', faq.id);
    return faq;
  }

  async updateFaq(adminId: string, id: string, dto: UpdateFaqDto) {
    await this.findFaqOrThrow(id);
    const faq = await this.prisma.faq.update({
      where: { id },
      data: {
        ...(dto.question !== undefined && { question: dto.question }),
        ...(dto.answer !== undefined && { answer: dto.answer }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        ...(dto.published !== undefined && { published: dto.published }),
      },
    });
    await this.audit.log(adminId, 'CMS_FAQ_UPDATED', 'FAQ', id);
    return faq;
  }

  async deleteFaq(adminId: string, id: string) {
    await this.findFaqOrThrow(id);
    await this.prisma.faq.delete({ where: { id } });
    await this.audit.log(adminId, 'CMS_FAQ_DELETED', 'FAQ', id);
    return { id, deleted: true };
  }

  // ---------- Home content (hero + stats, settings-backed) ----------

  async getHome(): Promise<{ hero: HomeHero; stats: HomeStat[] }> {
    const map = await this.settings.getMany([
      SETTING_KEYS.homeHero,
      SETTING_KEYS.homeStats,
    ]);
    return {
      hero: (map[SETTING_KEYS.homeHero] as HomeHero) ?? HOME_HERO_DEFAULT,
      stats: (map[SETTING_KEYS.homeStats] as HomeStat[]) ?? HOME_STATS_DEFAULT,
    };
  }

  async updateHome(adminId: string, dto: UpdateHomeDto) {
    if (dto.hero !== undefined) {
      await this.settings.set(
        SETTING_KEYS.homeHero,
        dto.hero as unknown as Prisma.InputJsonValue,
      );
    }
    if (dto.stats !== undefined) {
      await this.settings.set(
        SETTING_KEYS.homeStats,
        dto.stats as unknown as Prisma.InputJsonValue,
      );
    }
    await this.audit.log(adminId, 'CMS_HOME_UPDATED', 'HOME_CONTENT', null, {
      changed: Object.keys(dto),
    });
    return this.getHome();
  }

  // ---------- helpers ----------

  private async findCategoryOrThrow(id: string) {
    const c = await this.prisma.category.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('category_not_found');
    return c;
  }

  private async findTestimonialOrThrow(id: string) {
    const t = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('testimonial_not_found');
    return t;
  }

  private async findFaqOrThrow(id: string) {
    const f = await this.prisma.faq.findUnique({ where: { id } });
    if (!f) throw new NotFoundException('faq_not_found');
    return f;
  }

  private async uniqueCategorySlug(source: string, excludeId: string | null) {
    const base = slugify(source) || 'category';
    let slug = base;
    let n = 1;
    for (;;) {
      const found = await this.prisma.category.findUnique({ where: { slug } });
      if (!found || found.id === excludeId) return slug;
      n += 1;
      slug = `${base}-${n}`;
    }
  }
}
