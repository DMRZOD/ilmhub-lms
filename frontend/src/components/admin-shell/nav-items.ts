import {
  Bell,
  BookOpen,
  CreditCard,
  Flag,
  GraduationCap,
  Home,
  LayoutGrid,
  Newspaper,
  RotateCcw,
  Settings,
  Users,
} from "lucide-react";

import type { StudentNavItem } from "@/components/student-shell/nav-items";

export const ADMIN_NAV_ITEMS: StudentNavItem[] = [
  { href: "/admin/dashboard", label: "Bosh sahifa", icon: Home },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
  { href: "/admin/instructors", label: "Ustozlar", icon: GraduationCap },
  { href: "/admin/courses", label: "Kurslar", icon: BookOpen },
  { href: "/admin/payments", label: "To'lovlar", icon: CreditCard },
  { href: "/admin/refunds", label: "Refundlar", icon: RotateCcw },
  { href: "/admin/reports", label: "Shikoyatlar", icon: Flag },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/cms", label: "CMS", icon: LayoutGrid },
  { href: "/admin/bildirishnomalar", label: "Bildirishnomalar", icon: Bell },
  { href: "/admin/settings", label: "Sozlamalar", icon: Settings },
];
