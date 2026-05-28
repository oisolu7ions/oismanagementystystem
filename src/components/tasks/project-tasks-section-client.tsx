"use client";

type Progress = {
  total: number;
  completed: number;
  percentComplete: number;
};

export function ProjectTasksSectionClient({ progress }: { progress: Progress }) {
  if (progress.total === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-600">
        <span>Progress</span>
        <span>
          {progress.completed}/{progress.total} ({progress.percentComplete}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${progress.percentComplete}%` }}
        />
      </div>
    </div>
  );
}
