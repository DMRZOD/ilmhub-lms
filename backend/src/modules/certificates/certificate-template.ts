import { loadCertificateAssets } from './certificate-assets';

export interface CertificateTemplateData {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: Date;
  certificateNumber: string;
  /** Data-URL PNG of the QR code linking to the public verification page. */
  qrDataUrl: string;
  /** Absolute URL shown under the QR code. */
  verifyUrl: string;
}

const dateFmt = new Intl.DateTimeFormat('uz-UZ', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Renders the certificate as a self-contained A4-landscape HTML document.
 * Fonts and logo are embedded as base64 so Puppeteer renders deterministically
 * without any network access. Design follows the IlmHub design-system: thin
 * monochrome frame, Sora typography, minimalist monochrome palette.
 */
export function renderCertificateHtml(data: CertificateTemplateData): string {
  const assets = loadCertificateAssets();
  const f = assets.fonts;
  const issued = dateFmt.format(data.issuedAt);

  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8" />
<style>
  @font-face { font-family: 'Sora'; font-weight: 400; src: url(data:font/ttf;base64,${f.regular}) format('truetype'); }
  @font-face { font-family: 'Sora'; font-weight: 500; src: url(data:font/ttf;base64,${f.medium}) format('truetype'); }
  @font-face { font-family: 'Sora'; font-weight: 600; src: url(data:font/ttf;base64,${f.semibold}) format('truetype'); }
  @font-face { font-family: 'Sora'; font-weight: 700; src: url(data:font/ttf;base64,${f.bold}) format('truetype'); }
  @font-face { font-family: 'Sora'; font-weight: 800; src: url(data:font/ttf;base64,${f.extrabold}) format('truetype'); }

  :root {
    --ink: #0a0a0a;
    --muted: #6b7280;
    --muted-2: #9ca3af;
    --border: #e5e7eb;
    --paper: #ffffff;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 297mm; height: 210mm; }
  body {
    font-family: 'Sora', sans-serif;
    color: var(--ink);
    background: var(--paper);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .frame {
    position: absolute;
    inset: 10mm;
    border: 1px solid var(--ink);
  }
  .frame-inner {
    position: absolute;
    inset: 3mm;
    border: 0.5px solid var(--border);
    padding: 16mm 20mm;
    display: flex;
    flex-direction: column;
  }

  .top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }
  .logo { height: 9mm; }
  .logo svg { height: 100%; width: auto; display: block; }
  .doc-meta { text-align: right; }
  .eyebrow {
    font-weight: 600;
    font-size: 9pt;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted-2);
  }

  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .kicker {
    font-weight: 600;
    font-size: 10pt;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 6mm;
  }
  .awarded {
    font-size: 11pt;
    color: var(--muted);
    margin-bottom: 3mm;
  }
  .student {
    font-weight: 800;
    font-size: 40pt;
    letter-spacing: -0.02em;
    line-height: 1.05;
    margin-bottom: 6mm;
  }
  .completed-label {
    font-size: 11pt;
    color: var(--muted);
    margin-bottom: 2mm;
  }
  .course {
    font-weight: 700;
    font-size: 20pt;
    letter-spacing: -0.01em;
    line-height: 1.2;
    max-width: 200mm;
  }

  .foot {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12mm;
  }
  .foot-col .label {
    font-size: 8pt;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted-2);
    margin-bottom: 1.5mm;
  }
  .foot-col .value {
    font-weight: 700;
    font-size: 11pt;
  }
  .foot-col .value.mono {
    font-family: 'Sora', monospace;
    letter-spacing: 0.02em;
  }
  .verify {
    display: flex;
    align-items: center;
    gap: 4mm;
  }
  .qr {
    width: 22mm;
    height: 22mm;
    display: block;
    border: 1px solid var(--border);
  }
  .verify-text .label {
    font-size: 8pt;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted-2);
    margin-bottom: 1mm;
  }
  .verify-text .url {
    font-size: 8.5pt;
    color: var(--muted);
    max-width: 70mm;
    word-break: break-all;
  }
</style>
</head>
<body>
  <div class="frame"></div>
  <div class="frame-inner">
    <div class="top">
      <div class="logo">${assets.logoSvg}</div>
      <div class="doc-meta">
        <div class="eyebrow">Sertifikat</div>
      </div>
    </div>

    <div class="body">
      <div class="kicker">Tugatilganligi tasdiqlanadi</div>
      <div class="awarded">Ushbu sertifikat quyidagi shaxsga beriladi</div>
      <div class="student">${escapeHtml(data.studentName)}</div>
      <div class="completed-label">muvaffaqiyatli yakunlagani uchun:</div>
      <div class="course">${escapeHtml(data.courseTitle)}</div>
    </div>

    <div class="foot">
      <div class="foot-col">
        <div class="label">Instruktor</div>
        <div class="value">${escapeHtml(data.instructorName)}</div>
      </div>
      <div class="foot-col">
        <div class="label">Berilgan sana</div>
        <div class="value">${escapeHtml(issued)}</div>
      </div>
      <div class="foot-col">
        <div class="label">Sertifikat raqami</div>
        <div class="value mono">${escapeHtml(data.certificateNumber)}</div>
      </div>
      <div class="verify">
        <img class="qr" src="${data.qrDataUrl}" alt="QR" />
        <div class="verify-text">
          <div class="label">Tekshirish</div>
          <div class="url">${escapeHtml(data.verifyUrl)}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
