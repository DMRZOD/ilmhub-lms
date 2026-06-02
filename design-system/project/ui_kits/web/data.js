// Mock data for IlmHub UI kit
window.ILMHUB_DATA = {
  user: {
    name: "Aziz",
    fullName: "Aziz Karimov",
    initials: "AK",
    coursesCompleted: 11,
    coursesInProgress: 4,
    streak: 9,
  },
  categories: [
    { id: "frontend",  name: "Frontend",       icon: "layout-dashboard", count: 24 },
    { id: "backend",   name: "Backend",        icon: "server",           count: 18 },
    { id: "mobile",    name: "Mobil",          icon: "smartphone",       count: 12 },
    { id: "data",      name: "Data Science",   icon: "bar-chart-3",      count: 16 },
    { id: "design",    name: "UI/UX Dizayn",   icon: "palette",          count: 14 },
    { id: "devops",    name: "DevOps",         icon: "cloud",            count: 9  },
    { id: "security",  name: "Kiberxavfsizlik",icon: "shield-check",     count: 7  },
    { id: "game",      name: "O'yin",          icon: "gamepad-2",        count: 6  },
  ],
  courses: [
    {
      id: 1, title: "JavaScript Asoslari", author: "Aziz Karimov", authorInitials: "AK",
      category: "frontend", price: 85, rating: 4.8, students: 245, hours: "12h 30min",
      lessons: 28, level: "Boshlang'ich", icon: "braces", color: "#F7DF1E", text: "#000",
      progress: 18, hot: true,
    },
    {
      id: 2, title: "React.js Mastery", author: "Malika Yusupova", authorInitials: "MY",
      category: "frontend", price: 120, rating: 4.9, students: 189, hours: "18h 45min",
      lessons: 42, level: "O'rta", icon: "atom", color: "#61DAFB", text: "#0A0A0A",
      progress: 62, hot: true,
    },
    {
      id: 3, title: "Node.js Backend Development", author: "Bobur Rakhimov", authorInitials: "BR",
      category: "backend", price: 110, rating: 4.7, students: 156, hours: "16h 20min",
      lessons: 34, level: "O'rta", icon: "server-cog", color: "#0A0A0A", text: "#fff",
      progress: 0,
    },
    {
      id: 4, title: "Python Data Science", author: "Dilshod Aliyev", authorInitials: "DA",
      category: "data", price: 150, rating: 4.9, students: 312, hours: "22h 10min",
      lessons: 48, level: "O'rta", icon: "bar-chart-3", color: "#F5F5F5", text: "#0A0A0A",
      progress: 100, hot: true,
    },
    {
      id: 5, title: "UI/UX Design Fundamentals", author: "Sevara Tashkentova", authorInitials: "ST",
      category: "design", price: 95, rating: 4.8, students: 198, hours: "14h 00min",
      lessons: 32, level: "Boshlang'ich", icon: "palette", color: "#0A0A0A", text: "#fff",
      progress: 45,
    },
    {
      id: 6, title: "DevOps with Docker & Kubernetes", author: "Rustam Yuldashev", authorInitials: "RY",
      category: "devops", price: 130, rating: 4.7, students: 134, hours: "20h 30min",
      lessons: 38, level: "Yuqori", icon: "container", color: "#0A0A0A", text: "#fff",
      progress: 0,
    },
  ],
  curriculum: [
    { module: "1. Kirish", duration: "1h 20min", lessons: [
      { title: "JavaScript haqida umumiy ma'lumot", dur: "08:24", done: true },
      { title: "Muhitni o'rnatish (Node, VSCode)", dur: "12:10", done: true },
      { title: "Birinchi dastur — Hello, IlmHub", dur: "06:45", done: true },
    ]},
    { module: "2. Til asoslari", duration: "3h 10min", lessons: [
      { title: "O'zgaruvchilar va ma'lumot turlari", dur: "18:32", done: true },
      { title: "Operatorlar va ifodalar", dur: "14:08", done: true },
      { title: "Shartli operatorlar", dur: "16:54", done: false, active: true },
      { title: "Tsikllar — for, while, do/while", dur: "22:11", done: false },
      { title: "Funksiyalar va scope", dur: "28:46", done: false },
    ]},
    { module: "3. DOM va hodisalar", duration: "2h 50min", lessons: [
      { title: "DOM — daraxt strukturasi", dur: "20:14", done: false },
      { title: "Elementlarni tanlash", dur: "15:30", done: false },
      { title: "Hodisalar (events)", dur: "18:00", done: false },
    ]},
    { module: "4. Asinxron JavaScript", duration: "2h 40min", lessons: [
      { title: "Promise va async/await", dur: "24:15", done: false },
      { title: "Fetch API", dur: "19:20", done: false },
      { title: "Yakuniy loyiha", dur: "1h 10min", done: false },
    ]},
  ],
  upcoming: [
    { title: "Cloud Computing Essentials", time: "17:30", icon: "graduation-cap" },
    { title: "Mobile App Development Trends", time: "20:00", icon: "smartphone" },
    { title: "Database Design Workshop", time: "Ertaga, 19:00", icon: "database" },
  ],
  learningHours: [
    { d: "Du", h: 0 }, { d: "Se", h: 1.5 }, { d: "Ch", h: 2.5 },
    { d: "Pa", h: 1 },  { d: "Ju", h: 4 },   { d: "Sh", h: 3 }, { d: "Ya", h: 2 },
  ],
};
