export interface RefundConfirmationPayload {
  name: string;
  courses: { title: string }[];
  amountUsdCents: number;
  url: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export function renderRefundConfirmationEmail({
  name,
  courses,
  amountUsdCents,
  url,
}: RefundConfirmationPayload): RenderedEmail {
  const subject = "IlmHub — pul qaytarish so'rovingiz bajarildi";
  const amount = formatPrice(amountUsdCents);
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
        <h1 style="margin:0 0 16px;font-size:22px;">Assalomu alaykum, ${escapeHtml(name)}!</h1>
        <p style="margin:0 0 16px;line-height:1.5;">
          Pul qaytarish so'rovingiz tasdiqlandi. Quyidagi kurs(lar) bo'yicha to'lov qaytarildi:
        </p>
        <ul style="margin:0 0 16px;padding-left:20px;">${itemsHtml}</ul>
        <p style="margin:0 0 24px;font-weight:600;">Qaytarilgan summa: ${amount}</p>
        <p style="margin:0 0 24px;line-height:1.5;">
          Mablag' to'lov tizimingizga qarab bir necha ish kuni ichida hisobingizga tushadi. Kurs(lar)ga kirish to'xtatildi.
        </p>
        <p style="margin:24px 0;">
          <a href="${url}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Buyurtmalarim</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = `Assalomu alaykum, ${name}!

Pul qaytarish so'rovingiz tasdiqlandi. Quyidagi kurs(lar) bo'yicha to'lov qaytarildi:

${itemsText}

Qaytarilgan summa: ${amount}

Mablag' to'lov tizimingizga qarab bir necha ish kuni ichida hisobingizga tushadi. Kurs(lar)ga kirish to'xtatildi.

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
