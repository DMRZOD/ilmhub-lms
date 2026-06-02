export const courseWizardKeys = {
  all: ["course-wizard"] as const,
  lists: () => [...courseWizardKeys.all, "list"] as const,
  list: (status?: string) =>
    [...courseWizardKeys.lists(), { status: status ?? "all" }] as const,
  detail: (id: string) => [...courseWizardKeys.all, "detail", id] as const,
};
