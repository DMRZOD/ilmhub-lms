import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { Resend } from 'resend';

import type { Env } from '../../config/env.schema';
import {
  renderVerificationEmail,
} from './templates/verification.template';
import { renderPasswordResetEmail } from './templates/reset.template';
import { renderEmailChangeEmail } from './templates/email-change.template';
import { renderOrderConfirmationEmail } from './templates/order-confirmation.template';
import { renderCourseRejectedEmail } from './templates/course-rejected.template';
import { renderRefundConfirmationEmail } from './templates/refund-confirmation.template';
import { renderQaAnswerEmail } from './templates/qa-answer.template';
import { renderQaQuestionEmail } from './templates/qa-question.template';
import { renderCourseApprovedEmail } from './templates/course-approved.template';
import { renderNewMessageEmail } from './templates/new-message.template';

const DEFAULT_FROM = 'IlmHub <noreply@ilmhub.uz>';

@Injectable()
export class EmailService {
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(EmailService.name);
    const apiKey = this.config.get('RESEND_API_KEY', { infer: true });
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = this.config.get('EMAIL_FROM', { infer: true }) ?? DEFAULT_FROM;
    this.frontendUrl = this.config.get('FRONTEND_URL', { infer: true });
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<void> {
    const url = `${this.frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
    const rendered = renderVerificationEmail({ name, url });
    await this.send(to, rendered.subject, rendered.html, rendered.text, {
      kind: 'verification',
      url,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    token: string,
  ): Promise<void> {
    const url = `${this.frontendUrl}/reset-password/${encodeURIComponent(token)}`;
    const rendered = renderPasswordResetEmail({ name, url });
    await this.send(to, rendered.subject, rendered.html, rendered.text, {
      kind: 'password-reset',
      url,
    });
  }

  async sendEmailChangeEmail(
    to: string,
    name: string,
    newEmail: string,
    token: string,
  ): Promise<void> {
    const url = `${this.frontendUrl}/confirm-email-change?token=${encodeURIComponent(token)}`;
    const rendered = renderEmailChangeEmail({ name, newEmail, url });
    await this.send(to, rendered.subject, rendered.html, rendered.text, {
      kind: 'email-change',
      url,
    });
  }

  async sendOrderConfirmationEmail(
    to: string,
    name: string,
    payload: { courses: { title: string }[]; totalUsdCents: number },
  ): Promise<void> {
    const url = `${this.frontendUrl}/student/courses`;
    const rendered = renderOrderConfirmationEmail({
      name,
      courses: payload.courses,
      totalUsdCents: payload.totalUsdCents,
      url,
    });
    await this.send(to, rendered.subject, rendered.html, rendered.text, {
      kind: 'order-confirmation',
      url,
    });
  }

  async sendAnnouncementEmail(
    to: string,
    name: string,
    payload: { courseTitle: string; subject: string; body: string },
  ): Promise<void> {
    const url = `${this.frontendUrl}/student/courses`;
    const safeBody = escapeHtml(payload.body).replace(/\n/g, '<br/>');
    const html = [
      `<p>Assalomu alaykum, ${escapeHtml(name)}!</p>`,
      `<p><strong>${escapeHtml(payload.courseTitle)}</strong> kursi bo'yicha yangi e'lon:</p>`,
      `<p>${safeBody}</p>`,
      `<p><a href="${url}">Kurslarim sahifasiga o'tish</a></p>`,
    ].join('');
    const text = `Assalomu alaykum, ${name}!\n\n${payload.courseTitle} kursi bo'yicha yangi e'lon:\n\n${payload.body}\n\n${url}`;
    await this.send(to, payload.subject, html, text, {
      kind: 'announcement',
      url,
    });
  }

  async sendAdminMessageEmail(
    to: string,
    name: string,
    payload: { subject: string; body: string },
  ): Promise<void> {
    const url = this.frontendUrl;
    const safeBody = escapeHtml(payload.body).replace(/\n/g, '<br/>');
    const html = [
      `<p>Assalomu alaykum, ${escapeHtml(name)}!</p>`,
      `<p>${safeBody}</p>`,
      `<p><a href="${url}">IlmHub'ga o'tish</a></p>`,
    ].join('');
    const text = `Assalomu alaykum, ${name}!\n\n${payload.body}\n\n${url}`;
    await this.send(to, payload.subject, html, text, {
      kind: 'admin-message',
      url,
    });
  }

  async sendCourseRejectedEmail(
    to: string,
    name: string,
    payload: { courseTitle: string; reason: string },
  ): Promise<void> {
    const url = `${this.frontendUrl}/instructor/courses`;
    const rendered = renderCourseRejectedEmail({
      name,
      courseTitle: payload.courseTitle,
      reason: payload.reason,
      url,
    });
    await this.send(to, rendered.subject, rendered.html, rendered.text, {
      kind: 'course-rejected',
      url,
    });
  }

  async sendRefundConfirmationEmail(
    to: string,
    name: string,
    payload: { courses: { title: string }[]; amountUsdCents: number },
  ): Promise<void> {
    const url = `${this.frontendUrl}/me/orders`;
    const rendered = renderRefundConfirmationEmail({
      name,
      courses: payload.courses,
      amountUsdCents: payload.amountUsdCents,
      url,
    });
    await this.send(to, rendered.subject, rendered.html, rendered.text, {
      kind: 'refund-confirmation',
      url,
    });
  }

  async sendQaAnswerEmail(
    to: string,
    name: string,
    payload: { title: string; body: string; link?: string },
  ): Promise<void> {
    const rendered = renderQaAnswerEmail({ name, ...payload });
    await this.send(to, rendered.subject, rendered.html, rendered.text, {
      kind: 'qa-answer',
      url: payload.link ?? this.frontendUrl,
    });
  }

  async sendNewQuestionEmail(
    to: string,
    name: string,
    payload: { title: string; body: string; link?: string },
  ): Promise<void> {
    const rendered = renderQaQuestionEmail({ name, ...payload });
    await this.send(to, rendered.subject, rendered.html, rendered.text, {
      kind: 'new-question',
      url: payload.link ?? this.frontendUrl,
    });
  }

  async sendCourseApprovedEmail(
    to: string,
    name: string,
    payload: { title: string; link?: string },
  ): Promise<void> {
    const rendered = renderCourseApprovedEmail({ name, ...payload });
    await this.send(to, rendered.subject, rendered.html, rendered.text, {
      kind: 'course-approved',
      url: payload.link ?? this.frontendUrl,
    });
  }

  async sendNewMessageEmail(
    to: string,
    name: string,
    payload: { title: string; body: string; link?: string },
  ): Promise<void> {
    const rendered = renderNewMessageEmail({ name, ...payload });
    await this.send(to, rendered.subject, rendered.html, rendered.text, {
      kind: 'new-message',
      url: payload.link ?? this.frontendUrl,
    });
  }

  async sendCourseUpdateEmail(
    to: string,
    name: string,
    payload: { title: string; body: string; link?: string },
  ): Promise<void> {
    const url = payload.link ?? `${this.frontendUrl}/student/courses`;
    const safeBody = escapeHtml(payload.body).replace(/\n/g, '<br/>');
    const html = [
      `<p>Assalomu alaykum, ${escapeHtml(name)}!</p>`,
      `<p><strong>${escapeHtml(payload.title)}</strong></p>`,
      `<p>${safeBody}</p>`,
      `<p><a href="${url}">Kurslarimga o'tish</a></p>`,
    ].join('');
    const text = `Assalomu alaykum, ${name}!\n\n${payload.title}\n\n${payload.body}\n\n${url}`;
    await this.send(to, payload.title, html, text, { kind: 'course-update', url });
  }

  async sendInstructorWelcomeEmail(to: string, name: string): Promise<void> {
    const url = `${this.frontendUrl}/instructor/dashboard`;
    const subject = "Tabriklaymiz! Siz endi IlmHub ustozisiz";
    const html = [
      `<p>Assalomu alaykum, ${escapeHtml(name)}!</p>`,
      `<p>Ustoz bo'lish arizangiz tasdiqlandi. Endi siz IlmHub'da o'z kurslaringizni yaratib, talabalarga bilim ulashishingiz mumkin.</p>`,
      `<p><a href="${url}">Ustoz paneliga o'tish</a></p>`,
    ].join('');
    const text = `Assalomu alaykum, ${name}!\n\nUstoz bo'lish arizangiz tasdiqlandi. Endi siz o'z kurslaringizni yaratishingiz mumkin.\n\n${url}`;
    await this.send(to, subject, html, text, {
      kind: 'instructor-welcome',
      url,
    });
  }

  private async send(
    to: string,
    subject: string,
    html: string,
    text: string,
    meta: { kind: string; url: string },
  ): Promise<void> {
    if (!this.resend) {
      this.logger.info(
        { to, subject, kind: meta.kind, url: meta.url },
        '[email:dev] RESEND_API_KEY is not set — email was not sent; click the URL above to continue the flow',
      );
      return;
    }
    try {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
        text,
      });
      this.logger.debug({ to, kind: meta.kind }, 'email sent');
    } catch (err) {
      this.logger.warn(
        { err, to, kind: meta.kind },
        'failed to send email via Resend',
      );
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
