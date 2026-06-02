export interface CourseRejectedPayload {
  name: string;
  courseTitle: string;
  reason: string;
  url: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderCourseRejectedEmail({
  name,
  courseTitle,
  reason,
  url,
}: CourseRejectedPayload): RenderedEmail {
  const subject = `IlmHub — "${courseTitle}" kursi qayta ko'rib chiqishni talab qiladi`;
  const safeReason = escapeHtml(reason).replace(/\n/g, '<br/>');

  const html = `<!doctype html>
<html lang="uz">
  <body style="margin:0;padding:24px;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:22px;">Assalomu alaykum, ${escapeHtml(name)}!</h1>
        <p style="margin:0 0 16px;line-height:1.5;">
          <strong>${escapeHtml(courseTitle)}</strong> kursingiz ko'rib chiqildi va hozircha nashrga tasdiqlanmadi.
        </p>
        <p style="margin:0 0 8px;font-weight:600;">Sabab:</p>
        <p style="margin:0 0 24px;line-height:1.5;padding:12px 16px;background:#f7f7f8;border-radius:8px;">${safeReason}</p>
        <p style="margin:0 0 24px;line-height:1.5;">
          Iltimos, izohlarni hisobga olib kursni tahrirlang va qayta ko'rib chiqishga yuboring.
        </p>
        <p style="margin:24px 0;">
          <a href="${url}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Kursni tahrirlash</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = `Assalomu alaykum, ${name}!

"${courseTitle}" kursingiz ko'rib chiqildi va hozircha nashrga tasdiqlanmadi.

Sabab:
${reason}

Iltimos, izohlarni hisobga olib kursni tahrirlang va qayta ko'rib chiqishga yuboring:
${url}`;

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
