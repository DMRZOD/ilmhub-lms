import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export type AchievementCategory =
  | 'BOSHLANISH'
  | 'DAVOMIY'
  | 'TUGATISH'
  | 'SOTSIAL';

// Dedicated `category` column lands with the gamification step; for now we
// derive it from the achievement `code` so the UI can group badges.
const CATEGORY_BY_CODE: Record<string, AchievementCategory> = {
  FIRST_ENROLLMENT: 'BOSHLANISH',
  FIRST_REVIEW: 'BOSHLANISH',
  EARLY_BIRD: 'BOSHLANISH',
  STREAK_7: 'DAVOMIY',
  STREAK_30: 'DAVOMIY',
  FIRST_COMPLETION: 'TUGATISH',
  FIVE_COURSES: 'TUGATISH',
  QUIZ_MASTER: 'TUGATISH',
  CODE_NINJA: 'TUGATISH',
  SOCIAL_LEARNER: 'SOTSIAL',
};

function categoryFor(code: string): AchievementCategory {
  if (CATEGORY_BY_CODE[code]) return CATEGORY_BY_CODE[code];
  if (code.startsWith('BOSH_')) return 'BOSHLANISH';
  if (code.startsWith('DAVOM_')) return 'DAVOMIY';
  if (code.startsWith('TUG_')) return 'TUGATISH';
  if (code.startsWith('SOTS_')) return 'SOTSIAL';
  return 'BOSHLANISH';
}

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async listMy(userId: string) {
    const [achievements, earned] = await Promise.all([
      this.prisma.achievement.findMany({
        orderBy: { code: 'asc' },
      }),
      this.prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, earnedAt: true },
      }),
    ]);

    const earnedById = new Map(
      earned.map((row) => [row.achievementId, row.earnedAt]),
    );

    const items = achievements.map((a) => {
      const earnedAt = earnedById.get(a.id) ?? null;
      return {
        id: a.id,
        code: a.code,
        title: a.title,
        description: a.description,
        iconName: a.iconName,
        category: categoryFor(a.code),
        earned: earnedAt !== null,
        earnedAt: earnedAt ? earnedAt.toISOString() : null,
      };
    });

    return {
      items,
      earnedCount: items.filter((i) => i.earned).length,
      totalCount: items.length,
    };
  }
}
