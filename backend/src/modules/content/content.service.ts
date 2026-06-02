import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import {
  HomeHero,
  HomeStat,
  HOME_HERO_DEFAULT,
  HOME_STATS_DEFAULT,
  SETTING_KEYS,
} from '../settings/settings.constants';

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  async home() {
    const [map, testimonials, faqs] = await Promise.all([
      this.settings.getMany([SETTING_KEYS.homeHero, SETTING_KEYS.homeStats]),
      this.prisma.testimonial.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.faq.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);

    return {
      hero: (map[SETTING_KEYS.homeHero] as HomeHero) ?? HOME_HERO_DEFAULT,
      stats: (map[SETTING_KEYS.homeStats] as HomeStat[]) ?? HOME_STATS_DEFAULT,
      testimonials: testimonials.map((t) => ({
        id: t.id,
        studentName: t.studentName,
        studentAvatar: t.studentAvatar,
        studentRole: t.studentRole,
        courseName: t.courseName,
        rating: t.rating,
        text: t.text,
      })),
      faqs: faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      })),
    };
  }
}
