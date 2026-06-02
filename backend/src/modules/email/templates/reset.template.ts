import type { RenderedEmail } from './verification.template';

export interface PasswordResetEmailPayload {
  name: string;
  url: string;
}

export function renderPasswordResetEmail({
  name,
  url,
}: PasswordResetEmailPayload): RenderedEmail {
  const subject = 'IlmHub — parolni tiklash';
  const html = `<!doctype html>
<html lang="uz">
  <body style="margin:0;padding:24px;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:22px;">Salom, ${escapeHtml(name)}</h1>
        <p style="margin:0 0 16px;line-height:1.5;">
          IlmHub akkauntingiz uchun parolni tiklash so'rovi olindi. Yangi parol o'rnatish uchun quyidagi tugmani bosing — havola 24 soat davomida amal qiladi.
        </p>
        <p style="margin:24px 0;">
          <a href="${url}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Parolni tiklash</a>
        </p>
        <p style="margin:0 0 8px;line-height:1.5;font-size:14px;color:#555;">
          Tugma ishlamasa, quyidagi havolani brauzeringizga nusxalang:
        </p>
        <p style="margin:0 0 24px;word-break:break-all;font-size:13px;color:#2563eb;">${url}</p>
        <p style="margin:0;font-size:13px;color:#888;">
          Agar siz parolni tiklashni so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring — akkauntingiz xavfsiz.
        </p>
      </td></tr>
    </table>
  </body>
</html>`;
  const text = `Salom, ${name}!

IlmHub akkauntingiz uchun parolni tiklash so'rovi olindi. Yangi parol o'rnatish uchun quyidagi havolaga o'ting (24 soat amal qiladi):

${url}

Agar siz parolni tiklashni so'ramagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.`;
  return { subject, html, text };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
