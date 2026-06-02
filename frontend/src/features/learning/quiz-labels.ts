// Hardcoded Uzbek UI strings for the quiz feature (repo convention — no i18n lib).
export const QUIZ_TEXT = {
  // Intro
  introQuestionsCount: (n: number) => `Bu testda ${n} ta savol bor.`,
  introPassing: (percent: number) => `O'tish uchun ${percent}% kerak.`,
  introAttempts: (n: number) => `${n} ta urinish.`,
  introAttemptsUnlimited: "Cheksiz urinish.",
  introAttemptsUsed: (used: number, total: number) =>
    `Urinishlar: ${used} / ${total}`,
  introAttemptsUsedUnlimited: (used: number) => `Urinishlar: ${used}`,
  start: "Boshlash",
  retry: "Yana urinib ko'rish",
  alreadyPassed: "Siz bu testdan muvaffaqiyatli o'tgansiz.",
  noAttemptsLeft:
    "Urinishlar tugadi. Bu testni qayta topshira olmaysiz.",

  // Progress / navigation
  progress: (current: number, total: number) =>
    `Savol ${current} / ${total}`,
  prev: "Orqaga",
  next: "Keyingi",
  finish: "Tugatish",
  multipleHint: "Bir nechta javobni tanlash mumkin",
  textPlaceholder: "Javobingizni shu yerga yozing...",

  // Submitting
  submitting: "Tekshirilmoqda...",
  submitError: "Yuborishda xatolik. Qayta urinib ko'ring.",

  // Result
  resultPassedTitle: "Tabriklaymiz, testdan o'tdingiz!",
  resultFailedTitle: "Afsuski, o'ta olmadingiz",
  yourScore: (score: number) => `Sizning natijangiz: ${score}%`,
  passingScore: (percent: number) => `O'tish chegarasi: ${percent}%`,
  attemptsRemaining: (n: number) => `Qolgan urinishlar: ${n}`,
  breakdownTitle: "Savollar tahlili",
  correct: "To'g'ri",
  incorrect: "Noto'g'ri",
  yourAnswer: "Sizning javobingiz:",
  correctAnswer: "To'g'ri javob:",
  noAnswer: "Javob berilmadi",
  explanation: "Izoh:",
  resultHiddenNote:
    "To'g'ri javoblar faqat testdan o'tganingizdan keyin ko'rsatiladi.",
  nextLesson: "Keyingi darsga o'tish",
  backToCourse: "Kursga qaytish",

  // Errors / empty
  loadError: "Testni yuklashda xatolik yuz berdi.",
  notFound: "Bu dars uchun test topilmadi.",
} as const;
