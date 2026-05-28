export const WEBSITE_BUILD_CHECKLIST_TITLES = [
  "Collect client information",
  "Collect logo and branding",
  "Collect website content",
  "Create homepage",
  "Create about page",
  "Create services page",
  "Set up contact form",
  "Add Google Maps",
  "Connect domain",
  "Set up SSL/security",
  "Mobile responsiveness check",
  "Final client review",
  "Launch website",
] as const;

export function checklistTitlesAlreadyPresent(
  existingTitles: string[],
): boolean {
  const normalized = new Set(
    existingTitles.map((t) => t.trim().toLowerCase()),
  );
  return WEBSITE_BUILD_CHECKLIST_TITLES.every((title) =>
    normalized.has(title.toLowerCase()),
  );
}

export function checklistTitlesToAdd(existingTitles: string[]): string[] {
  const normalized = new Set(
    existingTitles.map((t) => t.trim().toLowerCase()),
  );
  return WEBSITE_BUILD_CHECKLIST_TITLES.filter(
    (title) => !normalized.has(title.toLowerCase()),
  );
}
