/**
 * Hand-authored catalogue for the IlmHub seed.
 *
 * This replaces the old faker-random course generator with a curated set of
 * real, believable Uzbek-language courses (titles, descriptions, section/lesson
 * structure, real quizzes and coding exercises). The seed (`seed.ts`) still
 * generates the surrounding ecosystem (students, enrollments, reviews, Q&A,
 * orders, notifications, …) and attaches it to these courses, so dashboards and
 * analytics stay populated.
 *
 * Video lessons carry no playback ID here — `seed.ts` assigns a public Mux demo
 * playback ID so the player streams without real uploads. Once real Mux is wired
 * up (see docs/PLAN.md), instructors upload their own videos through the wizard.
 */
import {
  CodingLanguage,
  CourseLanguage,
  CourseLevel,
  LessonType,
  QuizQuestionType,
} from '@prisma/client';

export interface CuratedInstructor {
  email: string;
  name: string;
  bio: string;
}

export interface CuratedQuizQuestion {
  type: QuizQuestionType;
  text: string;
  options: { id: string; text: string }[];
  correctAnswerIds: string[];
  explanation: string;
}

export interface CuratedCoding {
  language: CodingLanguage;
  /** Function the tests call, e.g. "add". */
  entryFunction: string;
  starterCode: string;
  solutionCode: string;
  /** `input` is a JSON array of arguments, e.g. "[2, 3]". */
  tests: { input: string; expectedOutput: string }[];
}

export interface CuratedLesson {
  title: string;
  description?: string;
  type: LessonType;
  durationSeconds: number;
  isPreview?: boolean;
  article?: string;
  quiz?: { passingScore?: number; questions: CuratedQuizQuestion[] };
  coding?: CuratedCoding;
  resources?: { name: string; url: string }[];
}

export interface CuratedSection {
  title: string;
  lessons: CuratedLesson[];
}

export interface CuratedCourse {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  categorySlug: string;
  instructorIndex: number;
  level: CourseLevel;
  language: CourseLanguage;
  priceUsdCents: number;
  discountUsdCents?: number | null;
  learningOutcomes: string[];
  requirements: string[];
  sections: CuratedSection[];
}

// 5 named instructors (indexes referenced by CuratedCourse.instructorIndex).
// Emails follow the existing instructor{N}@ilmhub.uz convention so the demo
// login from the README keeps working.
export const CURATED_INSTRUCTORS: CuratedInstructor[] = [
  {
    email: 'instructor1@ilmhub.uz',
    name: 'Aziz Karimov',
    bio: "Senior Frontend Developer, 8 yillik tajriba. Bir nechta startaplarda jamoa yetakchisi bo'lgan. HTML, CSS, JavaScript va React bo'yicha 5000+ talabaga dars bergan.",
  },
  {
    email: 'instructor2@ilmhub.uz',
    name: 'Dilshod Rahimov',
    bio: "Backend muhandis va arxitektor. Node.js, PostgreSQL va bulutli infratuzilma bo'yicha mutaxassis. Yirik fintech loyihalarida ishlagan.",
  },
  {
    email: 'instructor3@ilmhub.uz',
    name: 'Kamola Saidova',
    bio: "Data Scientist va Python bo'yicha murabbiy. Ma'lumotlar tahlili va mashinaviy o'qitishni soddadan murakkabga qarab tushuntiradi.",
  },
  {
    email: 'instructor4@ilmhub.uz',
    name: 'Madina Yusupova',
    bio: "Product dizayner, UI/UX bo'yicha 6 yillik tajriba. Figma va dizayn tizimlari bo'yicha amaliy mutaxassis.",
  },
  {
    email: 'instructor5@ilmhub.uz',
    name: 'Sardor Aliyev',
    bio: "Full-stack dasturchi va texnik murabbiy. Dasturlashni endi boshlayotganlar uchun tushunarli yo'l xaritasini tuzishga ixtisoslashgan.",
  },
];

const USD = (dollars: number) => Math.round(dollars * 100);

// Reusable real coding exercises -------------------------------------------------

const CODING_PY_SUM: CuratedCoding = {
  language: CodingLanguage.JS,
  entryFunction: 'add',
  starterCode:
    'function add(a, b) {\n  // ikkita sonni qo\'shib qaytaring\n}\n',
  solutionCode: 'function add(a, b) {\n  return a + b;\n}\n',
  tests: [
    { input: '[2, 3]', expectedOutput: '5' },
    { input: '[-1, 1]', expectedOutput: '0' },
    { input: '[10, 90]', expectedOutput: '100' },
  ],
};

const CODING_PY_EVEN: CuratedCoding = {
  language: CodingLanguage.JS,
  entryFunction: 'countEven',
  starterCode:
    'function countEven(numbers) {\n  // juft sonlar sonini qaytaring\n}\n',
  solutionCode:
    'function countEven(numbers) {\n  return numbers.filter((n) => n % 2 === 0).length;\n}\n',
  tests: [
    { input: '[[1, 2, 3, 4]]', expectedOutput: '2' },
    { input: '[[2, 4, 6]]', expectedOutput: '3' },
    { input: '[[1, 3, 5]]', expectedOutput: '0' },
  ],
};

const CODING_JS_REVERSE: CuratedCoding = {
  language: CodingLanguage.JS,
  entryFunction: 'reverse',
  starterCode:
    'function reverse(str) {\n  // satrni teskari aylantiring\n}\n',
  solutionCode:
    'function reverse(str) {\n  return str.split("").reverse().join("");\n}\n',
  tests: [
    { input: '["salom"]', expectedOutput: '"molas"' },
    { input: '["abc"]', expectedOutput: '"cba"' },
    { input: '["a"]', expectedOutput: '"a"' },
  ],
};

const CODING_JS_SUM_ARR: CuratedCoding = {
  language: CodingLanguage.JS,
  entryFunction: 'sum',
  starterCode:
    'function sum(arr) {\n  // massiv elementlari yig\'indisini qaytaring\n}\n',
  solutionCode:
    'function sum(arr) {\n  return arr.reduce((acc, n) => acc + n, 0);\n}\n',
  tests: [
    { input: '[[1, 2, 3]]', expectedOutput: '6' },
    { input: '[[10, 20]]', expectedOutput: '30' },
    { input: '[[]]', expectedOutput: '0' },
  ],
};

const CODING_TS_UNIQUE: CuratedCoding = {
  language: CodingLanguage.TS,
  entryFunction: 'unique',
  starterCode:
    'function unique(arr: number[]): number[] {\n  // takrorlanmas elementlarni qaytaring\n  return [];\n}\n',
  solutionCode:
    'function unique(arr: number[]): number[] {\n  return [...new Set(arr)];\n}\n',
  tests: [
    { input: '[[1, 1, 2, 3]]', expectedOutput: '[1, 2, 3]' },
    { input: '[[5, 5, 5]]', expectedOutput: '[5]' },
  ],
};

// Reusable real quizzes ----------------------------------------------------------

const QUIZ_WEB_BASICS: CuratedQuizQuestion[] = [
  {
    type: QuizQuestionType.SINGLE,
    text: 'HTML nima uchun ishlatiladi?',
    options: [
      { id: 'a', text: 'Sahifaning tuzilishi va mazmunini belgilash' },
      { id: 'b', text: 'Sahifani bezash (ranglar, shriftlar)' },
      { id: 'c', text: "Server bilan ma'lumot almashish" },
      { id: 'd', text: "Ma'lumotlar bazasini boshqarish" },
    ],
    correctAnswerIds: ['a'],
    explanation:
      "HTML — sahifaning tuzilishi va mazmunini belgilaydi. Bezash CSS, mantiq esa JavaScript zimmasida.",
  },
  {
    type: QuizQuestionType.SINGLE,
    text: 'Quyidagilardan qaysi biri to\'g\'ri CSS sintaksisi?',
    options: [
      { id: 'a', text: 'color: blue;' },
      { id: 'b', text: 'color = blue' },
      { id: 'c', text: '{color: blue}' },
      { id: 'd', text: 'color -> blue' },
    ],
    correctAnswerIds: ['a'],
    explanation: "CSS qoidasi `xususiyat: qiymat;` ko'rinishida yoziladi.",
  },
  {
    type: QuizQuestionType.MULTIPLE,
    text: 'Quyidagilardan qaysilari blok (block) elementlar? (bir nechta javob)',
    options: [
      { id: 'a', text: '<div>' },
      { id: 'b', text: '<span>' },
      { id: 'c', text: '<p>' },
      { id: 'd', text: '<a>' },
    ],
    correctAnswerIds: ['a', 'c'],
    explanation:
      "<div> va <p> — blok elementlar; <span> va <a> — qatoriy (inline) elementlar.",
  },
  {
    type: QuizQuestionType.TEXT,
    text: "Sahifaning eng katta sarlavhasi uchun qaysi HTML tegi ishlatiladi? (faqat teg nomini yozing, masalan: p)",
    options: [],
    correctAnswerIds: ['h1'],
    explanation: '<h1> — sahifadagi eng yuqori darajadagi sarlavha.',
  },
];

const QUIZ_JS_BASICS: CuratedQuizQuestion[] = [
  {
    type: QuizQuestionType.SINGLE,
    text: "JavaScript'da o'zgaruvchi e'lon qilish uchun qaysi kalit so'z qiymati o'zgarmaydigan (constant) o'zgaruvchi yaratadi?",
    options: [
      { id: 'a', text: 'let' },
      { id: 'b', text: 'const' },
      { id: 'c', text: 'var' },
      { id: 'd', text: 'static' },
    ],
    correctAnswerIds: ['b'],
    explanation: "const bilan e'lon qilingan o'zgaruvchiga qayta qiymat berib bo'lmaydi.",
  },
  {
    type: QuizQuestionType.SINGLE,
    text: "typeof [] ifodasi nimani qaytaradi?",
    options: [
      { id: 'a', text: "'array'" },
      { id: 'b', text: "'object'" },
      { id: 'c', text: "'list'" },
      { id: 'd', text: "'undefined'" },
    ],
    correctAnswerIds: ['b'],
    explanation: "JavaScript'da massiv ham obyekt hisoblanadi, shuning uchun typeof 'object' qaytaradi.",
  },
  {
    type: QuizQuestionType.MULTIPLE,
    text: "Quyidagilardan qaysilari massiv metodlari? (bir nechta javob)",
    options: [
      { id: 'a', text: 'map' },
      { id: 'b', text: 'filter' },
      { id: 'c', text: 'toUpperCase' },
      { id: 'd', text: 'reduce' },
    ],
    correctAnswerIds: ['a', 'b', 'd'],
    explanation: "map, filter, reduce — massiv metodlari; toUpperCase — satr metodi.",
  },
  {
    type: QuizQuestionType.TEXT,
    text: "Massiv elementlari sonini qaytaradigan xususiyat nomini yozing.",
    options: [],
    correctAnswerIds: ['length'],
    explanation: 'array.length massivdagi elementlar sonini qaytaradi.',
  },
];

const QUIZ_PYTHON_BASICS: CuratedQuizQuestion[] = [
  {
    type: QuizQuestionType.SINGLE,
    text: "Python'da ro'yxat (list) qanday belgilanadi?",
    options: [
      { id: 'a', text: '{1, 2, 3}' },
      { id: 'b', text: '(1, 2, 3)' },
      { id: 'c', text: '[1, 2, 3]' },
      { id: 'd', text: '<1, 2, 3>' },
    ],
    correctAnswerIds: ['c'],
    explanation: "Kvadrat qavslar [] ro'yxatni belgilaydi; () — kortej, {} — to'plam/lug'at.",
  },
  {
    type: QuizQuestionType.SINGLE,
    text: 'len("salom") nimani qaytaradi?',
    options: [
      { id: 'a', text: '4' },
      { id: 'b', text: '5' },
      { id: 'c', text: '6' },
      { id: 'd', text: 'Xato' },
    ],
    correctAnswerIds: ['b'],
    explanation: '"salom" so\'zida 5 ta harf bor, shuning uchun len 5 qaytaradi.',
  },
  {
    type: QuizQuestionType.MULTIPLE,
    text: "Quyidagilardan qaysilari Python'ning o'zgarmas (immutable) turlari? (bir nechta javob)",
    options: [
      { id: 'a', text: 'tuple' },
      { id: 'b', text: 'list' },
      { id: 'c', text: 'str' },
      { id: 'd', text: 'dict' },
    ],
    correctAnswerIds: ['a', 'c'],
    explanation: "tuple va str o'zgarmas; list va dict esa o'zgaruvchan (mutable).",
  },
];

const QUIZ_SQL_BASICS: CuratedQuizQuestion[] = [
  {
    type: QuizQuestionType.SINGLE,
    text: "Jadvaldan barcha ustunlarni tanlash uchun qaysi so'rov to'g'ri?",
    options: [
      { id: 'a', text: 'SELECT * FROM users;' },
      { id: 'b', text: 'GET ALL users;' },
      { id: 'c', text: 'SELECT ALL users;' },
      { id: 'd', text: 'FETCH users;' },
    ],
    correctAnswerIds: ['a'],
    explanation: 'SELECT * FROM jadval_nomi; — barcha ustunlarni qaytaradi.',
  },
  {
    type: QuizQuestionType.SINGLE,
    text: "Qaysi tugun (clause) natijalarni filtrlash uchun ishlatiladi?",
    options: [
      { id: 'a', text: 'ORDER BY' },
      { id: 'b', text: 'WHERE' },
      { id: 'c', text: 'GROUP BY' },
      { id: 'd', text: 'LIMIT' },
    ],
    correctAnswerIds: ['b'],
    explanation: 'WHERE — shartga ko\'ra qatorlarni filtrlaydi.',
  },
  {
    type: QuizQuestionType.MULTIPLE,
    text: "Quyidagilardan qaysilari JOIN turlari? (bir nechta javob)",
    options: [
      { id: 'a', text: 'INNER JOIN' },
      { id: 'b', text: 'LEFT JOIN' },
      { id: 'c', text: 'MERGE JOIN' },
      { id: 'd', text: 'FULL JOIN' },
    ],
    correctAnswerIds: ['a', 'b', 'd'],
    explanation: "INNER, LEFT va FULL JOIN mavjud; 'MERGE JOIN' standart SQL JOIN turi emas.",
  },
];

const QUIZ_REACT_BASICS: CuratedQuizQuestion[] = [
  {
    type: QuizQuestionType.SINGLE,
    text: "React'da komponent holatini saqlash uchun qaysi hook ishlatiladi?",
    options: [
      { id: 'a', text: 'useEffect' },
      { id: 'b', text: 'useState' },
      { id: 'c', text: 'useContext' },
      { id: 'd', text: 'useRef' },
    ],
    correctAnswerIds: ['b'],
    explanation: 'useState — komponent ichida holat (state) yaratish va yangilash uchun.',
  },
  {
    type: QuizQuestionType.SINGLE,
    text: 'JSX nima?',
    options: [
      { id: 'a', text: "JavaScript ichida HTMLga o'xshash sintaksis" },
      { id: 'b', text: "Yangi dasturlash tili" },
      { id: 'c', text: "Ma'lumotlar bazasi formati" },
      { id: 'd', text: 'CSS kutubxonasi' },
    ],
    correctAnswerIds: ['a'],
    explanation: "JSX — JavaScript ichida UI tasvirlash uchun HTMLga o'xshash sintaksis.",
  },
  {
    type: QuizQuestionType.MULTIPLE,
    text: "Yon ta'sirlar (side effects) bilan ishlash haqida qaysilar to'g'ri? (bir nechta javob)",
    options: [
      { id: 'a', text: "useEffect yon ta'sirlarni boshqaradi" },
      { id: 'b', text: "Bog'liqliklar massivi (dependency array) qachon ishga tushishini belgilaydi" },
      { id: 'c', text: "useEffect faqat bir marta ishlashi shart" },
      { id: 'd', text: "Tozalash (cleanup) funksiyasi qaytarilishi mumkin" },
    ],
    correctAnswerIds: ['a', 'b', 'd'],
    explanation:
      "useEffect bog'liqliklarga qarab qayta ishga tushadi va tozalash funksiyasini qaytarishi mumkin.",
  },
];

// ------------------------------------------------------------------------------
// The 8 curated courses
// ------------------------------------------------------------------------------

export const CURATED_COURSES: CuratedCourse[] = [
  // 1 -------------------------------------------------------------------------
  {
    slug: 'python-noldan',
    title: 'Python noldan: dasturlashga kirish',
    subtitle: "Hech qanday tajribasiz boshlang va Python'da mustaqil dastur yozishni o'rganing",
    description:
      "Bu kurs dasturlashni mutlaqo noldan boshlovchilar uchun. Python tilining asoslari, o'zgaruvchilar, shartlar, takrorlanishlar va funksiyalarni amaliy mashqlar orqali o'rganasiz.",
    longDescription:
      "Python — dunyodagi eng mashhur va o'rganish uchun eng qulay dasturlash tillaridan biri. Ushbu kursda siz noldan boshlab, real misollar va mashqlar orqali Python'ni o'zlashtirasiz.\n\nKurs davomida o'zgaruvchilar, ma'lumot turlari, shartli operatorlar, sikllar, funksiyalar va ro'yxatlar bilan ishlashni o'rganasiz. Har bir mavzu amaliy kod yozish bilan mustahkamlanadi.",
    categorySlug: 'programming',
    instructorIndex: 2,
    level: CourseLevel.BEGINNER,
    language: CourseLanguage.UZ,
    priceUsdCents: 0,
    learningOutcomes: [
      "Python sintaksisini tushunish va kod yozish",
      "O'zgaruvchilar va ma'lumot turlari bilan ishlash",
      "Shart va sikllar yordamida mantiq qurish",
      "Funksiyalar yozish va qayta ishlatish",
      "Oddiy konsol dasturlarini mustaqil yaratish",
    ],
    requirements: [
      "Kompyuter va internet aloqasi",
      "Hech qanday oldingi dasturlash tajribasi talab etilmaydi",
    ],
    sections: [
      {
        title: '1-bo\'lim: Boshlang\'ich tushunchalar',
        lessons: [
          { title: 'Kursga kirish va Python nima?', type: LessonType.VIDEO, durationSeconds: 360, isPreview: true },
          { title: "Python'ni o'rnatish va birinchi dastur", type: LessonType.VIDEO, durationSeconds: 540 },
          {
            title: "Dasturlash nima va nima uchun kerak",
            type: LessonType.ARTICLE,
            durationSeconds: 240,
            article:
              "Dasturlash — kompyuterga aniq ko'rsatmalar berish san'ati. Biz har kuni ishlatadigan ilovalar, saytlar va o'yinlar — barchasi kod orqali yaratilgan.\n\nPython esa o'qish va yozish oson bo'lgani uchun yangi boshlovchilar uchun ideal. Bu bo'limda dasturlashning asosiy g'oyasi bilan tanishamiz.",
          },
        ],
      },
      {
        title: "2-bo'lim: O'zgaruvchilar va ma'lumot turlari",
        lessons: [
          { title: "O'zgaruvchilar va qiymat berish", type: LessonType.VIDEO, durationSeconds: 480 },
          { title: "Sonlar, satrlar va mantiqiy qiymatlar", type: LessonType.VIDEO, durationSeconds: 600 },
          { title: "Ro'yxatlar (list) bilan ishlash", type: LessonType.VIDEO, durationSeconds: 660 },
          {
            title: "Amaliyot: ikkita sonni qo'shish",
            type: LessonType.CODING,
            durationSeconds: 600,
            description: "add(a, b) funksiyasini yozing.",
            coding: CODING_PY_SUM,
          },
        ],
      },
      {
        title: "3-bo'lim: Shartlar, sikllar va funksiyalar",
        lessons: [
          { title: 'if / else shartli operatorlari', type: LessonType.VIDEO, durationSeconds: 540 },
          { title: 'for va while sikllari', type: LessonType.VIDEO, durationSeconds: 720 },
          { title: "Funksiyalar yaratish", type: LessonType.VIDEO, durationSeconds: 600 },
          {
            title: "Amaliyot: juft sonlarni sanash",
            type: LessonType.CODING,
            durationSeconds: 600,
            description: "Ro'yxatdagi juft sonlar sonini qaytaring.",
            coding: CODING_PY_EVEN,
          },
          {
            title: "Bilimingizni sinab ko'ring: Python asoslari",
            type: LessonType.QUIZ,
            durationSeconds: 300,
            quiz: { passingScore: 60, questions: QUIZ_PYTHON_BASICS },
          },
        ],
      },
    ],
  },

  // 2 -------------------------------------------------------------------------
  {
    slug: 'web-html-css',
    title: 'Web dasturlash: HTML va CSS',
    subtitle: "Birinchi veb-saytingizni noldan yarating va internetda joylashtiring",
    description:
      "HTML va CSS — har qanday veb-sayt poydevori. Ushbu kursda siz sahifa tuzilishini qurish, uni bezash va moslashuvchan (responsive) dizayn yaratishni o'rganasiz.",
    longDescription:
      "Veb-dasturlashni HTML va CSS'dan boshlash kerak. HTML sahifa tuzilishini, CSS esa uning ko'rinishini belgilaydi.\n\nBu kursda real loyiha — shaxsiy portfolio sahifasi — ustida ishlaymiz. Flexbox va Grid yordamida moslashuvchan tartiblar yaratishni o'rganasiz.",
    categorySlug: 'programming',
    instructorIndex: 0,
    level: CourseLevel.BEGINNER,
    language: CourseLanguage.UZ,
    priceUsdCents: 0,
    learningOutcomes: [
      "Semantik HTML bilan sahifa tuzilishini qurish",
      "CSS yordamida sahifani bezash",
      "Flexbox va Grid bilan tartib yaratish",
      "Moslashuvchan (responsive) dizayn qilish",
      "Oddiy portfolio saytini noldan yaratish",
    ],
    requirements: ["Kompyuter va brauzer", "Oldingi tajriba shart emas"],
    sections: [
      {
        title: "1-bo'lim: HTML asoslari",
        lessons: [
          { title: 'Web qanday ishlaydi?', type: LessonType.VIDEO, durationSeconds: 420, isPreview: true },
          { title: 'HTML tuzilishi va teglar', type: LessonType.VIDEO, durationSeconds: 540 },
          { title: 'Matn, rasm va havolalar', type: LessonType.VIDEO, durationSeconds: 600 },
          {
            title: 'Semantik HTML nima uchun muhim',
            type: LessonType.ARTICLE,
            durationSeconds: 240,
            article:
              "Semantik teglar (header, nav, main, footer) sahifa mazmuniga ma'no beradi. Bu izlash tizimlari (SEO) va ekran o'quvchilari (accessibility) uchun juda muhim.\n\nMasalan, <div> o'rniga <nav> ishlatish navigatsiya ekanini aniq bildiradi.",
          },
        ],
      },
      {
        title: "2-bo'lim: CSS bilan bezash",
        lessons: [
          { title: "CSS'ga kirish: ranglar va shriftlar", type: LessonType.VIDEO, durationSeconds: 540 },
          { title: 'Box model va masofalar', type: LessonType.VIDEO, durationSeconds: 600 },
          { title: 'Flexbox bilan tartib', type: LessonType.VIDEO, durationSeconds: 720 },
          { title: 'CSS Grid asoslari', type: LessonType.VIDEO, durationSeconds: 660 },
        ],
      },
      {
        title: "3-bo'lim: Moslashuvchan dizayn va yakuniy loyiha",
        lessons: [
          { title: 'Media query va mobil dizayn', type: LessonType.VIDEO, durationSeconds: 600 },
          { title: 'Loyiha: portfolio sahifasi', type: LessonType.VIDEO, durationSeconds: 900 },
          {
            title: "Bilimingizni sinab ko'ring: Web asoslari",
            type: LessonType.QUIZ,
            durationSeconds: 300,
            quiz: { passingScore: 60, questions: QUIZ_WEB_BASICS },
          },
        ],
      },
    ],
  },

  // 3 -------------------------------------------------------------------------
  {
    slug: 'javascript-asoslari',
    title: 'JavaScript asoslari',
    subtitle: "Veb-sahifalarni jonlantiring: JavaScript bilan interaktivlik qo'shing",
    description:
      "JavaScript — brauzerda ishlaydigan yagona dasturlash tili. Bu kursda o'zgaruvchilar, funksiyalar, massivlar, obyektlar va DOM bilan ishlashni o'rganasiz.",
    longDescription:
      "JavaScript veb-sahifalarni interaktiv qiladi: tugmalar, formalar, animatsiyalar — barchasi JS orqali boshqariladi.\n\nKursda til asoslaridan tashqari DOM manipulyatsiyasi va hodisalar (events) bilan ishlashni amaliy misollarda o'rganamiz.",
    categorySlug: 'programming',
    instructorIndex: 0,
    level: CourseLevel.BEGINNER,
    language: CourseLanguage.UZ,
    priceUsdCents: 0,
    learningOutcomes: [
      "JavaScript sintaksisi va o'zgaruvchilar",
      "Funksiyalar va ularning turlari",
      "Massiv va obyektlar bilan ishlash",
      "DOM orqali sahifani boshqarish",
      "Hodisalar (events) bilan interaktivlik qo'shish",
    ],
    requirements: ["HTML va CSS asoslari", "Matn muharriri (VS Code tavsiya etiladi)"],
    sections: [
      {
        title: "1-bo'lim: Til asoslari",
        lessons: [
          { title: 'JavaScript nima va qayerda ishlaydi', type: LessonType.VIDEO, durationSeconds: 420, isPreview: true },
          { title: "O'zgaruvchilar: let, const, var", type: LessonType.VIDEO, durationSeconds: 540 },
          { title: 'Operatorlar va shartlar', type: LessonType.VIDEO, durationSeconds: 600 },
          {
            title: 'Amaliyot: satrni teskari aylantirish',
            type: LessonType.CODING,
            durationSeconds: 600,
            description: 'reverse(str) funksiyasini yozing.',
            coding: CODING_JS_REVERSE,
          },
        ],
      },
      {
        title: "2-bo'lim: Funksiyalar va ma'lumot tuzilmalari",
        lessons: [
          { title: 'Funksiyalar va arrow funksiyalar', type: LessonType.VIDEO, durationSeconds: 660 },
          { title: 'Massivlar va metodlari', type: LessonType.VIDEO, durationSeconds: 720 },
          { title: 'Obyektlar bilan ishlash', type: LessonType.VIDEO, durationSeconds: 600 },
          {
            title: 'Amaliyot: massiv yig\'indisi',
            type: LessonType.CODING,
            durationSeconds: 540,
            description: 'sum(arr) funksiyasini yozing.',
            coding: CODING_JS_SUM_ARR,
          },
        ],
      },
      {
        title: "3-bo'lim: DOM va interaktivlik",
        lessons: [
          { title: 'DOM nima va elementlarni tanlash', type: LessonType.VIDEO, durationSeconds: 600 },
          { title: 'Hodisalar (events) bilan ishlash', type: LessonType.VIDEO, durationSeconds: 660 },
          {
            title: "Bilimingizni sinab ko'ring: JavaScript asoslari",
            type: LessonType.QUIZ,
            durationSeconds: 300,
            quiz: { passingScore: 60, questions: QUIZ_JS_BASICS },
          },
        ],
      },
    ],
  },

  // 4 -------------------------------------------------------------------------
  {
    slug: 'react-frontend',
    title: 'React bilan zamonaviy frontend',
    subtitle: "Komponentlar asosida tezkor va interaktiv interfeyslar yarating",
    description:
      "React — frontend dunyosidagi eng mashhur kutubxona. Bu kursda komponentlar, props, state, hooks va API bilan ishlashni amaliy loyihada o'rganasiz.",
    longDescription:
      "React yordamida murakkab foydalanuvchi interfeyslarini qayta ishlatiluvchi komponentlardan yig'asiz.\n\nKurs davomida useState, useEffect kabi hook'lar, props orqali ma'lumot uzatish va tashqi API bilan ishlashni o'rganib, yakunda real ilova quramiz.",
    categorySlug: 'programming',
    instructorIndex: 0,
    level: CourseLevel.INTERMEDIATE,
    language: CourseLanguage.UZ,
    priceUsdCents: USD(49.99),
    discountUsdCents: USD(24.99),
    learningOutcomes: [
      "Komponentlar va JSX bilan ishlash",
      "props orqali ma'lumot uzatish",
      "useState va useEffect hook'larini ishlatish",
      "Tashqi API'dan ma'lumot olish",
      "To'liq bir sahifali ilova (SPA) yaratish",
    ],
    requirements: ["JavaScript asoslari (massiv, obyekt, funksiya)", "Node.js o'rnatilgan bo'lishi"],
    sections: [
      {
        title: "1-bo'lim: React asoslari",
        lessons: [
          { title: 'React nima va nega kerak', type: LessonType.VIDEO, durationSeconds: 480, isPreview: true },
          { title: 'Birinchi komponent va JSX', type: LessonType.VIDEO, durationSeconds: 600 },
          { title: 'props bilan ishlash', type: LessonType.VIDEO, durationSeconds: 540 },
          {
            title: 'Amaliyot: takrorlanmas elementlar',
            type: LessonType.CODING,
            durationSeconds: 600,
            description: 'unique(arr) funksiyasini yozing.',
            coding: CODING_TS_UNIQUE,
          },
        ],
      },
      {
        title: "2-bo'lim: State va hooks",
        lessons: [
          { title: 'useState bilan holat boshqaruvi', type: LessonType.VIDEO, durationSeconds: 660 },
          { title: 'useEffect va yon ta\'sirlar', type: LessonType.VIDEO, durationSeconds: 720 },
          { title: 'Formalar bilan ishlash', type: LessonType.VIDEO, durationSeconds: 600 },
        ],
      },
      {
        title: "3-bo'lim: API va yakuniy loyiha",
        lessons: [
          { title: "fetch bilan API'dan ma'lumot olish", type: LessonType.VIDEO, durationSeconds: 720 },
          { title: 'Loyiha: ob-havo ilovasi', type: LessonType.VIDEO, durationSeconds: 900 },
          {
            title: "Bilimingizni sinab ko'ring: React asoslari",
            type: LessonType.QUIZ,
            durationSeconds: 300,
            quiz: { passingScore: 60, questions: QUIZ_REACT_BASICS },
          },
        ],
      },
    ],
  },

  // 5 -------------------------------------------------------------------------
  {
    slug: 'nodejs-backend',
    title: 'Node.js bilan backend dasturlash',
    subtitle: "Server, API va ma'lumotlar bazasi bilan ishlovchi to'liq backend quring",
    description:
      "Node.js yordamida server tomonidagi dasturlashni o'rganing. Express bilan REST API yaratish, autentifikatsiya va ma'lumotlar bazasi bilan ishlashni o'zlashtiring.",
    longDescription:
      "Backend — ilovaning ko'rinmas, lekin eng muhim qismi. Node.js JavaScript'ni serverda ishlatish imkonini beradi.\n\nKursda Express framework'i bilan REST API quramiz, JWT orqali autentifikatsiya qo'shamiz va ma'lumotlar bazasi bilan bog'lanamiz.",
    categorySlug: 'programming',
    instructorIndex: 1,
    level: CourseLevel.INTERMEDIATE,
    language: CourseLanguage.UZ,
    priceUsdCents: USD(59.99),
    discountUsdCents: null,
    learningOutcomes: [
      "Node.js va npm bilan ishlash",
      "Express yordamida REST API yaratish",
      "Marshrutlar (routes) va middleware tushunchasi",
      "JWT bilan autentifikatsiya",
      "Ma'lumotlar bazasiga ulanish va CRUD amallari",
    ],
    requirements: ["JavaScript asoslari", "HTTP haqida umumiy tushuncha"],
    sections: [
      {
        title: "1-bo'lim: Node.js asoslari",
        lessons: [
          { title: 'Node.js nima va event loop', type: LessonType.VIDEO, durationSeconds: 540, isPreview: true },
          { title: 'npm va paketlar', type: LessonType.VIDEO, durationSeconds: 480 },
          { title: 'Modullar va fayllar bilan ishlash', type: LessonType.VIDEO, durationSeconds: 600 },
        ],
      },
      {
        title: "2-bo'lim: Express bilan API",
        lessons: [
          { title: 'Birinchi Express serveri', type: LessonType.VIDEO, durationSeconds: 660 },
          { title: 'Marshrutlar va HTTP metodlari', type: LessonType.VIDEO, durationSeconds: 720 },
          { title: 'Middleware tushunchasi', type: LessonType.VIDEO, durationSeconds: 600 },
          {
            title: 'REST API dizayn tamoyillari',
            type: LessonType.ARTICLE,
            durationSeconds: 300,
            article:
              "REST — API qurishning keng tarqalgan uslubi. Resurslar URL orqali ifodalanadi (masalan, /users), amallar esa HTTP metodlari bilan: GET (o'qish), POST (yaratish), PUT/PATCH (yangilash), DELETE (o'chirish).\n\nYaxshi API izchil, oldindan bashorat qilinadigan va to'g'ri holat kodlarini qaytaradigan bo'lishi kerak.",
          },
        ],
      },
      {
        title: "3-bo'lim: Autentifikatsiya va ma'lumotlar bazasi",
        lessons: [
          { title: 'JWT bilan autentifikatsiya', type: LessonType.VIDEO, durationSeconds: 780 },
          { title: "Ma'lumotlar bazasiga ulanish", type: LessonType.VIDEO, durationSeconds: 720 },
          { title: 'Loyiha: vazifalar API', type: LessonType.VIDEO, durationSeconds: 900 },
        ],
      },
    ],
  },

  // 6 -------------------------------------------------------------------------
  {
    slug: 'sql-malumotlar-bazasi',
    title: "SQL va ma'lumotlar bazasi asoslari",
    subtitle: "Ma'lumotlarni saqlash, so'rash va boshqarishni noldan o'rganing",
    description:
      "Har bir jiddiy ilova ma'lumotlar bazasiga tayanadi. Bu kursda SQL tili, jadvallar, so'rovlar, JOIN va agregat funksiyalarni amaliy mashqlarda o'rganasiz.",
    longDescription:
      "SQL — ma'lumotlar bazasi bilan muloqot tili. U deyarli barcha texnologiyalarda ishlatiladi.\n\nKursda jadval yaratish, ma'lumot qo'shish, filtrlash, saralash va bir nechta jadvalni JOIN orqali birlashtirishni o'rganamiz.",
    categorySlug: 'programming',
    instructorIndex: 1,
    level: CourseLevel.BEGINNER,
    language: CourseLanguage.UZ,
    priceUsdCents: USD(39.99),
    discountUsdCents: USD(19.99),
    learningOutcomes: [
      "Ma'lumotlar bazasi va jadval tushunchasi",
      "SELECT, INSERT, UPDATE, DELETE so'rovlari",
      "WHERE, ORDER BY, LIMIT bilan filtrlash",
      "JOIN yordamida jadvallarni birlashtirish",
      "Agregat funksiyalar (COUNT, SUM, AVG)",
    ],
    requirements: ["Kompyuter", "Oldingi tajriba shart emas"],
    sections: [
      {
        title: "1-bo'lim: Asoslar",
        lessons: [
          { title: "Ma'lumotlar bazasi nima?", type: LessonType.VIDEO, durationSeconds: 420, isPreview: true },
          { title: 'Jadvallar va ustunlar', type: LessonType.VIDEO, durationSeconds: 540 },
          { title: "SELECT bilan ma'lumot o'qish", type: LessonType.VIDEO, durationSeconds: 600 },
        ],
      },
      {
        title: "2-bo'lim: Filtrlash va o'zgartirish",
        lessons: [
          { title: 'WHERE bilan filtrlash', type: LessonType.VIDEO, durationSeconds: 600 },
          { title: 'ORDER BY va LIMIT', type: LessonType.VIDEO, durationSeconds: 480 },
          { title: "INSERT, UPDATE, DELETE", type: LessonType.VIDEO, durationSeconds: 660 },
        ],
      },
      {
        title: "3-bo'lim: JOIN va agregatlar",
        lessons: [
          { title: 'JOIN turlari', type: LessonType.VIDEO, durationSeconds: 720 },
          { title: 'GROUP BY va agregat funksiyalar', type: LessonType.VIDEO, durationSeconds: 660 },
          {
            title: "Bilimingizni sinab ko'ring: SQL asoslari",
            type: LessonType.QUIZ,
            durationSeconds: 300,
            quiz: { passingScore: 60, questions: QUIZ_SQL_BASICS },
          },
        ],
      },
    ],
  },

  // 7 -------------------------------------------------------------------------
  {
    slug: 'python-malumotlar-tahlili',
    title: "Python bilan ma'lumotlar tahlili",
    subtitle: "Pandas va vizualizatsiya bilan ma'lumotlardan ma'no chiqaring",
    description:
      "Ma'lumotlar tahlili — bugungi eng talabgir ko'nikmalardan biri. Bu kursda Python, NumPy va Pandas yordamida real ma'lumotlar to'plamlarini tahlil qilishni o'rganasiz.",
    longDescription:
      "Ma'lumotlar har joyda — lekin ulardan ma'no chiqarish alohida mahorat talab qiladi.\n\nKursda Pandas bilan ma'lumotlarni yuklash, tozalash va tahlil qilishni, hamda Matplotlib bilan grafiklar chizishni o'rganamiz. Yakunda real CSV to'plamini tahlil qilamiz.",
    categorySlug: 'data-science',
    instructorIndex: 2,
    level: CourseLevel.INTERMEDIATE,
    language: CourseLanguage.UZ,
    priceUsdCents: USD(54.99),
    discountUsdCents: USD(29.99),
    learningOutcomes: [
      "NumPy massivlari bilan ishlash",
      "Pandas DataFrame'ni yuklash va tozalash",
      "Ma'lumotlarni filtrlash va guruhlash",
      "Matplotlib bilan vizualizatsiya",
      "Real ma'lumotlar to'plamini tahlil qilish",
    ],
    requirements: ["Python asoslari (o'zgaruvchi, sikl, funksiya)"],
    sections: [
      {
        title: "1-bo'lim: NumPy bilan boshlash",
        lessons: [
          { title: "Ma'lumotlar tahliliga kirish", type: LessonType.VIDEO, durationSeconds: 420, isPreview: true },
          { title: 'NumPy massivlari', type: LessonType.VIDEO, durationSeconds: 600 },
          { title: 'Massivlar ustida amallar', type: LessonType.VIDEO, durationSeconds: 660 },
        ],
      },
      {
        title: "2-bo'lim: Pandas",
        lessons: [
          { title: 'DataFrame va Series', type: LessonType.VIDEO, durationSeconds: 720 },
          { title: "Ma'lumotlarni filtrlash va saralash", type: LessonType.VIDEO, durationSeconds: 660 },
          { title: 'groupby bilan guruhlash', type: LessonType.VIDEO, durationSeconds: 600 },
          {
            title: "Ma'lumotlarni tozalash nima uchun muhim",
            type: LessonType.ARTICLE,
            durationSeconds: 300,
            article:
              "Real ma'lumotlar deyarli har doim 'iflos' bo'ladi: bo'sh qiymatlar, takrorlar, noto'g'ri formatlar. Tahlildan oldin ularni tozalash natijaning to'g'riligini ta'minlaydi.\n\nPandas'da dropna(), fillna() va drop_duplicates() kabi metodlar shu maqsadda ishlatiladi.",
          },
        ],
      },
      {
        title: "3-bo'lim: Vizualizatsiya va loyiha",
        lessons: [
          { title: 'Matplotlib bilan grafiklar', type: LessonType.VIDEO, durationSeconds: 720 },
          { title: 'Loyiha: savdo ma\'lumotlarini tahlil qilish', type: LessonType.VIDEO, durationSeconds: 900 },
        ],
      },
    ],
  },

  // 8 -------------------------------------------------------------------------
  {
    slug: 'figma-ui-ux-dizayn',
    title: "Figma'da UI/UX dizayn",
    subtitle: "G'oyadan tayyor interfeysgacha: zamonaviy dizayn jarayonini o'rganing",
    description:
      "Figma — dizaynerlar uchun eng mashhur vosita. Bu kursda UI/UX asoslari, Figma interfeysi, komponentlar va prototip yaratishni amaliy loyihada o'rganasiz.",
    longDescription:
      "Yaxshi dizayn — bu nafaqat chiroyli, balki qulay interfeys.\n\nKursda UX tamoyillari, rang va tipografika, Figma'da maketlar yaratish, qayta ishlatiluvchi komponentlar va interaktiv prototip qurishni o'rganamiz. Yakunda mobil ilova dizaynini tayyorlaymiz.",
    categorySlug: 'design',
    instructorIndex: 3,
    level: CourseLevel.BEGINNER,
    language: CourseLanguage.UZ,
    priceUsdCents: USD(44.99),
    discountUsdCents: null,
    learningOutcomes: [
      "UI va UX o'rtasidagi farqni tushunish",
      "Figma interfeysida erkin ishlash",
      "Rang, tipografika va tartib tamoyillari",
      "Qayta ishlatiluvchi komponentlar yaratish",
      "Interaktiv prototip qurish",
    ],
    requirements: ["Figma akkaunti (bepul)", "Dizayn tajribasi shart emas"],
    sections: [
      {
        title: "1-bo'lim: UI/UX asoslari",
        lessons: [
          { title: 'UI va UX nima?', type: LessonType.VIDEO, durationSeconds: 420, isPreview: true },
          {
            title: 'Yaxshi dizaynning tamoyillari',
            type: LessonType.ARTICLE,
            durationSeconds: 300,
            article:
              "Yaxshi interfeys foydalanuvchini o'ylantirmaydi. Asosiy tamoyillar: izchillik, aniq ierarxiya, yetarli bo'sh joy (whitespace) va kontrast.\n\nDizayn — bu go'zallik emas, balki muammoni hal qilish. Har bir element maqsadga xizmat qilishi kerak.",
          },
          { title: 'Figma bilan tanishuv', type: LessonType.VIDEO, durationSeconds: 540 },
        ],
      },
      {
        title: "2-bo'lim: Figma'da ishlash",
        lessons: [
          { title: 'Frame, shakl va matn', type: LessonType.VIDEO, durationSeconds: 600 },
          { title: 'Rang va tipografika', type: LessonType.VIDEO, durationSeconds: 540 },
          { title: 'Auto Layout', type: LessonType.VIDEO, durationSeconds: 660 },
          { title: 'Komponentlar va variantlar', type: LessonType.VIDEO, durationSeconds: 720 },
        ],
      },
      {
        title: "3-bo'lim: Prototip va loyiha",
        lessons: [
          { title: 'Interaktiv prototip yaratish', type: LessonType.VIDEO, durationSeconds: 660 },
          { title: 'Loyiha: mobil ilova dizayni', type: LessonType.VIDEO, durationSeconds: 900 },
        ],
      },
    ],
  },
];
