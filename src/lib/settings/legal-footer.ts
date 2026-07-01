import type { LegalSupportFooterLink } from "@/components/legal-support/legal-support-footer";
import { getLegalSettings } from "@/lib/settings";

export type LegalSupportFooterConfig = {
  links: LegalSupportFooterLink[];
  showFooterOnAuthPages: boolean;
  showFooterInPortal: boolean;
};

export async function getLegalSupportFooterConfig(): Promise<LegalSupportFooterConfig> {
  const settings = await getLegalSettings();

  return {
    links: [
      { href: settings.contactUrl, label: "Contact" },
      { href: settings.privacyUrl, label: "Privacy" },
      { href: settings.termsUrl, label: "Terms" },
      { href: settings.securityUrl, label: "Security" },
      { href: settings.accessibilityUrl, label: "Accessibility" },
    ],
    showFooterOnAuthPages: settings.showFooterOnAuthPages,
    showFooterInPortal: settings.showFooterInPortal,
  };
}
