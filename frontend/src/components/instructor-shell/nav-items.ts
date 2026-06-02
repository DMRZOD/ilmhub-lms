import {
  Bell,
  BookOpen,
  DollarSign,
  Home,
  MessageSquare,
  Settings,
  Star,
  Users,
} from "lucide-react";

import type { StudentNavItem } from "@/components/student-shell/nav-items";

export const INSTRUCTOR_NAV_ITEMS: StudentNavItem[] = [
  { href: "/instructor/dashboard", label: "Bosh sahifa", icon: Home },
  { href: "/instructor/courses", label: "Mening kurslarim", icon: BookOpen },
  { href: "/instructor/students", label: "Talabalar", icon: Users },
  { href: "/instructor/reviews", label: "Sharhlar", icon: Star },
  { href: "/instructor/revenue", label: "Daromad", icon: DollarSign },
  { href: "/instructor/messages", label: "Aloqalar", icon: MessageSquare },
  { href: "/instructor/bildirishnomalar", label: "Bildirishnomalar", icon: Bell },
  { href: "/settings", label: "Sozlamalar", icon: Settings },
];
