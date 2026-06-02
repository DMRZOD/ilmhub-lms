import type { Metadata } from "next";

import { PolicyPage } from "@/components/features/legal/policy-page";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati",
  description:
    "IlmHub foydalanuvchilarining shaxsiy ma'lumotlarini qanday yig'amiz, saqlaymiz va himoya qilamiz.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Maxfiylik siyosati — IlmHub",
    description: "IlmHub maxfiylik siyosati va ma'lumotlarni himoya qilish qoidalari.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Maxfiylik siyosati"
      lastUpdated="28-may, 2026"
      intro="Ushbu maxfiylik siyosati IlmHub.uz platformasi foydalanuvchilarining shaxsiy ma'lumotlari qanday yig'ilishi, ishlatilishi va himoya qilinishini tavsiflaydi. Platformadan foydalanish orqali siz ushbu shartlarga rozilik bildirasiz."
      sections={[
        {
          heading: "1. Yig'iladigan ma'lumotlar",
          body: [
            "Biz quyidagi turdagi ma'lumotlarni to'plashimiz mumkin: ism, familiya, email manzili, telefon raqami va ro'yxatdan o'tish vaqtida siz tomondan kiritilgan boshqa ma'lumotlar.",
            "Shuningdek, brauzer turi, IP-manzil, kurslarda faollik va xizmatdan foydalanish statistikasi kabi texnik ma'lumotlar avtomatik tarzda yig'iladi.",
          ],
        },
        {
          heading: "2. Ma'lumotlardan foydalanish maqsadlari",
          body: [
            "Yig'ilgan ma'lumotlar foydalanuvchi hisobini boshqarish, ta'lim mazmunini taqdim etish, to'lovlarni amalga oshirish va xizmat sifatini yaxshilash uchun ishlatiladi.",
            "Biz sizning ruxsatingiz bilan yangiliklar, kurs takliflari yoki muhim e'lonlar haqida xabar yuborishimiz mumkin. Bunday xabarlardan istalgan vaqtda voz kechishingiz mumkin.",
          ],
        },
        {
          heading: "3. Cookie-fayllar",
          body: [
            "Platforma ish faoliyatini yaxshilash uchun cookie-fayllardan foydalanadi. Cookie-lar saytdagi tanlovlaringizni saqlash va foydalanish tajribasini shaxsiylashtirish uchun zarur.",
            "Brauzer sozlamalarida cookie-larni o'chirib qo'yishingiz mumkin, ammo bu platformaning ba'zi funksiyalariga ta'sir qilishi mumkin.",
          ],
        },
        {
          heading: "4. Ma'lumotlarni uchinchi tomonlarga berish",
          body: [
            "Biz sizning shaxsiy ma'lumotlaringizni uchinchi tomonlarga sotmaymiz va ijaraga bermaymiz. Ma'lumotlar faqat qonuniy talab qilingan holatlarda yoki xizmat ko'rsatish uchun zarur bo'lgan ishonchli sheriklarga (to'lov tizimlari, hosting xizmatlari) taqdim etiladi.",
          ],
        },
        {
          heading: "5. Ma'lumotlar xavfsizligi",
          body: [
            "Biz sizning ma'lumotlaringizni ruxsatsiz kirishdan himoya qilish uchun zamonaviy texnik va tashkiliy choralarni qo'llaymiz: shifrlash, kirish nazorati va muntazam xavfsizlik auditi.",
          ],
        },
        {
          heading: "6. Foydalanuvchi huquqlari",
          body: [
            "Siz o'z ma'lumotlaringizga kirish, ularni tuzatish yoki o'chirish huquqiga egasiz. Bunday so'rovlarni salom@ilmhub.uz orqali yuborishingiz mumkin.",
            "Shuningdek, hisobingizni ixtiyoriy ravishda o'chirib tashlashingiz mumkin — bu holda barcha shaxsiy ma'lumotlaringiz qonuniy saqlash muddatidan keyin o'chiriladi.",
          ],
        },
        {
          heading: "7. Siyosatga o'zgartirishlar",
          body: [
            "Ushbu siyosat vaqti-vaqti bilan yangilanishi mumkin. Eng so'nggi versiyasi har doim shu sahifada nashr qilinadi. Sezilarli o'zgarishlar bo'lganda biz sizni email orqali xabardor qilamiz.",
          ],
        },
      ]}
    />
  );
}
