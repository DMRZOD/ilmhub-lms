export interface VerificationEmailPayload {
  name: string;
  url: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderVerificationEmail({
  name,
  url,
}: VerificationEmailPayload): RenderedEmail {
  const subject = 'IlmHub — emailingizni tasdiqlang';
  const html = `<!doctype html>
<html lang="uz">
  <body style="margin:0;padding:24px;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:22px;">Xush kelibsiz, ${escapeHtml(name)}!</h1>
        <p style="margin:0 0 16px;line-height:1.5;">
          IlmHub'da ro'yxatdan o'tganingiz uchun rahmat. Akkauntingizni faollashtirish uchun quyidagi tugmani bosing:
        </p>
        <p style="margin:24px 0;">
          <a href="${url}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Emailni tasdiqlash</a>
        </p>
        <p style="margin:0 0 8px;line-height:1.5;font-size:14px;color:#555;">
          Tugma ishlamasa, quyidagi havolani brauzeringizga nusxalang:
        </p>
        <p style="margin:0 0 24px;word-break:break-all;font-size:13px;color:#2563eb;">${url}</p>
        <p style="margin:0;font-size:13px;color:#888;">
          Agar siz IlmHub'da ro'yxatdan o'tmagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.
        </p>
      </td></tr>
    </table>
  </body>
</html>`;
  const text = `Xush kelibsiz, ${name}!

IlmHub'da ro'yxatdan o'tganingiz uchun rahmat. Akkauntingizni faollashtirish uchun quyidagi havolaga o'ting:

${url}

Agar siz IlmHub'da ro'yxatdan o'tmagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.`;
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
