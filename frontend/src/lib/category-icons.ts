import {
  BarChart3,
  Brain,
  Briefcase,
  Camera,
  Cloud,
  Code,
  Code2,
  Languages,
  type LucideIcon,
  Megaphone,
  Music,
  Palette,
  Server,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  BarChart3,
  Brain,
  Briefcase,
  Camera,
  Cloud,
  Code,
  Code2,
  Languages,
  Megaphone,
  Music,
  Palette,
  Server,
  ShieldCheck,
  Smartphone,
};

export function getCategoryIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Code2;
  return CATEGORY_ICON_MAP[iconName] ?? Code2;
}
