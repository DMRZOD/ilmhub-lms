import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

import type { Env } from '../../config/env.schema';
import { AuditService } from '../audit/audit.service';
import { SettingsService } from '../settings/settings.service';
import {
  EmailSender,
  EMAIL_SENDER_DEFAULT,
  COMMISSION_RATE_DEFAULT,
  SETTING_KEYS,
} from '../settings/settings.constants';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ListAuditDto } from './dto/list-audit.dto';

// Static catalogue of transactional email templates. Bodies live in code
// (src/modules/email/templates), so these are view-only references in the UI.
const EMAIL_TEMPLATES = [
  { key: 'verification', name: 'Email tasdiqlash', description: "Ro'yxatdan o'tishda yuboriladi" },
  { key: 'reset', name: 'Parolni tiklash', description: "Parolni tiklash havolasi" },
  { key: 'email-change', name: "Email o'zgartirish", description: "Yangi emailni tasdiqlash" },
  { key: 'order-confirmation', name: 'Buyurtma tasdiqi', description: "To'lov muvaffaqiyatli bo'lganda" },
  { key: 'course-rejected', name: 'Kurs rad etildi', description: "Moderatsiyada rad etilganda" },
  { key: 'refund-confirmation', name: 'Refund tasdiqi', description: "Pul qaytarilganda" },
];

@Injectable()
export class AdminSettingsService {
  constructor(
    private readonly settings: SettingsService,
    private readonly audit: AuditService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async getOverview() {
    const map = await this.settings.getMany([
      SETTING_KEYS.commissionRate,
      SETTING_KEYS.maintenanceMode,
      SETTING_KEYS.emailSender,
    ]);

    return {
      commissionRate:
        (map[SETTING_KEYS.commissionRate] as number) ?? COMMISSION_RATE_DEFAULT,
      maintenanceMode: (map[SETTING_KEYS.maintenanceMode] as boolean) ?? false,
      emailSender:
        (map[SETTING_KEYS.emailSender] as EmailSender) ?? EMAIL_SENDER_DEFAULT,
      integrations: this.integrations(),
      emailTemplates: EMAIL_TEMPLATES,
    };
  }

  async update(adminId: string, dto: UpdateSettingsDto) {
    const changed: string[] = [];
    if (dto.commissionRate !== undefined) {
      await this.settings.set(SETTING_KEYS.commissionRate, dto.commissionRate);
      changed.push('commissionRate');
    }
    if (dto.maintenanceMode !== undefined) {
      await this.settings.set(SETTING_KEYS.maintenanceMode, dto.maintenanceMode);
      changed.push('maintenanceMode');
    }
    if (dto.emailSender !== undefined) {
      await this.settings.set(
        SETTING_KEYS.emailSender,
        dto.emailSender as unknown as Prisma.InputJsonValue,
      );
      changed.push('emailSender');
    }

    await this.audit.log(adminId, 'SETTINGS_UPDATED', 'SETTING', null, {
      changed,
    });
    return this.getOverview();
  }

  listAudit(query: ListAuditDto) {
    return this.audit.listRecent({
      page: query.page,
      limit: query.limit,
      action: query.action,
      targetType: query.targetType,
    });
  }

  private integrations() {
    const has = (key: keyof Env) =>
      Boolean(this.config.get(key, { infer: true }));
    return [
      {
        key: 'mux',
        label: 'Mux (video)',
        configured: has('MUX_TOKEN_ID') && has('MUX_TOKEN_SECRET'),
      },
      { key: 'resend', label: 'Resend (email)', configured: has('RESEND_API_KEY') },
      {
        key: 'supabase',
        label: 'Supabase Storage',
        configured:
          has('SUPABASE_URL') && has('SUPABASE_SERVICE_ROLE_KEY'),
      },
      { key: 'payme', label: 'Payme', configured: has('PAYME_MERCHANT_ID') },
      { key: 'click', label: 'Click', configured: false },
      { key: 'uzum', label: 'Uzum', configured: false },
    ];
  }
}
