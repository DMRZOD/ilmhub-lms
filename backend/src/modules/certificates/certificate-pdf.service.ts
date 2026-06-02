import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer, { type Browser } from 'puppeteer';
import { toDataURL } from 'qrcode';

import type { Env } from '../../config/env.schema';
import { renderCertificateHtml } from './certificate-template';

export interface CertificatePdfData {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: Date;
  certificateNumber: string;
}

@Injectable()
export class CertificatePdfService implements OnModuleDestroy {
  private readonly logger = new Logger(CertificatePdfService.name);
  private browser: Browser | null = null;
  private launching: Promise<Browser> | null = null;
  private readonly frontendUrl: string;

  constructor(config: ConfigService<Env, true>) {
    this.frontendUrl = config.get('FRONTEND_URL', { infer: true });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close().catch(() => undefined);
      this.browser = null;
    }
  }

  /** Public URL of the verification page for a given certificate number. */
  verifyUrl(certificateNumber: string): string {
    return `${this.frontendUrl.replace(/\/$/, '')}/sertifikat/${certificateNumber}`;
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) return this.browser;
    if (this.launching) return this.launching;

    this.launching = puppeteer
      .launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
      .then((browser) => {
        this.browser = browser;
        this.launching = null;
        return browser;
      })
      .catch((err) => {
        this.launching = null;
        throw err;
      });

    return this.launching;
  }

  async generatePdf(data: CertificatePdfData): Promise<Buffer> {
    const verifyUrl = this.verifyUrl(data.certificateNumber);
    const qrDataUrl = await toDataURL(verifyUrl, {
      margin: 1,
      width: 240,
      color: { dark: '#0a0a0a', light: '#ffffff' },
    });

    const html = renderCertificateHtml({ ...data, qrDataUrl, verifyUrl });

    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({
        width: '297mm',
        height: '210mm',
        printBackground: true,
        pageRanges: '1',
      });
      return Buffer.from(pdf);
    } finally {
      await page.close().catch(() => undefined);
    }
  }
}
