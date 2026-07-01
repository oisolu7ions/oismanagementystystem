"use client";

import { useActionState, useState, useTransition } from "react";
import {
  clientVerifyLoginCodeAction,
  resendClientLoginCodeAction,
  type ClientPortalAuthState,
} from "@/actions/client-portal-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ClientPortalAuthState = {};

export function ClientLoginCodeForm() {
  const [state, formAction, pending] = useActionState(
    clientVerifyLoginCodeAction,
    initialState,
  );
  const [resendPending, startResend] = useTransition();
  const [resendState, setResendState] = useState<ClientPortalAuthState>(initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <Input
          label="One-time code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
        />

        {state.error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Checking..." : "Continue"}
        </Button>
      </form>

      {resendState.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {resendState.error}
        </p>
      ) : null}
      {resendState.success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {resendState.success}
        </p>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        fullWidth
        disabled={resendPending}
        onClick={() => {
          startResend(async () => {
            setResendState(await resendClientLoginCodeAction());
          });
        }}
      >
        {resendPending ? "Sending..." : "Resend code"}
      </Button>
    </div>
  );
}
