import { faker } from '@faker-js/faker';
import {
  BlogPostStatus,
  CourseStatus,
  LessonType,
  MuxAssetStatus,
  MuxPlaybackPolicy,
  NotificationType,
  OrderStatus,
  PaymentProvider,
  PaymentStatus,
  Prisma,
  PrismaClient,
  UserRole,
  WishlistKind,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { CURATED_COURSES, CURATED_INSTRUCTORS } from './curated-courses';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@ilmhub.uz';
const ADMIN_PASSWORD = 'Admin123!';
const STUDENT_PASSWORD = 'Student123!';
const INSTRUCTOR_PASSWORD = 'Instructor123!';

const CATEGORIES = [
  { slug: 'programming', name: 'Programming', description: 'Software development & engineering', iconName: 'Code' },
  { slug: 'design', name: 'Design', description: 'UI/UX, graphic, product design', iconName: 'Palette' },
  { slug: 'marketing', name: 'Marketing', description: 'Digital marketing & growth', iconName: 'Megaphone' },
  { slug: 'business', name: 'Business', description: 'Entrepreneurship & management', iconName: 'Briefcase' },
  { slug: 'data-science', name: 'Data Science', description: 'ML, analytics, statistics', iconName: 'BarChart3' },
  { slug: 'languages', name: 'Languages', description: 'Foreign languages & linguistics', iconName: 'Languages' },
  { slug: 'photography', name: 'Photography', description: 'Photo & video production', iconName: 'Camera' },
  { slug: 'music', name: 'Music', description: 'Music production & theory', iconName: 'Music' },
];

const ACHIEVEMENTS = [
  { code: 'FIRST_ENROLLMENT', title: 'First steps', description: 'Enrolled in your first course', iconName: 'Footprints' },
  { code: 'FIRST_COMPLETION', title: 'Finisher', description: 'Completed your first course', iconName: 'CheckCircle2' },
  { code: 'FIRST_REVIEW', title: 'Critic', description: 'Wrote your first review', iconName: 'Star' },
  { code: 'FIVE_COURSES', title: 'Scholar', description: 'Enrolled in five courses', iconName: 'GraduationCap' },
  { code: 'STREAK_7', title: 'Week warrior', description: '7-day learning streak', iconName: 'Flame' },
  { code: 'STREAK_30', title: 'Month master', description: '30-day learning streak', iconName: 'Trophy' },
  { code: 'QUIZ_MASTER', title: 'Quiz master', description: 'Passed 10 quizzes', iconName: 'BrainCog' },
  { code: 'CODE_NINJA', title: 'Code ninja', description: 'Solved 25 coding exercises', iconName: 'Terminal' },
  { code: 'EARLY_BIRD', title: 'Early bird', description: 'Joined IlmHub in its first month', iconName: 'Sunrise' },
  { code: 'SOCIAL_LEARNER', title: 'Social learner', description: 'Posted 5 Q&A answers', iconName: 'Users' },
];

const dicebear = (seed: string) =>
  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&fontWeight=600`;

// Default home-page CMS content (mirrors the frontend fallbacks so the page is
// identical whether or not the rows exist).
const HOME_HERO = {
  title: "Kelajak kasbingizni bugun o'rganing",
  subtitle:
    "Eng yaxshi ustozlardan onlayn kurslar. O'zingiz uchun mos sur'atda o'rganing, real loyihalar ustida ishlang va sertifikat oling.",
  primaryCtaLabel: "Kurslarni ko'rish",
  primaryCtaHref: '/courses',
  secondaryCtaLabel: 'Bepul boshlash',
  secondaryCtaHref: '/register',
};

const HOME_STATS = [
  { value: 10000, suffix: '+', label: 'talaba' },
  { value: 200, suffix: '+', label: 'kurs' },
  { value: 50, suffix: '+', label: 'ustoz' },
  { value: 95, suffix: '%', label: 'tugatish darajasi' },
];

const TESTIMONIALS = [
  { studentName: 'Bahodir Ergashev', studentRole: 'Frontend Developer', courseName: 'React bilan zamonaviy frontend', rating: 5, text: "Kursdan keyin birinchi ish o'rnimni topdim. Aziz aka materiallarni shu qadar tushunarli yetkazib beradiki — har bir mavzu o'rniga tushadi." },
  { studentName: 'Madina Olimova', studentRole: 'UI/UX dizayner', courseName: "Figma'da UI/UX dizayn", rating: 5, text: "Hech qachon dizayn qilmagan edim. Endi esa portfolio bilan junior pozitsiyalarga taklif olyapman. Amaliyotlar real loyihalarga juda yaqin." },
  { studentName: 'Sardor Yusupov', studentRole: 'Backend Engineer', courseName: 'Node.js bilan backend dasturlash', rating: 5, text: "Microservices arxitekturasini real kod orqali tushuntirib berildi. Ish joyimda menga ishonib katta loyihani topshirishdi." },
  { studentName: 'Zarina Tursunova', studentRole: 'Data Analyst', courseName: "Python bilan ma'lumotlar tahlili", rating: 5, text: "Marketing sohasidan keldim, raqamlardan qo'rqardim. Hozir biznes savollariga Python bilan javob qaytaraman — bu sezilarli farq." },
  { studentName: 'Otabek Soliyev', studentRole: 'Junior Developer', courseName: 'JavaScript asoslari', rating: 4, text: "Dasturlash dunyosiga kirish uchun ajoyib boshlanish. Birinchi interaktiv sahifamni o'zim yozdim." },
  { studentName: 'Nargiza Komilova', studentRole: 'Full-stack Developer', courseName: "Node.js bilan backend dasturlash", rating: 5, text: "Backend dastlab qiyin tuyulgan, lekin kurs oxirida o'zim production API tuzdim. O'qituvchining qo'llab-quvvatlashi juda qadrli." },
];

const FAQS = [
  { question: "Qanday qilib ro'yxatdan o'tish mumkin?", answer: "Yuqori o'ng burchakdagi \"Ro'yxatdan o'tish\" tugmasini bosing va email yoki telefon raqamingizni kiriting. Bir necha daqiqada akkaunt tayyor bo'ladi." },
  { question: "Kurslar uchun qanday to'lov usullari mavjud?", answer: "Click, Payme, UzCard va Humo orqali to'lashingiz mumkin. Xalqaro talabalar uchun bank kartalari ham qabul qilinadi." },
  { question: 'Kursni tugatgach sertifikat olamanmi?', answer: "Ha, har bir kursni 80%+ natija bilan tugatganingizdan so'ng raqamli sertifikat avtomatik tarzda profilingizga qo'shiladi." },
  { question: 'Kursni qaytarish mumkinmi?', answer: "Sotib olgandan keyin 14 kun ichida 30%dan kam materialni tugatgan bo'lsangiz, to'liq qaytarib olish mumkin." },
  { question: "Ustoz bilan bevosita aloqada bo'lish mumkinmi?", answer: "Har bir kursda Q&A bo'limi va belgilangan vaqtlarda jonli sessiyalar mavjud. Pro tarif ustoz bilan shaxsiy maslahatni o'z ichiga oladi." },
  { question: 'Materialga qachongacha kirish saqlanadi?', answer: "Sotib olingan kurslarga umrbod kirish huquqi beriladi. Yangilangan dars va materiallar avtomatik tarzda qo'shiladi." },
  { question: "Telefonimda dars ko'rishim mumkinmi?", answer: "Ha, IlmHub to'liq moslashuvchan: brauzerda istalgan qurilmadan ochiladi. Mobil ilovalar 2026-yil oxirida chiqadi." },
  { question: "O'zim kurs yaratishim mumkinmi?", answer: '"Ustoz bo\'lish" sahifasidan ariza yuboring. Tasdiqlangan ustozlar IlmHub Studio orqali kurslar yaratib, daromad olishlari mumkin.' },
];

// Public Mux test playback IDs from the Mux docs / sample assets — safe to use in dev seeds.
// All policy=PUBLIC so the player can stream without a signed token. These are
// placeholders until instructors upload their own videos via the wizard (see docs/PLAN.md).
const MUX_TEST_PLAYBACK_IDS = [
  'qxb01i6T202018GFS02vp9RIe01icTcDCjVzQpmaB00CUisJ4',
  'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
  'mIagrYZyQRFM9p4Z5OUm14AHiVdvtCDH',
  'a4nOgmxGWg6gULfcBbAa00gXyfcwPnAFldd8mbnRQl4E',
  'VcmKA6aqzIzlg3MayLJDnbF55kX00mds028Z65QAY63ZQ',
];
const PAYMENT_PROVIDERS: PaymentProvider[] = ['PAYME', 'CLICK', 'UZUM'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  return faker.helpers.arrayElements(arr, n);
}

function uniqueSlug(base: string, idx: number): string {
  return `${faker.helpers.slugify(base).toLowerCase()}-${idx}`;
}

async function clearAll(): Promise<void> {
  console.log('🧹 Clearing existing data...');
  // children → parents
  await prisma.setting.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.instructorApplication.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.review.deleteMany();
  await prisma.note.deleteMany();
  await prisma.lessonProgress.deleteMany();
  // Detach enrollment.certificateId before deleting certificates
  await prisma.enrollment.updateMany({ data: { certificateId: null } });
  await prisma.certificate.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.codingSubmission.deleteMany();
  await prisma.codingExercise.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.emailChangeToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

async function seedUsers() {
  console.log('👤 Seeding users...');
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const instructorHash = await bcrypt.hash(INSTRUCTOR_PASSWORD, 10);
  const studentHash = await bcrypt.hash(STUDENT_PASSWORD, 10);

  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      name: 'IlmHub Admin',
      role: UserRole.ADMIN,
      bio: 'Platform administrator',
      avatarUrl: faker.image.avatarGitHub(),
      emailVerified: true,
    },
  });

  // Named instructors from the curated catalogue (curated-courses.ts). Course
  // definitions reference these by index, so the order here must match.
  const instructors = [];
  for (const def of CURATED_INSTRUCTORS) {
    instructors.push(
      await prisma.user.create({
        data: {
          email: def.email,
          passwordHash: instructorHash,
          name: def.name,
          role: UserRole.INSTRUCTOR,
          bio: def.bio,
          avatarUrl: dicebear(def.name),
          emailVerified: true,
        },
      })
    );
  }

  const students = [];
  for (let i = 0; i < 50; i++) {
    students.push(
      await prisma.user.create({
        data: {
          email: `student${i + 1}@ilmhub.uz`,
          passwordHash: studentHash,
          name: faker.person.fullName(),
          role: UserRole.STUDENT,
          bio: i % 3 === 0 ? faker.lorem.sentence() : null,
          avatarUrl: faker.image.avatarGitHub(),
          emailVerified: i % 5 !== 0,
        },
      })
    );
  }

  return { admin, instructors, students };
}

async function seedCategories() {
  console.log('🗂  Seeding categories...');
  const created = [];
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    created.push(
      await prisma.category.create({
        data: { ...c, sortOrder: i },
      })
    );
  }
  return created;
}

async function seedBlogCategories() {
  console.log('📰 Seeding blog categories...');
  const items = [
    { slug: 'news', name: 'News', description: 'Platform updates' },
    { slug: 'tutorials', name: 'Tutorials', description: 'Step-by-step guides' },
    { slug: 'career', name: 'Career', description: 'Career advice for learners' },
    { slug: 'announcements', name: 'Announcements', description: 'Official announcements' },
  ];
  const out = [];
  for (let i = 0; i < items.length; i++) {
    out.push(await prisma.blogCategory.create({ data: { ...items[i], sortOrder: i } }));
  }
  return out;
}

async function seedAchievements() {
  console.log('🏆 Seeding achievements...');
  const out = [];
  for (const a of ACHIEVEMENTS) {
    out.push(await prisma.achievement.create({ data: a }));
  }
  return out;
}

async function seedSettings() {
  console.log('⚙️  Seeding platform settings...');
  const entries: { key: string; value: unknown }[] = [
    { key: 'commission_rate', value: 0.1 },
    { key: 'maintenance_mode', value: false },
    { key: 'email_sender', value: { name: 'IlmHub', address: 'no-reply@ilmhub.uz' } },
    { key: 'home_hero', value: HOME_HERO },
    { key: 'home_stats', value: HOME_STATS },
  ];
  for (const e of entries) {
    await prisma.setting.create({
      data: { key: e.key, value: e.value as object },
    });
  }
}

async function seedTestimonials() {
  console.log('💬 Seeding testimonials...');
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    const t = TESTIMONIALS[i];
    await prisma.testimonial.create({
      data: {
        studentName: t.studentName,
        studentAvatar: dicebear(t.studentName),
        studentRole: t.studentRole,
        courseName: t.courseName,
        rating: t.rating,
        text: t.text,
        sortOrder: i,
      },
    });
  }
}

async function seedFaqs() {
  console.log('❓ Seeding FAQ...');
  for (let i = 0; i < FAQS.length; i++) {
    await prisma.faq.create({ data: { ...FAQS[i], sortOrder: i } });
  }
}

type SeededCourse = {
  id: string;
  slug: string;
  title: string;
  lessonIds: string[];
  videoLessonIds: string[];
  quizLessonIds: string[];
  codingLessonIds: string[];
  priceUsdCents: number;
};

async function seedCuratedCourses(
  instructors: { id: string }[],
  categories: { id: string; slug: string }[]
): Promise<SeededCourse[]> {
  console.log(`📚 Seeding ${CURATED_COURSES.length} curated courses with sections/lessons...`);
  const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  const seeded: SeededCourse[] = [];
  let videoCounter = 0;

  for (const def of CURATED_COURSES) {
    const categoryId = catBySlug.get(def.categorySlug);
    if (!categoryId) {
      throw new Error(`Curated course "${def.slug}" references unknown category "${def.categorySlug}"`);
    }
    const instructor = instructors[def.instructorIndex];
    if (!instructor) {
      throw new Error(`Curated course "${def.slug}" references unknown instructor index ${def.instructorIndex}`);
    }

    const course = await prisma.course.create({
      data: {
        slug: def.slug,
        title: def.title,
        subtitle: def.subtitle,
        description: def.description,
        longDescription: def.longDescription,
        thumbnailUrl: `https://picsum.photos/seed/${def.slug}/800/450`,
        previewVideoUrl: null,
        instructorId: instructor.id,
        categoryId,
        level: def.level,
        language: def.language,
        priceUsdCents: def.priceUsdCents,
        discountUsdCents: def.discountUsdCents ?? null,
        status: CourseStatus.PUBLISHED,
        learningOutcomes: def.learningOutcomes,
        requirements: def.requirements,
        publishedAt: faker.date.past({ years: 1 }),
      },
    });

    let totalLessons = 0;
    let totalDurationSec = 0;
    const lessonIds: string[] = [];
    const videoLessonIds: string[] = [];
    const quizLessonIds: string[] = [];
    const codingLessonIds: string[] = [];

    for (let si = 0; si < def.sections.length; si++) {
      const s = def.sections[si];
      const section = await prisma.section.create({
        data: { courseId: course.id, title: s.title, order: si },
      });

      let sectionDurationSec = 0;
      for (let li = 0; li < s.lessons.length; li++) {
        const l = s.lessons[li];
        const isVideo = l.type === LessonType.VIDEO;
        const muxPlaybackId = isVideo
          ? MUX_TEST_PLAYBACK_IDS[videoCounter++ % MUX_TEST_PLAYBACK_IDS.length]
          : null;

        const lesson = await prisma.lesson.create({
          data: {
            sectionId: section.id,
            title: l.title,
            description: l.description ?? null,
            order: li,
            type: l.type,
            videoAssetId: isVideo ? `mux_demo_${videoCounter}` : null,
            muxPlaybackId,
            muxPlaybackPolicy: MuxPlaybackPolicy.PUBLIC,
            muxAssetStatus: isVideo ? MuxAssetStatus.READY : MuxAssetStatus.NONE,
            articleContent: l.type === LessonType.ARTICLE ? l.article ?? null : null,
            durationSeconds: l.durationSeconds,
            isPreview: l.isPreview ?? false,
            resources: (l.resources ?? []) as Prisma.InputJsonValue,
          },
        });
        lessonIds.push(lesson.id);
        sectionDurationSec += l.durationSeconds;

        if (l.type === LessonType.VIDEO) videoLessonIds.push(lesson.id);

        if (l.type === LessonType.QUIZ && l.quiz) {
          quizLessonIds.push(lesson.id);
          const quiz = await prisma.quiz.create({
            data: {
              lessonId: lesson.id,
              passingScore: l.quiz.passingScore ?? 70,
              attemptsAllowed: 3,
            },
          });
          for (let qi = 0; qi < l.quiz.questions.length; qi++) {
            const q = l.quiz.questions[qi];
            await prisma.quizQuestion.create({
              data: {
                quizId: quiz.id,
                type: q.type,
                text: q.text,
                options: q.options as Prisma.InputJsonValue,
                correctAnswerIds: q.correctAnswerIds,
                explanation: q.explanation,
                order: qi,
              },
            });
          }
        }

        if (l.type === LessonType.CODING && l.coding) {
          codingLessonIds.push(lesson.id);
          await prisma.codingExercise.create({
            data: {
              lessonId: lesson.id,
              language: l.coding.language,
              entryFunction: l.coding.entryFunction,
              starterCode: l.coding.starterCode,
              solutionCode: l.coding.solutionCode,
              tests: l.coding.tests as Prisma.InputJsonValue,
            },
          });
        }
      }

      totalLessons += s.lessons.length;
      totalDurationSec += sectionDurationSec;
      await prisma.section.update({
        where: { id: section.id },
        data: {
          lessonsCount: s.lessons.length,
          durationMinutes: Math.floor(sectionDurationSec / 60),
        },
      });
    }

    await prisma.course.update({
      where: { id: course.id },
      data: {
        lessonsCount: totalLessons,
        durationMinutes: Math.floor(totalDurationSec / 60),
      },
    });

    seeded.push({
      id: course.id,
      slug: def.slug,
      title: def.title,
      lessonIds,
      videoLessonIds,
      quizLessonIds,
      codingLessonIds,
      priceUsdCents: def.priceUsdCents,
    });
  }

  for (const cat of categories) {
    const count = await prisma.course.count({ where: { categoryId: cat.id } });
    await prisma.category.update({ where: { id: cat.id }, data: { coursesCount: count } });
  }

  return seeded;
}

async function seedEnrollments(
  students: { id: string }[],
  courses: SeededCourse[]
): Promise<{ userId: string; courseId: string }[]> {
  console.log('🎟  Seeding 100 enrollments with progress...');
  const seen = new Set<string>();
  const enrollments: { userId: string; courseId: string }[] = [];

  while (enrollments.length < 100) {
    const student = pick(students);
    const course = pick(courses);
    const key = `${student.id}:${course.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    enrollments.push({ userId: student.id, courseId: course.id });
  }

  for (const e of enrollments) {
    const course = courses.find((c) => c.id === e.courseId)!;
    const completed = Math.random() < 0.3;
    const enrolledAt = faker.date.past({ years: 1 });
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: e.userId,
        courseId: e.courseId,
        enrolledAt,
        completedAt: completed ? faker.date.between({ from: enrolledAt, to: new Date() }) : null,
      },
    });

    const progressRatio = completed ? 1 : faker.number.float({ min: 0.1, max: 0.8 });
    const lessonsToProgress = Math.max(1, Math.floor(course.lessonIds.length * progressRatio));
    const targetLessons = course.lessonIds.slice(0, lessonsToProgress);
    for (const lessonId of targetLessons) {
      const completedLesson = completed || Math.random() < 0.7;
      await prisma.lessonProgress.create({
        data: {
          userId: e.userId,
          lessonId,
          completedAt: completedLesson ? faker.date.between({ from: enrolledAt, to: new Date() }) : null,
          lastPositionSeconds: faker.number.int({ min: 0, max: 1200 }),
        },
      });
    }

    if (completed) {
      const cert = await prisma.certificate.create({
        data: {
          userId: e.userId,
          courseId: e.courseId,
          certificateNumber: `ILM-${faker.string.alphanumeric({ length: 10, casing: 'upper' })}`,
          pdfUrl: faker.internet.url(),
        },
      });
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { certificateId: cert.id },
      });
    }
  }

  // Update course.studentsCount
  for (const course of courses) {
    const count = await prisma.enrollment.count({ where: { courseId: course.id } });
    await prisma.course.update({ where: { id: course.id }, data: { studentsCount: count } });
  }

  return enrollments;
}

async function seedReviews(
  students: { id: string }[],
  courses: SeededCourse[]
) {
  console.log('⭐ Seeding 200 reviews...');
  const seen = new Set<string>();
  let inserted = 0;
  let attempts = 0;
  while (inserted < 200 && attempts < 800) {
    attempts++;
    const student = pick(students);
    const course = pick(courses);
    const key = `${student.id}:${course.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const rating = faker.helpers.weightedArrayElement([
      { value: 5, weight: 5 },
      { value: 4, weight: 4 },
      { value: 3, weight: 2 },
      { value: 2, weight: 1 },
      { value: 1, weight: 1 },
    ]);
    await prisma.review.create({
      data: {
        userId: student.id,
        courseId: course.id,
        rating,
        comment: faker.lorem.paragraph(),
      },
    });
    inserted++;
  }

  for (const course of courses) {
    const agg = await prisma.review.aggregate({
      where: { courseId: course.id },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await prisma.course.update({
      where: { id: course.id },
      data: {
        ratingAvg: agg._avg.rating ?? 0,
        ratingCount: agg._count._all,
      },
    });
  }
  return inserted;
}

async function seedExtras(
  instructors: { id: string }[],
  students: { id: string }[],
  courses: SeededCourse[],
  achievements: { id: string; code: string }[],
  blogCategories: { id: string }[]
) {
  console.log('✨ Seeding extras (Q&A, wishlist, orders, blog, notifications, achievements)...');

  // Q&A: 40 questions, each with 1-3 answers
  for (let i = 0; i < 40; i++) {
    const student = pick(students);
    const course = pick(courses);
    const q = await prisma.question.create({
      data: {
        userId: student.id,
        courseId: course.id,
        lessonId: Math.random() < 0.5 ? pick(course.lessonIds) : null,
        title: faker.lorem.sentence({ min: 4, max: 8 }).replace(/\.$/, '?'),
        body: faker.lorem.paragraph(),
        resolvedAt: Math.random() < 0.4 ? faker.date.recent({ days: 30 }) : null,
      },
    });
    const answerCount = faker.number.int({ min: 1, max: 3 });
    for (let ai = 0; ai < answerCount; ai++) {
      const isInstructor = ai === 0 && Math.random() < 0.6;
      await prisma.answer.create({
        data: {
          questionId: q.id,
          userId: isInstructor ? pick(instructors).id : pick(students).id,
          body: faker.lorem.paragraph(),
          isInstructorAnswer: isInstructor,
        },
      });
    }
  }

  // Wishlist: 60 entries (mix wishlist/favorite)
  const wishSeen = new Set<string>();
  let wishCount = 0;
  let wishAttempts = 0;
  while (wishCount < 60 && wishAttempts < 200) {
    wishAttempts++;
    const student = pick(students);
    const course = pick(courses);
    const kind: WishlistKind = Math.random() < 0.6 ? 'WISHLIST' : 'FAVORITE';
    const key = `${student.id}:${course.id}:${kind}`;
    if (wishSeen.has(key)) continue;
    wishSeen.add(key);
    await prisma.wishlist.create({
      data: { userId: student.id, courseId: course.id, kind },
    });
    wishCount++;
  }

  // Orders: 30 paid orders
  for (let i = 0; i < 30; i++) {
    const student = pick(students);
    const itemsCount = faker.number.int({ min: 1, max: 3 });
    const orderCourses = pickN(courses.filter((c) => c.priceUsdCents > 0), itemsCount);
    if (orderCourses.length === 0) continue;
    const total = orderCourses.reduce((s, c) => s + c.priceUsdCents, 0);
    const provider = pick(PAYMENT_PROVIDERS);
    const order = await prisma.order.create({
      data: {
        userId: student.id,
        totalUsdCents: total,
        status: OrderStatus.PAID,
        paymentMethod: provider,
        externalPaymentId: faker.string.alphanumeric(16),
        paidAt: faker.date.recent({ days: 60 }),
      },
    });
    for (const c of orderCourses) {
      await prisma.orderItem.create({
        data: { orderId: order.id, courseId: c.id, priceUsdCents: c.priceUsdCents },
      });
    }
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider,
        status: PaymentStatus.SUCCESS,
        rawPayload: { ok: true, externalId: order.externalPaymentId },
      },
    });
  }

  // Blog: 15 posts with comments
  const author = pick(instructors);
  for (let i = 0; i < 15; i++) {
    const title = faker.lorem.sentence({ min: 4, max: 8 }).replace(/\.$/, '');
    const post = await prisma.blogPost.create({
      data: {
        slug: uniqueSlug(title, i),
        authorId: author.id,
        title,
        excerpt: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(5, '\n\n'),
        coverImageUrl: faker.image.urlPicsumPhotos({ width: 1200, height: 630 }),
        categoryId: pick(blogCategories).id,
        status: BlogPostStatus.PUBLISHED,
        publishedAt: faker.date.recent({ days: 90 }),
      },
    });
    const commentCount = faker.number.int({ min: 0, max: 4 });
    for (let ci = 0; ci < commentCount; ci++) {
      await prisma.comment.create({
        data: {
          blogPostId: post.id,
          userId: pick(students).id,
          body: faker.lorem.sentence(),
        },
      });
    }
  }

  // Notifications: 3-5 per first 20 students
  for (const student of students.slice(0, 20)) {
    const count = faker.number.int({ min: 3, max: 5 });
    for (let i = 0; i < count; i++) {
      const types: NotificationType[] = [
        'ENROLLMENT',
        'NEW_LESSON',
        'NEW_REVIEW',
        'QUIZ_PASSED',
        'CERTIFICATE_ISSUED',
        'GENERAL',
      ];
      const type = pick(types);
      await prisma.notification.create({
        data: {
          userId: student.id,
          type,
          title: faker.lorem.sentence({ min: 3, max: 6 }),
          body: faker.lorem.sentence(),
          link: Math.random() < 0.5 ? faker.internet.url() : null,
          readAt: Math.random() < 0.5 ? faker.date.recent({ days: 10 }) : null,
        },
      });
    }
  }

  // Instructor applications: 5 pending students
  for (const student of students.slice(0, 5)) {
    await prisma.instructorApplication.create({
      data: {
        userId: student.id,
        bio: faker.lorem.paragraph(),
        expertise: faker.helpers.arrayElement(['Web Dev', 'Data Science', 'Design', 'Marketing']),
        sampleWorkUrls: [faker.internet.url(), faker.internet.url()],
      },
    });
  }

  // Achievements: each instructor gets 1-2; every 10th student gets 1
  for (const ins of instructors) {
    const chosen = pickN(achievements, faker.number.int({ min: 1, max: 2 }));
    for (const a of chosen) {
      await prisma.userAchievement.create({
        data: { userId: ins.id, achievementId: a.id },
      });
    }
  }
  for (let i = 0; i < students.length; i += 10) {
    const a = pick(achievements);
    await prisma.userAchievement.create({
      data: { userId: students[i].id, achievementId: a.id },
    });
  }
}

async function reportCounts() {
  const tables: Array<[string, () => Promise<number>]> = [
    ['users', () => prisma.user.count()],
    ['categories', () => prisma.category.count()],
    ['courses', () => prisma.course.count()],
    ['sections', () => prisma.section.count()],
    ['lessons', () => prisma.lesson.count()],
    ['quizzes', () => prisma.quiz.count()],
    ['quizQuestions', () => prisma.quizQuestion.count()],
    ['codingExercises', () => prisma.codingExercise.count()],
    ['enrollments', () => prisma.enrollment.count()],
    ['lessonProgress', () => prisma.lessonProgress.count()],
    ['reviews', () => prisma.review.count()],
    ['questions(Q&A)', () => prisma.question.count()],
    ['answers', () => prisma.answer.count()],
    ['certificates', () => prisma.certificate.count()],
    ['wishlist', () => prisma.wishlist.count()],
    ['orders', () => prisma.order.count()],
    ['orderItems', () => prisma.orderItem.count()],
    ['payments', () => prisma.payment.count()],
    ['notifications', () => prisma.notification.count()],
    ['instructorApplications', () => prisma.instructorApplication.count()],
    ['blogCategories', () => prisma.blogCategory.count()],
    ['blogPosts', () => prisma.blogPost.count()],
    ['comments', () => prisma.comment.count()],
    ['achievements', () => prisma.achievement.count()],
    ['userAchievements', () => prisma.userAchievement.count()],
    ['settings', () => prisma.setting.count()],
    ['testimonials', () => prisma.testimonial.count()],
    ['faqs', () => prisma.faq.count()],
  ];
  console.log('\n📊 Final counts:');
  for (const [name, fn] of tables) {
    console.log(`  ${name.padEnd(24)} ${await fn()}`);
  }
}

async function main() {
  faker.seed(42);
  console.log('🌱 IlmHub seed start');
  await clearAll();
  const { instructors, students } = await seedUsers();
  const categories = await seedCategories();
  const blogCategories = await seedBlogCategories();
  const achievements = await seedAchievements();
  await seedSettings();
  await seedTestimonials();
  await seedFaqs();
  const courses = await seedCuratedCourses(instructors, categories);
  await seedEnrollments(students, courses);
  await seedReviews(students, courses);
  await seedExtras(instructors, students, courses, achievements, blogCategories);
  await reportCounts();
  console.log('\n✅ Seed complete');
  console.log('\n📚 Curated catalogue:');
  for (const c of courses) {
    const free = c.priceUsdCents === 0 ? 'FREE' : `$${(c.priceUsdCents / 100).toFixed(2)}`;
    console.log(`  • ${c.title.padEnd(42)} /courses/${c.slug}  (${free})`);
  }
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
