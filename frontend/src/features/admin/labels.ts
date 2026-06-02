import type { ApplicationStatus, UserRole, UserStatus } from "./schemas";

export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "Talaba",
  INSTRUCTOR: "Ustoz",
  ADMIN: "Admin",
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: "Faol",
  SUSPENDED: "Bloklangan",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Kutilmoqda",
  PAID: "To'langan",
  FAILED: "Muvaffaqiyatsiz",
  REFUNDED: "Qaytarilgan",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "Kutilmoqda",
  APPROVED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
};

export const COURSE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Qoralama",
  PENDING_REVIEW: "Ko'rib chiqilmoqda",
  PUBLISHED: "Nashr etilgan",
  REJECTED: "Rad etilgan",
  ARCHIVED: "Arxiv",
};

export const REFUND_STATUS_LABELS: Record<string, string> = {
  REQUESTED: "So'ralgan",
  APPROVED: "Tasdiqlangan",
  REJECTED: "Rad etilgan",
  COMPLETED: "Bajarilgan",
};

export const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
  PAYME: "Payme",
  CLICK: "Click",
  UZUM: "Uzum",
};

/** Human-readable labels for audit-log action codes. */
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  USER_SUSPENDED: "Foydalanuvchi bloklandi",
  USER_UNSUSPENDED: "Blok olib tashlandi",
  USER_ROLE_CHANGED: "Rol o'zgartirildi",
  USER_DELETED: "Foydalanuvchi o'chirildi",
  USER_EMAILED: "Email yuborildi",
  INSTRUCTOR_APPROVED: "Ariza tasdiqlandi",
  INSTRUCTOR_REJECTED: "Ariza rad etildi",
  COURSE_APPROVED: "Kurs tasdiqlandi",
  COURSE_REJECTED: "Kurs rad etildi",
  COURSE_ARCHIVED: "Kurs arxivlandi",
  COURSE_NOTE: "Izoh qo'shildi",
  REFUND_APPROVED: "Pul qaytarildi",
  REFUND_REJECTED: "So'rov rad etildi",
  BLOG_CREATED: "Blog post yaratildi",
  BLOG_UPDATED: "Blog post tahrirlandi",
  BLOG_PUBLISHED: "Blog post nashr etildi",
  BLOG_UNPUBLISHED: "Blog post qoralamaga olindi",
  BLOG_DELETED: "Blog post o'chirildi",
  CMS_CATEGORY_CREATED: "Kategoriya yaratildi",
  CMS_CATEGORY_UPDATED: "Kategoriya tahrirlandi",
  CMS_CATEGORY_DELETED: "Kategoriya o'chirildi",
  CMS_ACHIEVEMENT_CREATED: "Yutuq yaratildi",
  CMS_ACHIEVEMENT_UPDATED: "Yutuq tahrirlandi",
  CMS_ACHIEVEMENT_DELETED: "Yutuq o'chirildi",
  CMS_TESTIMONIAL_CREATED: "Sharh qo'shildi",
  CMS_TESTIMONIAL_UPDATED: "Sharh tahrirlandi",
  CMS_TESTIMONIAL_DELETED: "Sharh o'chirildi",
  CMS_FAQ_CREATED: "FAQ qo'shildi",
  CMS_FAQ_UPDATED: "FAQ tahrirlandi",
  CMS_FAQ_DELETED: "FAQ o'chirildi",
  CMS_HOME_UPDATED: "Bosh sahifa yangilandi",
  SETTINGS_UPDATED: "Sozlamalar o'zgartirildi",
  REVIEW_REPORT_DISMISSED: "Shikoyat rad etildi",
  REVIEW_REMOVED: "Sharh olib tashlandi",
};

export const REVIEW_REPORT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Kutilmoqda",
  RESOLVED: "Hal qilingan",
  DISMISSED: "Rad etilgan",
};

export const ADMIN_USERS_TEXT = {
  title: "Foydalanuvchilar",
  subtitle: "Barcha foydalanuvchilarni boshqarish",
  searchPlaceholder: "Ism yoki email bo'yicha qidirish",
  empty: "Foydalanuvchilar topilmadi",
  columns: {
    user: "Foydalanuvchi",
    role: "Rol",
    status: "Holat",
    created: "Ro'yxatdan o'tgan",
    lastLogin: "Oxirgi kirish",
    courses: "Kurslar",
    actions: "Amallar",
  },
  filters: {
    allRoles: "Barcha rollar",
    allStatuses: "Barcha holatlar",
  },
  sort: {
    newest: "Avval yangi",
    oldest: "Avval eski",
    name: "Ism (A-Z)",
    lastLogin: "Oxirgi kirish",
  },
  actions: {
    view: "Ko'rish",
    makeInstructor: "Ustoz qilish",
    makeStudent: "Talaba qilish",
    suspend: "Bloklash",
    unsuspend: "Blokdan chiqarish",
    delete: "O'chirish",
    email: "Email yuborish",
  },
  bulk: {
    selected: (n: number) => `${n} ta tanlandi`,
    suspend: "Bloklash",
    unsuspend: "Blokdan chiqarish",
    email: "Email yuborish",
    clear: "Bekor qilish",
  },
  detail: {
    courses: "Kurslar",
    orders: "Buyurtmalar",
    auditLog: "Amallar tarixi",
    noOrders: "Buyurtmalar yo'q",
    noCourses: "Kurslarga yozilmagan",
    noAudit: "Tarix bo'sh",
    verified: "Tasdiqlangan",
    notVerified: "Tasdiqlanmagan",
  },
  emailForm: {
    title: "Email yuborish",
    subject: "Mavzu",
    body: "Matn",
    send: "Yuborish",
    recipients: (n: number) => `${n} ta qabul qiluvchi`,
  },
  confirmDelete:
    "Bu foydalanuvchini butunlay o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.",
  confirmDeleteAgain: "Ishonchingiz komilmi? Oxirgi tasdiqlash.",
};

export const ADMIN_INSTRUCTORS_TEXT = {
  title: "Ustozlar",
  subtitle: "Ustozlarni va arizalarni boshqarish",
  searchPlaceholder: "Ism yoki email bo'yicha qidirish",
  tabs: {
    approved: "Tasdiqlangan",
    pending: "Kutilmoqda",
    rejected: "Rad etilgan",
  },
  columns: {
    instructor: "Ustoz",
    courses: "Kurslar",
    students: "Talabalar",
    revenue: "Daromad",
    status: "Holat",
    actions: "Amallar",
  },
  sort: {
    name: "Ism (A-Z)",
    students: "Talabalar soni",
    revenue: "Daromad",
  },
  empty: {
    approved: "Tasdiqlangan ustozlar yo'q",
    pending: "Kutilayotgan arizalar yo'q",
    rejected: "Rad etilgan arizalar yo'q",
  },
  application: {
    bio: "Bio",
    expertise: "Yo'nalishlar",
    links: "Havolalar",
    approve: "Tasdiqlash",
    reject: "Rad etish",
    rejectedReason: "Rad etish sababi",
    rejectPrompt: "Rad etish sababini kiriting (kamida 10 ta belgi):",
  },
  actions: {
    changeStatus: "Statusni o'zgartirish",
    suspend: "Bloklash",
    unsuspend: "Blokdan chiqarish",
  },
};

export const ADMIN_COURSES_TEXT = {
  title: "Kurslar moderatsiyasi",
  subtitle: "Kurslarni ko'rib chiqish, tasdiqlash va arxivlash",
  searchPlaceholder: "Kurs nomi bo'yicha qidirish",
  tabs: {
    PENDING_REVIEW: "Ko'rib chiqilmoqda",
    PUBLISHED: "Nashr etilgan",
    REJECTED: "Rad etilgan",
    ARCHIVED: "Arxiv",
    ALL: "Hammasi",
  },
  columns: {
    course: "Kurs",
    instructor: "Ustoz",
    price: "Narx",
    students: "Talabalar",
    status: "Holat",
    updated: "Yangilangan",
    actions: "Amallar",
  },
  empty: "Kurslar topilmadi",
  free: "Bepul",
  open: "Ko'rish",
  back: "Orqaga",
  bulk: {
    selected: (n: number) => `${n} ta tanlandi`,
    approve: "Tasdiqlash",
    archive: "Arxivlash",
    clear: "Bekor qilish",
  },
  detail: {
    overview: "Umumiy",
    curriculum: "Dastur",
    outcomes: "Nimani o'rganadi",
    requirements: "Talablar",
    description: "Tavsif",
    lessons: (n: number) => `${n} ta dars`,
    rejectionReason: "Rad etish sababi",
    panelTitle: "Moderatsiya",
    approve: "Tasdiqlash",
    reject: "Rad etish",
    archive: "Arxivlash",
    notes: "Ichki izohlar",
    notesPlaceholder: "Boshqa adminlar uchun izoh...",
    addNote: "Izoh qo'shish",
    noNotes: "Izohlar yo'q",
    rejectPrompt: "Rad etish sababini kiriting (kamida 5 ta belgi):",
    confirmApprove: "Bu kursni tasdiqlab, nashr qilasizmi?",
    confirmArchive: "Bu kursni arxivlaysizmi? U katalogdan olib tashlanadi.",
  },
};

export const ADMIN_REFUNDS_TEXT = {
  title: "Pul qaytarish",
  subtitle: "Pul qaytarish so'rovlarini boshqarish",
  tabs: {
    REQUESTED: "So'ralgan",
    COMPLETED: "Bajarilgan",
    REJECTED: "Rad etilgan",
    ALL: "Hammasi",
  },
  columns: {
    student: "Talaba",
    courses: "Kurslar",
    amount: "Summa",
    method: "To'lov usuli",
    status: "Holat",
    requested: "So'ralgan sana",
    reason: "Sabab",
    actions: "Amallar",
  },
  empty: "So'rovlar topilmadi",
  approve: "Tasdiqlash",
  reject: "Rad etish",
  rejectPrompt: "Rad etish sababini kiriting (kamida 5 ta belgi):",
  confirmApprove:
    "Bu so'rovni tasdiqlaysizmi? To'lov qaytariladi va kursga kirish to'xtatiladi.",
  bulk: {
    selected: (n: number) => `${n} ta tanlandi`,
    approve: "Tasdiqlash",
    clear: "Bekor qilish",
  },
};

export const ADMIN_REPORTS_TEXT = {
  title: "Shikoyatlar",
  subtitle: "Sharhlarga kelgan shikoyatlarni ko'rib chiqish",
  tabs: {
    PENDING: "Kutilmoqda",
    DISMISSED: "Rad etilgan",
    ALL: "Hammasi",
  },
  columns: {
    course: "Kurs",
    review: "Sharh",
    author: "Muallif",
    reporter: "Shikoyatchi",
    reason: "Sabab",
    created: "Sana",
    status: "Holat",
    actions: "Amallar",
  },
  empty: "Shikoyatlar topilmadi",
  dismiss: "Rad etish",
  remove: "Sharhni o'chirish",
  confirmDismiss: "Bu shikoyatni rad etasizmi? Sharh joyida qoladi.",
  confirmRemove:
    "Bu sharhni butunlay o'chirasizmi? Kurs reytingi qayta hisoblanadi.",
};

export const ADMIN_BLOG_TEXT = {
  title: "Blog",
  subtitle: "Maqolalarni yaratish va boshqarish",
  searchPlaceholder: "Sarlavha bo'yicha qidirish",
  newPost: "Yangi post",
  empty: "Postlar topilmadi",
  filters: {
    allStatuses: "Barcha holatlar",
    allCategories: "Barcha kategoriyalar",
  },
  status: {
    DRAFT: "Qoralama",
    PUBLISHED: "Nashr etilgan",
  },
  columns: {
    title: "Sarlavha",
    category: "Kategoriya",
    status: "Holat",
    updated: "Yangilangan",
    actions: "Amallar",
  },
  editor: {
    newTitle: "Yangi post",
    editTitle: "Postni tahrirlash",
    fields: {
      title: "Sarlavha",
      slug: "Slug (URL)",
      excerpt: "Qisqa tavsif",
      cover: "Muqova rasmi",
      category: "Kategoriya",
      tags: "Teglar",
      content: "Matn",
      noCategory: "Kategoriyasiz",
    },
    tagsPlaceholder: "Teg yozib Enter bosing",
    uploadCover: "Rasm yuklash",
    changeCover: "Rasmni almashtirish",
    removeCover: "O'chirish",
    save: "Saqlash",
    saving: "Saqlanmoqda…",
    saved: "Saqlandi",
    publish: "Nashr qilish",
    unpublish: "Qoralamaga olish",
    preview: "Ko'rib chiqish",
    delete: "O'chirish",
    back: "Blogga qaytish",
    autosaved: "Avtomatik saqlandi",
    confirmDelete: "Bu postni o'chirmoqchimisiz?",
    titleRequired: "Sarlavha kamida 2 ta belgidan iborat bo'lishi kerak",
    previewTitle: "Ko'rinish",
  },
  categories: {
    title: "Blog kategoriyalari",
    add: "Kategoriya qo'shish",
    name: "Nomi",
    slug: "Slug",
    description: "Tavsif",
    sortOrder: "Tartib",
    empty: "Kategoriyalar yo'q",
  },
};

export const ADMIN_CMS_TEXT = {
  title: "CMS",
  subtitle: "Sayt kontentini boshqarish",
  tabs: {
    categories: "Kategoriyalar",
    achievements: "Yutuqlar",
    home: "Bosh sahifa",
  },
  common: {
    add: "Qo'shish",
    edit: "Tahrirlash",
    delete: "O'chirish",
    save: "Saqlash",
    cancel: "Bekor qilish",
    name: "Nomi",
    slug: "Slug",
    description: "Tavsif",
    icon: "Ikonka (Lucide)",
    sortOrder: "Tartib",
    published: "Nashr etilgan",
    confirmDelete: "Rostdan o'chirmoqchimisiz?",
  },
  categories: {
    title: "Kurs kategoriyalari",
    add: "Kategoriya qo'shish",
    courses: "Kurslar",
    empty: "Kategoriyalar yo'q",
  },
  achievements: {
    title: "Yutuqlar",
    add: "Yutuq qo'shish",
    code: "Kod",
    achTitle: "Sarlavha",
    criteria: "Kriteriya (JSON)",
    criteriaHint: "Masalan: {\"type\":\"enrollments\",\"count\":5}",
    invalidJson: "JSON noto'g'ri",
    empty: "Yutuqlar yo'q",
  },
  home: {
    title: "Bosh sahifa",
    hero: "Hero",
    heroTitle: "Sarlavha",
    heroSubtitle: "Tavsif",
    primaryCtaLabel: "Asosiy tugma matni",
    primaryCtaHref: "Asosiy tugma havolasi",
    secondaryCtaLabel: "Ikkilamchi tugma matni",
    secondaryCtaHref: "Ikkilamchi tugma havolasi",
    stats: "Statistika",
    statValue: "Qiymat",
    statSuffix: "Belgi",
    statLabel: "Nomi",
    addStat: "Statistika qo'shish",
    saveHero: "Hero saqlash",
    saveStats: "Statistikani saqlash",
    testimonials: "Sharhlar",
    addTestimonial: "Sharh qo'shish",
    studentName: "Talaba ismi",
    studentRole: "Lavozim",
    courseName: "Kurs nomi",
    rating: "Reyting (1-5)",
    testimonialText: "Matn",
    avatar: "Avatar URL",
    faq: "Savol-javoblar",
    addFaq: "Savol qo'shish",
    question: "Savol",
    answer: "Javob",
    featuredNote:
      "Tavsiya etilgan kurslar avtomatik (eng yuqori baholangan) ko'rsatiladi.",
  },
};

export const ADMIN_SETTINGS_TEXT = {
  title: "Sozlamalar",
  subtitle: "Platforma sozlamalari va integratsiyalar",
  commission: {
    title: "Komissiya",
    label: "Komissiya foizi (%)",
    hint: "Ustozlar daromadidan ushlab qolinadigan foiz.",
  },
  maintenance: {
    title: "Texnik xizmat rejimi",
    label: "Texnik xizmat rejimini yoqish",
    hint: "Yoqilganda sayt vaqtincha ishlamaydi (kelajakda).",
  },
  emailSender: {
    title: "Email jo'natuvchi",
    name: "Jo'natuvchi nomi",
    address: "Jo'natuvchi manzili",
  },
  emailTemplates: {
    title: "Email shablonlari",
    hint: "Shablon matnlari kodda saqlanadi (faqat ko'rish).",
  },
  integrations: {
    title: "Integratsiyalar",
    configured: "Ulangan",
    notConfigured: "Ulanmagan",
  },
  audit: {
    title: "Amallar tarixi",
    columns: {
      action: "Amal",
      actor: "Kim",
      target: "Obyekt",
      date: "Sana",
    },
    empty: "Tarix bo'sh",
  },
  save: "Saqlash",
};

// Student-side refund request UI (mening-kurslarim).
export const STUDENT_REFUND_TEXT = {
  request: "Pulni qaytarish",
  requested: "So'rov yuborildi",
  refunded: "Qaytarildi",
  dialogTitle: "Pulni qaytarish so'rovi",
  reasonLabel: "Sababini yozing",
  reasonPlaceholder: "Nima uchun pulni qaytarmoqchisiz?",
  submit: "So'rov yuborish",
  cancel: "Bekor qilish",
};
