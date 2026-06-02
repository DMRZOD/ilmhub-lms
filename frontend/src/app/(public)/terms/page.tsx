import type { Metadata } from "next";

import { PolicyPage } from "@/components/features/legal/policy-page";

export const metadata: Metadata = {
  title: "Foydalanish shartlari",
  description:
    "IlmHub.uz platformasidan foydalanish qoidalari, foydalanuvchi va platforma majburiyatlari.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Foydalanish shartlari — IlmHub",
    description: "IlmHub.uz xizmatlaridan foydalanish shartlari.",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Foydalanish shartlari"
      lastUpdated="28-may, 2026"
      intro="Ushbu shartlar IlmHub.uz platformasi va uning foydalanuvchilari o'rtasidagi munosabatlarni tartibga soladi. Saytdan foydalanish orqali siz ushbu qoidalarga roziligingizni bildirasiz."
      sections={[
        {
          heading: "1. Umumiy qoidalar",
          body: [
            "IlmHub.uz — onlayn ta'lim platformasi bo'lib, foydalanuvchilarga turli yo'nalishlarda kurslar, mashqlar va sertifikatlar olish imkonini taqdim etadi.",
            "Platformadan foydalanish uchun foydalanuvchi 14 yoshdan oshgan bo'lishi yoki ota-onasi (qonuniy vakili) roziligiga ega bo'lishi shart.",
          ],
        },
        {
          heading: "2. Ro'yxatdan o'tish",
          body: [
            "Kurslarga yozilish uchun siz hisob ochishingiz va to'g'ri ma'lumotlarni taqdim etishingiz kerak. Boshqa shaxsning identifikatsion ma'lumotlarini kiritish taqiqlanadi.",
            "Hisobingiz xavfsizligi uchun siz mas'ulsiz: parol murakkab bo'lishi va begona shaxslarga oshkor qilinmasligi kerak.",
          ],
        },
        {
          heading: "3. To'lovlar va qaytarish",
          body: [
            "Pullik kurslarning narxlari kurs sahifasida ko'rsatilgan. To'lovlar mahalliy to'lov tizimlari orqali amalga oshiriladi.",
            "Agar kurs siz uchun mos kelmasa, sotib olingandan keyin 7 kun ichida pulingizni qaytarishni so'rashingiz mumkin — agar kurs progressi 20% dan oshmagan bo'lsa.",
          ],
        },
        {
          heading: "4. Intellektual mulk huquqlari",
          body: [
            "Platforma kontenti (videolar, matnlar, kodlar, dizayn elementlari) IlmHub yoki uning hamkorlariga tegishli va mualliflik huquqi bilan himoyalangan.",
            "Foydalanuvchilar kursdan olingan materiallarni shaxsiy ta'lim maqsadlarida foydalanishlari mumkin, ammo ularni qayta sotish, tarqatish yoki ommaviy ravishda nashr etish taqiqlanadi.",
          ],
        },
        {
          heading: "5. Foydalanuvchi xulq-atvori",
          body: [
            "Forumlar va sharhlarda hurmat ko'rsating: haqorat, kamsituvchi izohlar, spam va g'ayriqonuniy mazmun joylashtirish taqiqlanadi.",
            "Ushbu qoidalarni buzganlikni aniqlash holatlarida biz hisobni ogohlantirishsiz o'chirib qo'yish huquqini saqlab qolamiz.",
          ],
        },
        {
          heading: "6. Xizmatlarning mavjudligi",
          body: [
            "Biz platforma uzluksiz ishlashi uchun harakat qilamiz, ammo texnik ishlar, yangilanishlar yoki sizdan tashqarida bo'lgan sabablarga ko'ra qisqa muddatli uzilishlar bo'lishi mumkin.",
          ],
        },
        {
          heading: "7. Javobgarlikni cheklash",
          body: [
            "IlmHub kurs natijalari (masalan, ish topish, daromad) uchun kafolat bermaydi. O'rganishdan keladigan natija ko'p jihatdan foydalanuvchining mehnatiga bog'liq.",
            "Platforma kontentidan foydalanish natijasida yuzaga keladigan bilvosita zararlar uchun IlmHub javobgar emas.",
          ],
        },
        {
          heading: "8. Shartlarga o'zgartirishlar",
          body: [
            "Biz ushbu shartlarga o'zgartirishlar kiritish huquqini saqlab qolamiz. Muhim o'zgarishlar haqida sizni email yoki platforma orqali xabardor qilamiz.",
          ],
        },
      ]}
    />
  );
}
