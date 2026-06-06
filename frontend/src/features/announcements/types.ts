export type CourseAnnouncement = {
  id: string;
  subject: string;
  body: string;
  createdAt: string;
  instructor: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};
