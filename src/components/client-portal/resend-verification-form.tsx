"use client";

import { useActionState } from "react";
import {
  resendVerificationEmailAction,
  type ClientPortalAuthState,
} from "@/actions/client-portal-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ClientPortalAuthState = {};

export function ResendVerificationForm({
  defaultEmail = "",
  compact = false,
}: {
  defaultEmail?: string;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    resendVerificationEmailAction,
    initialState,
  );

  return (
    <form action={formAction} className={compact ? "space-y-3" : "space-y-4"}>
      <Input
        label={compact ? undefined : "Email"}
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.email ?? defaultEmail}
        required
      />

      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" fullWidth disabled={pending}>
        {pending ? "Sending..." : "Resend verification email"}
      </Button>
    </form>
  );
}
