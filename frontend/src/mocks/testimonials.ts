import type { Testimonial } from "@/types/testimonial";

const dicebear = (seed: string) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundType=gradientLinear&fontWeight=600`;

export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    studentName: "Bahodir Ergashev",
    studentAvatar: dicebear("Bahodir Ergashev"),
    studentRole: "Frontend Developer",
    courseName: "React.js asoslari",
    rating: 5,
    text: "Kursdan keyin birinchi ish o'rnimni topdim. Aziz aka materiallarni shu qadar tushunarli yetkazib beradiki — har bir mavzu o'rniga tushadi.",
  },
  {
    id: "t-2",
    studentName: "Madina Olimova",
    studentAvatar: dicebear("Madina Olimova"),
    studentRole: "UI/UX dizayner",
    courseName: "Figma'da UI/UX dizayn",
    rating: 5,
    text: "Hech qachon dizayn qilmagan edim. Endi esa portfolio bilan junior pozitsiyalarga taklif olyapman. Amaliyotlar real loyihalarga juda yaqin.",
  },
  {
    id: "t-3",
    studentName: "Sardor Yusupov",
    studentAvatar: dicebear("Sardor Yusupov"),
    studentRole: "Backend Engineer",
    courseName: "Node.js bilan backend",
    rating: 5,
    text: "Microservices arxitekturasini real kod orqali tushuntirib berildi. Ish joyimda menga ishonib katta loyihani topshirishdi.",
  },
  {
    id: "t-4",
    studentName: "Zarina Tursunova",
    studentAvatar: dicebear("Zarina Tursunova"),
    studentRole: "Data Analyst",
    courseName: "Python bilan ma'lumotlar tahlili",
    rating: 5,
    text: "Marketing sohasidan keldim, raqamlardan qo'rqardim. Hozir biznes savollariga Python bilan javob qaytaraman — bu sezilarli farq.",
  },
  {
    id: "t-5",
    studentName: "Otabek Soliyev",
    studentAvatar: dicebear("Otabek Soliyev"),
    studentRole: "Mobile Developer",
    courseName: "Flutter bilan mobil ilovalar",
    rating: 4,
    text: "Mobil ilovalar dunyosiga kirish uchun ajoyib boshlanish. Birinchi loyiham App Store'da nashr etildi.",
  },
  {
    id: "t-6",
    studentName: "Nargiza Komilova",
    studentAvatar: dicebear("Nargiza Komilova"),
    studentRole: "Junior Developer",
    courseName: "Next.js bilan to'liq stack",
    rating: 5,
    text: "Server komponentlari dastlab qiyin tuyulgan, lekin kurs oxirida o'zim production loyihasi tuzdim. O'qituvchining qo'llab-quvvatlashi juda qadrli.",
  },
];
