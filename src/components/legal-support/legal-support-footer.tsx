import Link from "next/link";

export type LegalSupportFooterLink = {
  href: string;
  label: string;
};

export const defaultLegalSupportFooterLinks: LegalSupportFooterLink[] = [
  { href: "/contact", label: "Contact" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/security", label: "Security" },
  { href: "/legal/accessibility", label: "Accessibility" },
];

export function LegalSupportFooter({
  className = "",
  links = defaultLegalSupportFooterLinks,
}: {
  className?: string;
  links?: LegalSupportFooterLink[];
}) {
  return (
    <footer
      className={[
        "text-center text-xs text-slate-400",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <nav aria-label="Legal and support" className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {links.map((link) => (
          <Link key={`${link.label}-${link.href}`} href={link.href} className="hover:text-slate-600 hover:underline">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
