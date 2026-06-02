export type InstructorApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

export type InstructorApplication = {
  id: string;
  userId: string;
  status: InstructorApplicationStatus;
  bio: string;
  expertise: string;
  sampleWorkUrls: string[];
  rejectedReason: string | null;
  decidedAt: string | null;
  createdAt: string;
};

export type CreateInstructorApplicationInput = {
  bio: string;
  expertise: string[];
  links: string[];
};
