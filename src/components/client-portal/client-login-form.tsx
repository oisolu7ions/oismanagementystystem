"use client";

import { useActionState } from "react";
import {
  clientLoginAction,
  type ClientPortalAuthState,
} from "@/actions/client-portal-auth";
import { ResendVerificationForm } from "@/components/client-portal/resend-verification-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ClientPortalAuthState = {};

export function ClientLoginForm() {
  const [state, formAction, pending] = useActionState(clientLoginAction, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          placeholder="you@company.com"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />

        {state.error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Sending code..." : "Sign in to portal"}
        </Button>
      </form>

      {state.canResendVerification ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-3 text-sm text-slate-600">
            Need a new verification link?
          </p>
          <ResendVerificationForm defaultEmail={state.email} compact />
        </div>
      ) : null}
    </div>
  );
}
