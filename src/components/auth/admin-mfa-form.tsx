"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  verifyAdminLoginMfaAction,
  type AdminMfaActionState,
} from "@/actions/admin-mfa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AdminMfaActionState = {};

export function AdminMfaForm() {
  const [state, formAction, pending] = useActionState(
    verifyAdminLoginMfaAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="Authentication code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="123456"
        required
      />

      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Verifying..." : "Verify and continue"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-slate-700 underline hover:text-slate-900">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
