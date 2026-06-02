export interface CourseApprovedPayload {
  name: string;
  title: string;
  link?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderCourseApprovedEmail({
  name,
  title,
  link,
}: CourseApprovedPayload): RenderedEmail {
  const subject = `"${title}" kursingiz tasdiqlandi!`;
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(title);

  const html = `<!doctype html>
<html lang="uz">
  <body style="margin:0;padding:24px;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:22px;">Kursингiz tasdiqlandi!</h1>
        <p style="margin:0 0 12px;line-height:1.5;">Assalomu alaykum, ${safeName}!</p>
        <p style="margin:0 0 16px;line-height:1.5;"><strong>"${safeTitle}"</strong> kursingiz ko'rib chiqildi va platformada nashr etildi. Endi o'quvchilar kursингizga yozilishi mumkin.</p>
        <hr style="border:0;border-top:1px solid #e5e5e5;margin:16px 0;">
        ${link ? `<a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Kursga o'tish →</a>` : ''}
        <p style="margin-top:24px;font-size:12px;color:#999;">IlmHub — O'quv platformasi</p>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = `Assalomu alaykum, ${name}!\n\n"${title}" kursingiz ko'rib chiqildi va nashr etildi.${link ? '\n\n' + link : ''}`;
  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
