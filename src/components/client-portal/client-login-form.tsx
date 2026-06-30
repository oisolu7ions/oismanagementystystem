"use client";

import { useActionState } from "react";
import {
  clientLoginAction,
  type ClientPortalAuthState,
} from "@/actions/client-portal-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ClientPortalAuthState = {};

export function ClientLoginForm() {
  const [state, formAction, pending] = useActionState(clientLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
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
        {pending ? "Signing in..." : "Sign in to portal"}
      </Button>
    </form>
  );
}
