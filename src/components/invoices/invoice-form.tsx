"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import type { InvoiceActionState } from "@/lib/invoices/action-state";
import { invoiceStatusOptions } from "@/lib/invoices/constants";
import type { InvoiceFormInput } from "@/lib/validators/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ClientOption = { id: string; name: string; businessName: string | null };
type ProjectOption = {
  id: string;
  name: string;
  clientId: string;
  client: { id: string; name: string; businessName: string | null };
};

type InvoiceFormAction = (
  prevState: InvoiceActionState,
  formData: FormData,
) => Promise<InvoiceActionState>;

type InvoiceFormProps = {
  mode: "create" | "edit";
  action: InvoiceFormAction;
  clients: ClientOption[];
  projects: ProjectOption[];
  suggestedInvoiceNumber?: string;
  initialValues?: Partial<InvoiceFormInput>;
  lockClientId?: boolean;
  lockProjectId?: boolean;
};

const initialState: InvoiceActionState = {};

function clientLabel(client: ClientOption) {
  return client.businessName
    ? `${client.name} — ${client.businessName}`
    : client.name;
}

export function InvoiceForm({
  mode,
  action,
  clients,
  projects,
  suggestedInvoiceNumber,
  initialValues,
  lockClientId = false,
  lockProjectId = false,
}: InvoiceFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [clientId, setClientId] = useState(initialValues?.clientId ?? "");
  const [useAutoNumber, setUseAutoNumber] = useState(
    mode === "create" && !initialValues?.invoiceNumber,
  );

  const status = initialValues?.status ?? "DRAFT";
  const projectId = initialValues?.projectId ?? "";

  const visibleProjects = useMemo(
    () => (clientId ? projects.filter((p) => p.clientId === clientId) : projects),
    [clientId, projects],
  );

  const selectClass =
    "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  return (
    <form action={formAction} className="space-y-5">
      {mode === "create" && useAutoNumber ? (
        <input type="hidden" name="autoGenerateNumber" value="true" />
      ) : null}

      <div className="space-y-1.5">
        <label
          htmlFor="invoiceNumber"
          className="block text-sm font-medium text-slate-700"
        >
          Invoice number
        </label>
        {mode === "create" && useAutoNumber ? (
          <>
            <input
              type="hidden"
              name="invoiceNumber"
              value={suggestedInvoiceNumber ?? ""}
            />
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
              {suggestedInvoiceNumber ?? "OIS-0001"} (auto-generated on save)
            </p>
          </>
        ) : (
          <Input
            name="invoiceNumber"
            defaultValue={initialValues?.invoiceNumber ?? suggestedInvoiceNumber ?? ""}
            placeholder="OIS-0001"
            required
            error={state.fieldErrors?.invoiceNumber}
          />
        )}
        {mode === "create" ? (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={useAutoNumber}
              onChange={(e) => setUseAutoNumber(e.target.checked)}
              className="rounded border-slate-300"
            />
            Auto-generate invoice number (OIS-0001, OIS-0002, …)
          </label>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="clientId" className="block text-sm font-medium text-slate-700">
            Client
          </label>
          {lockClientId && clientId ? (
            <>
              <input type="hidden" name="clientId" value={clientId} />
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                {clients.find((c) => c.id === clientId)
                  ? clientLabel(clients.find((c) => c.id === clientId)!)
                  : "Selected client"}
              </p>
            </>
          ) : (
            <select
              id="clientId"
              name="clientId"
              value={clientId}
              required
              className={selectClass}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="" disabled>
                Select a client
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {clientLabel(client)}
                </option>
              ))}
            </select>
          )}
          {state.fieldErrors?.clientId ? (
            <p className="text-xs text-red-600">{state.fieldErrors.clientId}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="projectId" className="block text-sm font-medium text-slate-700">
            Project (optional)
          </label>
          {lockProjectId && projectId ? (
            <>
              <input type="hidden" name="projectId" value={projectId} />
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                {visibleProjects.find((p) => p.id === projectId)?.name ??
                  "Selected project"}
              </p>
            </>
          ) : (
            <select
              id="projectId"
              name="projectId"
              defaultValue={projectId}
              className={selectClass}
              disabled={!clientId && !lockClientId}
            >
              <option value="">No project</option>
              {visibleProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
          {state.fieldErrors?.projectId ? (
            <p className="text-xs text-red-600">{state.fieldErrors.projectId}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Amount"
          name="amount"
          defaultValue={initialValues?.amount ?? ""}
          placeholder='e.g. $599, $1,499, or "Starting at $1,499"'
          required
          error={state.fieldErrors?.amount}
        />
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className={selectClass}
          >
            {invoiceStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Due date"
          name="dueDate"
          type="date"
          defaultValue={initialValues?.dueDate ?? ""}
        />
        <Input
          label="Payment link"
          name="paymentLink"
          type="url"
          defaultValue={initialValues?.paymentLink ?? ""}
          placeholder="https://pay.example.com/..."
          error={state.fieldErrors?.paymentLink}
        />
      </div>

      <Textarea
        label="Notes"
        name="notes"
        rows={4}
        defaultValue={initialValues?.notes ?? ""}
        placeholder="Payment instructions, line items, or internal billing notes..."
      />

      <p className="text-xs text-slate-500">
        OIS Command Center does not process payments. Use payment links for manual
        client checkout only.
      </p>

      {state.error && !state.fieldErrors ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Saving..."
          : mode === "create"
            ? "Create invoice"
            : "Save changes"}
      </Button>
    </form>
  );
}
