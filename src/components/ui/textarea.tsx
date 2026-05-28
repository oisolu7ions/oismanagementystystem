import { forwardRef, type TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { label, error, hint, className = "", id, ...props },
    ref,
  ) {
    const textareaId = id ?? props.name;

    return (
      <div className="space-y-1.5">
        {label ? (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            "block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm",
            "placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200",
            error ? "border-red-300" : "border-slate-200",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {hint && !error ? (
          <p className="text-xs text-slate-500">{hint}</p>
        ) : null}
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  },
);
