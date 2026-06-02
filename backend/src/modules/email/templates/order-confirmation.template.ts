export interface OrderConfirmationPayload {
  name: string;
  courses: { title: string }[];
  totalUsdCents: number;
  url: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderOrderConfirmationEmail({
  name,
  courses,
  totalUsdCents,
  url,
}: OrderConfirmationPayload): RenderedEmail {
  const subject = "IlmHub — to'lovingiz qabul qilindi";
  const total = formatPrice(totalUsdCents);
  const itemsHtml = courses
    .map(
      (c) =>
        `<li style="margin:0 0 8px;line-height:1.5;">${escapeHtml(c.title)}</li>`,
    )
    .join('');
  const itemsText = courses.map((c) => `• ${c.title}`).join('\n');

  const html = `<!doctype html>
<html lang="uz">
  <body style="margin:0;padding:24px;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#111;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:22px;">Rahmat, ${escapeHtml(name)}!</h1>
        <p style="margin:0 0 16px;line-height:1.5;">
          To'lovingiz muvaffaqiyatli qabul qilindi. Quyidagi kurslar hisobingizga qo'shildi:
        </p>
        <ul style="margin:0 0 16px;padding-left:20px;">${itemsHtml}</ul>
        <p style="margin:0 0 24px;font-weight:600;">Jami: ${total}</p>
        <p style="margin:24px 0;">
          <a href="${url}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">O'qishni boshlash</a>
        </p>
        <p style="margin:0;font-size:13px;color:#888;">
          Savollar bo'lsa, bizga javob yozing — yordam berishdan mamnunmiz.
        </p>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = `Rahmat, ${name}!

To'lovingiz muvaffaqiyatli qabul qilindi. Quyidagi kurslar hisobingizga qo'shildi:

${itemsText}

Jami: ${total}

O'qishni boshlash uchun havolaga o'ting:
${url}`;

  return { subject, html, text };
}

function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return Number.isInteger(dollars) ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
