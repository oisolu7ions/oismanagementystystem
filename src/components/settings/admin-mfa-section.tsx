"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  beginAdminMfaEnrollmentAction,
  cancelAdminMfaEnrollmentAction,
  confirmAdminMfaEnrollmentAction,
  disableAdminMfaAction,
  type AdminMfaActionState,
} from "@/actions/admin-mfa";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState: AdminMfaActionState = {};

type AdminMfaSectionProps = {
  enabled: boolean;
  pendingSetup: boolean;
  verifiedAt: string | null;
};

function MfaStatusMessage({ state }: { state: AdminMfaActionState }) {
  if (state.success) {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        {state.success}
      </p>
    );
  }
  if (state.error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {state.error}
      </p>
    );
  }
  return null;
}

export function AdminMfaSection({ enabled, pendingSetup, verifiedAt }: AdminMfaSectionProps) {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<AdminMfaActionState | null>(null);
  const [beginPending, startBegin] = useTransition();
  const [cancelPending, startCancel] = useTransition();
  const [confirmState, confirmAction, confirmPending] = useActionState(
    confirmAdminMfaEnrollmentAction,
    initialState,
  );
  const [disableState, disableAction, disablePending] = useActionState(
    disableAdminMfaAction,
    initialState,
  );

  useEffect(() => {
    if (confirmState.success || disableState.success) {
      setEnrollment(null);
      router.refresh();
    }
  }, [confirmState.success, disableState.success, router]);

  const showSetup = Boolean(enrollment?.qrDataUrl) || pendingSetup;

  function startEnrollment() {
    startBegin(async () => {
      const result = await beginAdminMfaEnrollmentAction();
      setEnrollment(result);
    });
  }

  function cancelEnrollment() {
    startCancel(async () => {
      await cancelAdminMfaEnrollmentAction();
      setEnrollment(null);
    });
  }

  return (
    <Card>
      <CardHeader
        title="Admin two-factor authentication"
        description="Require an authenticator app code after password sign-in."
      />
      <CardBody className="space-y-5">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
          Status:{" "}
          <span className="font-medium text-slate-900">
            {enabled
              ? "Enabled"
              : showSetup
                ? "Setup in progress"
                : "Not enabled"}
          </span>
          {enabled && verifiedAt ? (
            <span className="mt-1 block text-slate-500">
              Enabled on {new Date(verifiedAt).toLocaleString()}
            </span>
          ) : null}
        </div>

        {!enabled && !showSetup ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Use Google Authenticator, 1Password, Authy, or another TOTP app.
            </p>
            <Button type="button" disabled={beginPending} onClick={startEnrollment}>
              {beginPending ? "Starting setup..." : "Enable MFA"}
            </Button>
          </div>
        ) : null}

        {!enabled && showSetup ? (
          <div className="space-y-4">
            {enrollment?.qrDataUrl ? (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={enrollment.qrDataUrl}
                  alt="Authenticator app QR code"
                  className="h-48 w-48 rounded-lg border border-slate-200 bg-white p-2"
                />
                {enrollment.manualSecret ? (
                  <p className="text-center text-xs text-slate-500">
                    Manual entry key:{" "}
                    <span className="font-mono text-slate-700">{enrollment.manualSecret}</span>
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                MFA setup was started but the QR code is not loaded. Click Enable MFA again to
                regenerate it.
              </p>
            )}

            <form action={confirmAction} className="space-y-3">
              <Input
                label="Confirm with authenticator code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                required
              />
              <MfaStatusMessage state={confirmState} />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={confirmPending}>
                  {confirmPending ? "Confirming..." : "Confirm and enable MFA"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={cancelPending}
                  onClick={cancelEnrollment}
                >
                  {cancelPending ? "Cancelling..." : "Cancel setup"}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        {enabled ? (
          <form action={disableAction} className="space-y-3 border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-600">
              To disable MFA, enter your password and a current authenticator code.
            </p>
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Input
              label="Authentication code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              required
            />
            <MfaStatusMessage state={disableState} />
            <Button type="submit" variant="danger" disabled={disablePending}>
              {disablePending ? "Disabling..." : "Disable MFA"}
            </Button>
          </form>
        ) : null}
      </CardBody>
    </Card>
  );
}
