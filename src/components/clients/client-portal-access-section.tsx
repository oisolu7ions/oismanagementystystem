"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition } from "react";
import {
  createClientUserAction,
  setClientUserActiveAction,
  type ClientUserActionState,
} from "@/actions/client-portal-users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ClientUser } from "@/generated/prisma/client";

const initialState: ClientUserActionState = {};

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
      {state.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Creating..." : "Create portal user"}
      </Button>
    </form>
  );
}

function ClientUserRow({ user }: { user: ClientUser }) {
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

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-slate-900">{user.name}</p>
          <Badge variant={user.isActive ? "success" : "muted"}>
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-slate-600">{user.email}</p>
        <p className="mt-1 text-xs text-slate-500">
          {user.lastLoginAt
            ? `Last login ${user.lastLoginAt.toLocaleString()}`
            : "Never signed in"}
        </p>
      </div>
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
  );
}

export function ClientPortalAccessSection({
  clientId,
  users,
  hasPortalAccess,
}: {
  clientId: string;
  users: ClientUser[];
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
