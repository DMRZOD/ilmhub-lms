import {
  Award,
  Bell,
  BookOpen,
  Heart,
  Home,
  Medal,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type StudentNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  { href: "/student/dashboard", label: "Bosh sahifa", icon: Home },
  { href: "/student/courses", label: "Mening kurslarim", icon: BookOpen },
  { href: "/student/favorites", label: "Sevimlilar", icon: Heart },
  { href: "/student/messages", label: "Xabarlar", icon: MessageSquare },
  { href: "/student/certificates", label: "Sertifikatlar", icon: Award },
  { href: "/student/achievements", label: "Yutuqlar", icon: Medal },
  { href: "/student/notifications", label: "Bildirishnomalar", icon: Bell },
  { href: "/settings", label: "Sozlamalar", icon: Settings },
];
