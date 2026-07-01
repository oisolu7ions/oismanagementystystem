import { SettingsForms } from "@/components/settings/settings-forms";
import {
  ensureDefaultSettings,
  getBusinessSettings,
  getClientPortalSecuritySettings,
  getEmailSettings,
  getLegalSettings,
  getPortalDefaultSettings,
} from "@/lib/settings";
import { getSettingsSystemStatus } from "@/lib/settings/system-status";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  await ensureDefaultSettings();

  const [business, email, security, portalDefaults, legal, systemStatus] = await Promise.all([
    getBusinessSettings(),
    getEmailSettings(),
    getClientPortalSecuritySettings(),
    getPortalDefaultSettings(),
    getLegalSettings(),
    getSettingsSystemStatus(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage client portal security, email behavior, public footer links, and deployment status.
        </p>
      </div>
      <SettingsForms
        business={business}
        email={email}
        security={security}
        portalDefaults={portalDefaults}
        legal={legal}
        systemStatus={systemStatus}
      />
    </div>
  );
}
