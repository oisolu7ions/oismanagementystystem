import Image from "next/image";
import Link from "next/link";

type AppBrandProps = {
  href?: string;
  linked?: boolean;
  showTagline?: boolean;
  className?: string;
};

export function AppBrand({
  href = "/dashboard",
  linked = true,
  showTagline = true,
  className = "",
}: AppBrandProps) {
  const content = (
    <div className={["flex items-center gap-3", className].filter(Boolean).join(" ")}>
      <Image
        src="/ois-logo.png"
        alt="OIS"
        width={48}
        height={36}
        className="h-9 w-auto shrink-0"
        priority
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight text-slate-900">
          Command Center
        </p>
        {showTagline ? (
          <p className="text-xs text-slate-500">Internal operations</p>
        ) : null}
      </div>
    </div>
  );

  if (linked) {
    return (
      <Link
        href={href}
        className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    );
  }

  return content;
}
