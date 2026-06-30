import Image from "next/image";
import Link from "next/link";

type ClientBrandProps = {
  href?: string;
  linked?: boolean;
  className?: string;
};

export function ClientBrand({
  href = "/client/dashboard",
  linked = true,
  className = "",
}: ClientBrandProps) {
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
          OIS Client Portal
        </p>
        <p className="text-xs text-slate-500">Owolabi IT Solutions</p>
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
