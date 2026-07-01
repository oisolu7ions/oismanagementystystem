import Image from "next/image";
import Link from "next/link";

type AppBrandProps = {
  href?: string;
  linked?: boolean;
  showTagline?: boolean;
  className?: string;
  size?: "default" | "large";
  showLogo?: boolean;
};

export function AppBrand({
  href = "/dashboard",
  linked = true,
  showTagline = true,
  className = "",
  size = "default",
  showLogo = true,
}: AppBrandProps) {
  const isLarge = size === "large";
  const logoWidth = isLarge ? 96 : 72;
  const logoHeight = isLarge ? 72 : 54;
  const logoClassName = isLarge ? "h-20 w-auto shrink-0" : "h-14 w-auto shrink-0";
  const titleClassName = isLarge
    ? "text-xl font-semibold leading-tight text-slate-900"
    : "text-sm font-semibold leading-tight text-slate-900";
  const taglineClassName = isLarge ? "text-sm text-slate-500" : "text-xs text-slate-500";

  const content = (
    <div className={["flex", isLarge ? "flex-col items-center gap-3" : "items-center gap-3", className].filter(Boolean).join(" ")}>
      {showLogo ? (
        <Image
          src="/ois-logo.png"
          alt="OIS"
          width={logoWidth}
          height={logoHeight}
          className={logoClassName}
          priority
        />
      ) : null}
      <div className={isLarge ? "min-w-0 text-center" : "min-w-0"}>
        <p className={titleClassName}>
          Management Center
        </p>
        {showTagline ? (
          <p className={taglineClassName}>Internal operations</p>
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
