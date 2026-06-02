export type { InstructorCard, InstructorDetail } from "@/types/api";

export type SocialPlatform =
  | "twitter"
  | "linkedin"
  | "github"
  | "youtube"
  | "website";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}
