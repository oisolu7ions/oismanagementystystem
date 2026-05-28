export type TaskActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  message?: string;
  createdCount?: number;
};
