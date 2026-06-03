import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Static assets (Sora fonts + IlmHub logo) live under <cwd>/public/certificate.
// They are read once and cached as base64 so the PDF template renders fully
// offline (Puppeteer's `setContent` cannot resolve relative file URLs).

export interface CertificateAssets {
  fonts: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
  };
  logoSvg: string;
}

let cached: CertificateAssets | null = null;

function assetsDir(): string {
  return join(process.cwd(), 'public', 'certificate');
}

function fontBase64(file: string): string {
  return readFileSync(join(assetsDir(), 'fonts', file)).toString('base64');
}

export function loadCertificateAssets(): CertificateAssets {
  if (cached) return cached;
  cached = {
    fonts: {
      regular: fontBase64('Sora-Regular.ttf'),
      medium: fontBase64('Sora-Medium.ttf'),
      semibold: fontBase64('Sora-SemiBold.ttf'),
      bold: fontBase64('Sora-Bold.ttf'),
      extrabold: fontBase64('Sora-ExtraBold.ttf'),
    },
    logoSvg: readFileSync(join(assetsDir(), 'logo-black.svg'), 'utf8'),
  };
  return cached;
}
