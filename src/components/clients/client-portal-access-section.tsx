"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import {
  createClientUserAction,
  resendClientUserVerificationAction,
  resetClientUserPasswordAction,
  setClientUserActiveAction,
  type ClientUserActionState,
} from "@/actions/client-portal-users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PortalUser = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  securityEvents?: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: Date;
  }>;
};

const initialState: ClientUserActionState = {};

function formatDate(value: Date | null | undefined): string {
  return value ? value.toLocaleString() : "Never";
}

function CreateClientUserForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createClientUserAction.bind(null, clientId),
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-800">Create portal user</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Name"
          name="name"
          placeholder="Client contact name"
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="client@company.com"
          required
        />
      </div>
      <Input
        label="Temporary password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        required
      />
      {state.fieldErrors?.name ? (
        <p className="text-xs text-red-600">{state.fieldErrors.name}</p>
      ) : null}
      {state.fieldErrors?.email ? (
        <p className="text-xs text-red-600">{state.fieldErrors.email}</p>
      ) : null}
      {state.fieldErrors?.password ? (
        <p className="text-xs text-red-600">{state.fieldErrors.password}</p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-emerald-700">{state.message}</p>
      ) : null}
      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Creating..." : "Create portal user"}
      </Button>
    </form>
  );
}

function ResetClientUserPasswordForm({ clientUserId }: { clientUserId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    resetClientUserPasswordAction.bind(null, clientUserId),
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      router.refresh();
    }
  }, [router, state.success]);

  if (!open) {
    return (
      <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Reset password
      </Button>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-white p-3"
    >
      <p className="text-sm font-medium text-slate-800">Set a new password</p>
      <p className="text-xs text-slate-500">
        This signs the client out of any active portal sessions. Share the new password securely.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
        <Input
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          required
        />
      </div>
      {state.fieldErrors?.password ? (
        <p className="text-xs text-red-600">{state.fieldErrors.password}</p>
      ) : null}
      {state.fieldErrors?.confirmPassword ? (
        <p className="text-xs text-red-600">{state.fieldErrors.confirmPassword}</p>
      ) : null}
      {state.message ? <p className="text-sm text-emerald-700">{state.message}</p> : null}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : "Save new password"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ClientUserRow({ user }: { user: PortalUser }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggleActive() {
    startTransition(async () => {
      const result = await setClientUserActiveAction(user.id, !user.isActive);
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  function resendVerification() {
    startTransition(async () => {
      const result = await resendClientUserVerificationAction(user.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      if (result.message) alert(result.message);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-slate-900">{user.name}</p>
            <Badge variant={user.isActive ? "success" : "muted"}>
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge variant={user.emailVerifiedAt ? "success" : "warning"}>
              {user.emailVerifiedAt ? "Email verified" : "Email unverified"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
          <div className="mt-2 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
            <p>Created {formatDate(user.createdAt)}</p>
            <p>Last login {formatDate(user.lastLoginAt)}</p>
            <p>Verified {formatDate(user.emailVerifiedAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!user.emailVerifiedAt ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={resendVerification}
            >
              Resend verification
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant={user.isActive ? "secondary" : "primary"}
            disabled={pending}
            onClick={toggleActive}
          >
            {user.isActive ? "Deactivate access" : "Reactivate access"}
          </Button>
        </div>
      </div>

      <ResetClientUserPasswordForm clientUserId={user.id} />

      {user.securityEvents && user.securityEvents.length > 0 ? (
        <div className="rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Recent security events
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-500">
            {user.securityEvents.map((event) => (
              <li key={event.id}>
                <span className="font-medium text-slate-600">{event.type}</span>
                {" — "}
                {event.message} ({formatDate(event.createdAt)})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function ClientPortalAccessSection({
  clientId,
  users,
  hasPortalAccess,
}: {
  clientId: string;
  users: PortalUser[];
  hasPortalAccess: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={hasPortalAccess ? "success" : "muted"}>
          {hasPortalAccess ? "Portal access enabled" : "No active portal users"}
        </Badge>
        <span className="text-sm text-slate-500">
          {users.length} portal user{users.length === 1 ? "" : "s"}
        </span>
      </div>

      {users.length > 0 ? (
        <div className="space-y-3">
          {users.map((user) => (
            <ClientUserRow key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No client portal users yet. Create one below so this client can sign in
          at /client/login.
        </p>
      )}

      <CreateClientUserForm clientId={clientId} />
    </div>
  );
}
