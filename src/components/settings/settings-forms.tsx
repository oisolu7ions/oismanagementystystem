"use client";

import { useActionState } from "react";
import { Save, Send } from "lucide-react";
import {
  sendTestEmailAction,
  updateBusinessSettingsAction,
  updateEmailSettingsAction,
  updateLegalSettingsAction,
  updatePortalDefaultSettingsAction,
  updateSecuritySettingsAction,
  type SettingsActionState,
} from "@/actions/settings";
import type { SettingsSystemStatus } from "@/lib/settings/system-status";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type BusinessSettings = {
  name: string;
  supportEmail: string;
  supportPhone: string;
  websiteUrl: string;
  defaultSenderName: string;
  defaultEmailFooterText: string;
};

type EmailSettings = {
  providerMode: "console" | "smtp" | "disabled";
  from: string;
  replyTo: string;
  testRecipient: string;
};

type SecuritySettings = {
  requireEmailVerification: boolean;
  requireLoginCode: boolean;
  loginCodeExpirationMinutes: number;
  verificationTokenExpirationHours: number;
  maxLoginCodeAttempts: number;
  loginCodeLength: number;
  allowResendVerificationEmail: boolean;
  loginCodeResendCooldownSeconds: number;
  verificationResendCooldownSeconds: number;
  maxLoginCodeSendsPerHour: number;
  maxVerificationEmailsPerDay: number;
};

type PortalDefaults = {
  defaultUserActive: boolean;
  autoSendWelcomeEmail: boolean;
  requireEmailVerificationForNewUsers: boolean;
  defaultProjectVisible: boolean;
  defaultTaskVisible: boolean;
  defaultInvoiceVisible: boolean;
  defaultDocumentVisible: boolean;
  defaultUpdateRequestsEnabled: boolean;
};

type LegalSettings = {
  contactUrl: string;
  privacyUrl: string;
  termsUrl: string;
  securityUrl: string;
  accessibilityUrl: string;
  showFooterOnAuthPages: boolean;
  showFooterInPortal: boolean;
};

type SettingsFormsProps = {
  business: BusinessSettings;
  email: EmailSettings;
  security: SecuritySettings;
  portalDefaults: PortalDefaults;
  legal: LegalSettings;
  systemStatus: SettingsSystemStatus;
};

const initialState: SettingsActionState = {};
const selectClass = "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

function FormStatus({ state }: { state: SettingsActionState }) {
  if (state.success) {
    return <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>;
  }
  if (state.error && !state.fieldErrors) {
    return <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>;
  }
  return null;
}

function Toggle({ name, label, description, defaultChecked }: {
  name: string;
  label: string;
  description?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
      />
      <input type="hidden" name={name} value="false" />
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description ? <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span> : null}
      </span>
    </label>
  );
}

function SaveButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending}>
      <Save className="h-4 w-4" aria-hidden="true" />
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

export function SettingsForms({
  business,
  email,
  security,
  portalDefaults,
  legal,
  systemStatus,
}: SettingsFormsProps) {
  const [businessState, businessAction, businessPending] = useActionState(updateBusinessSettingsAction, initialState);
  const [emailState, emailAction, emailPending] = useActionState(updateEmailSettingsAction, initialState);
  const [testEmailState, testEmailAction, testEmailPending] = useActionState(sendTestEmailAction, initialState);
  const [securityState, securityAction, securityPending] = useActionState(updateSecuritySettingsAction, initialState);
  const [defaultsState, defaultsAction, defaultsPending] = useActionState(updatePortalDefaultSettingsAction, initialState);
  const [legalState, legalAction, legalPending] = useActionState(updateLegalSettingsAction, initialState);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Business Profile" description="Client-facing business details used in emails and support surfaces." />
        <CardBody>
          <form action={businessAction} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Business name" name="name" defaultValue={business.name} error={businessState.fieldErrors?.name} />
              <Input label="Support email" name="supportEmail" defaultValue={business.supportEmail} error={businessState.fieldErrors?.supportEmail} />
              <Input label="Support phone" name="supportPhone" defaultValue={business.supportPhone} error={businessState.fieldErrors?.supportPhone} />
              <Input label="Website URL" name="websiteUrl" defaultValue={business.websiteUrl} error={businessState.fieldErrors?.websiteUrl} />
              <Input label="Default sender name" name="defaultSenderName" defaultValue={business.defaultSenderName} error={businessState.fieldErrors?.defaultSenderName} />
            </div>
            <Textarea label="Default email footer text" name="defaultEmailFooterText" rows={3} defaultValue={business.defaultEmailFooterText} />
            <FormStatus state={businessState} />
            <SaveButton pending={businessPending} />
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Email Sending" description="Provider mode and non-secret email metadata. SMTP secrets stay in .env only." />
        <CardBody>
          <form action={emailAction} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="providerMode" className="block text-sm font-medium text-slate-700">Provider mode</label>
                <select id="providerMode" name="providerMode" defaultValue={email.providerMode} className={selectClass}>
                  <option value="console">Console</option>
                  <option value="smtp">SMTP</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <Input label="From" name="from" defaultValue={email.from} error={emailState.fieldErrors?.from} />
              <Input label="Reply-To" name="replyTo" defaultValue={email.replyTo} error={emailState.fieldErrors?.replyTo} />
              <Input label="Test recipient" name="testRecipient" defaultValue={email.testRecipient} error={emailState.fieldErrors?.testRecipient} />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
              APP_URL: <span className="font-medium text-slate-800">{systemStatus.appUrl}</span>. SMTP configured: <span className="font-medium text-slate-800">{systemStatus.smtpConfigured ? "Yes" : "No"}</span>.
            </div>
            <FormStatus state={emailState} />
            <SaveButton pending={emailPending} />
          </form>
          <form action={testEmailAction} className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input label="Send test email to" name="testRecipient" defaultValue={email.testRecipient} error={testEmailState.fieldErrors?.testRecipient} />
            </div>
            <Button type="submit" variant="secondary" disabled={testEmailPending}>
              <Send className="h-4 w-4" aria-hidden="true" />
              {testEmailPending ? "Sending..." : "Send test"}
            </Button>
          </form>
          <div className="mt-3"><FormStatus state={testEmailState} /></div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Client Portal Security" description="Controls for verification, one-time login codes, expiry windows, and resend limits." />
        <CardBody>
          <form action={securityAction} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle name="requireEmailVerification" label="Require email verification" defaultChecked={security.requireEmailVerification} />
              <Toggle name="requireLoginCode" label="Require login code" defaultChecked={security.requireLoginCode} />
              <Toggle name="allowResendVerificationEmail" label="Allow verification resends" defaultChecked={security.allowResendVerificationEmail} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Input label="Code expiration minutes" name="loginCodeExpirationMinutes" type="number" min={5} max={30} defaultValue={security.loginCodeExpirationMinutes} error={securityState.fieldErrors?.loginCodeExpirationMinutes} />
              <Input label="Verification expiration hours" name="verificationTokenExpirationHours" type="number" min={1} max={72} defaultValue={security.verificationTokenExpirationHours} error={securityState.fieldErrors?.verificationTokenExpirationHours} />
              <Input label="Max code attempts" name="maxLoginCodeAttempts" type="number" min={3} max={10} defaultValue={security.maxLoginCodeAttempts} error={securityState.fieldErrors?.maxLoginCodeAttempts} />
              <div className="space-y-1.5">
                <label htmlFor="loginCodeLength" className="block text-sm font-medium text-slate-700">Code length</label>
                <select id="loginCodeLength" name="loginCodeLength" defaultValue={security.loginCodeLength} className={selectClass}>
                  <option value="6">6 digits</option>
                  <option value="8">8 digits</option>
                </select>
              </div>
              <Input label="Code resend cooldown seconds" name="loginCodeResendCooldownSeconds" type="number" min={1} defaultValue={security.loginCodeResendCooldownSeconds} error={securityState.fieldErrors?.loginCodeResendCooldownSeconds} />
              <Input label="Verification resend cooldown seconds" name="verificationResendCooldownSeconds" type="number" min={1} defaultValue={security.verificationResendCooldownSeconds} error={securityState.fieldErrors?.verificationResendCooldownSeconds} />
              <Input label="Max code sends per hour" name="maxLoginCodeSendsPerHour" type="number" min={1} defaultValue={security.maxLoginCodeSendsPerHour} error={securityState.fieldErrors?.maxLoginCodeSendsPerHour} />
              <Input label="Max verification emails per day" name="maxVerificationEmailsPerDay" type="number" min={1} defaultValue={security.maxVerificationEmailsPerDay} error={securityState.fieldErrors?.maxVerificationEmailsPerDay} />
            </div>
            <FormStatus state={securityState} />
            <SaveButton pending={securityPending} />
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Client Portal Access Defaults" description="Defaults used when future portal users and client-visible records are created." />
        <CardBody>
          <form action={defaultsAction} className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle name="defaultUserActive" label="New portal users active" defaultChecked={portalDefaults.defaultUserActive} />
              <Toggle name="autoSendWelcomeEmail" label="Auto-send welcome email" defaultChecked={portalDefaults.autoSendWelcomeEmail} />
              <Toggle name="requireEmailVerificationForNewUsers" label="Require verification for new users" defaultChecked={portalDefaults.requireEmailVerificationForNewUsers} />
              <Toggle name="defaultProjectVisible" label="New projects visible" defaultChecked={portalDefaults.defaultProjectVisible} />
              <Toggle name="defaultTaskVisible" label="New tasks visible" defaultChecked={portalDefaults.defaultTaskVisible} />
              <Toggle name="defaultInvoiceVisible" label="New invoices visible" defaultChecked={portalDefaults.defaultInvoiceVisible} />
              <Toggle name="defaultDocumentVisible" label="New documents visible" defaultChecked={portalDefaults.defaultDocumentVisible} />
              <Toggle name="defaultUpdateRequestsEnabled" label="Update requests enabled" defaultChecked={portalDefaults.defaultUpdateRequestsEnabled} />
            </div>
            <FormStatus state={defaultsState} />
            <SaveButton pending={defaultsPending} />
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Legal/Footer Links" description="Footer destinations can be internal paths or external http(s) URLs." />
        <CardBody>
          <form action={legalAction} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Contact URL" name="contactUrl" defaultValue={legal.contactUrl} error={legalState.fieldErrors?.contactUrl} />
              <Input label="Privacy URL" name="privacyUrl" defaultValue={legal.privacyUrl} error={legalState.fieldErrors?.privacyUrl} />
              <Input label="Terms URL" name="termsUrl" defaultValue={legal.termsUrl} error={legalState.fieldErrors?.termsUrl} />
              <Input label="Security URL" name="securityUrl" defaultValue={legal.securityUrl} error={legalState.fieldErrors?.securityUrl} />
              <Input label="Accessibility URL" name="accessibilityUrl" defaultValue={legal.accessibilityUrl} error={legalState.fieldErrors?.accessibilityUrl} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle name="showFooterOnAuthPages" label="Show footer on auth pages" defaultChecked={legal.showFooterOnAuthPages} />
              <Toggle name="showFooterInPortal" label="Show footer in portal" defaultChecked={legal.showFooterInPortal} />
            </div>
            <FormStatus state={legalState} />
            <SaveButton pending={legalPending} />
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Development & Production Mode" description="Runtime display only. Secrets and full connection strings are intentionally hidden." />
        <CardBody>
          <div className="divide-y divide-slate-100">
            <StatusRow label="NODE_ENV" value={systemStatus.nodeEnv} />
            <StatusRow label="APP_URL" value={systemStatus.appUrl} />
            <StatusRow label="EMAIL_PROVIDER" value={systemStatus.emailProvider} />
            <StatusRow label="SMTP configured" value={systemStatus.smtpConfigured ? "Yes" : "No"} />
            <StatusRow label="EMAIL_FROM configured" value={systemStatus.emailFromConfigured ? "Yes" : "No"} />
            <StatusRow label="Secure cookies" value={systemStatus.secureCookies ? "Yes" : "No"} />
            <StatusRow label="Database" value={systemStatus.databaseLabel} />
          </div>
          {systemStatus.warnings.length ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
              {systemStatus.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
