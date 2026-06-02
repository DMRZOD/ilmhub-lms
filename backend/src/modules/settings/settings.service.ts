import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { SETTING_DEFAULTS } from './settings.constants';

/**
 * Owns the key-value `Setting` table. Reads fall back to SETTING_DEFAULTS so
 * callers never see `undefined` for a known key, even before seeding.
 */
@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get<T = unknown>(key: string): Promise<T> {
    const row = await this.prisma.setting.findUnique({ where: { key } });
    return (row ? row.value : (SETTING_DEFAULTS[key] ?? null)) as T;
  }

  async getMany(keys: string[]): Promise<Record<string, unknown>> {
    const rows = await this.prisma.setting.findMany({
      where: { key: { in: keys } },
    });
    const stored = new Map(rows.map((r) => [r.key, r.value]));
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      out[key] = stored.has(key) ? stored.get(key) : (SETTING_DEFAULTS[key] ?? null);
    }
    return out;
  }

  async set(key: string, value: Prisma.InputJsonValue): Promise<void> {
    await this.prisma.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}
