"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

type SharingValues = {
  clientVisible?: boolean;
  clientSummary?: string | null;
  clientStatusNote?: string | null;
  clientNote?: string | null;
  clientDescription?: string | null;
};

export function ProjectClientSharingFields({
  initialValues,
}: {
  initialValues?: SharingValues;
}) {
  const [clientVisible, setClientVisible] = useState(initialValues?.clientVisible ?? false);

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-medium text-slate-900">Client portal sharing</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Control what this project shows in the client portal.
        </p>
      </div>

      <input type="hidden" name="clientVisible" value={clientVisible ? "true" : "false"} />
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={clientVisible}
          onChange={(event) => setClientVisible(event.target.checked)}
          className="mt-0.5 rounded border-slate-300"
        />
        <span>
          <span className="block text-sm font-medium text-slate-800">Visible to Client</span>
          <span className="mt-0.5 block text-xs text-slate-500">
            When enabled, the client can see this project in their portal.
          </span>
        </span>
      </label>

      <Textarea
        label="Client Summary"
        name="clientSummary"
        rows={3}
        defaultValue={initialValues?.clientSummary ?? ""}
        placeholder="Your website project is currently in development..."
      />
      <Textarea
        label="Client Status Note"
        name="clientStatusNote"
        rows={3}
        defaultValue={initialValues?.clientStatusNote ?? ""}
        placeholder="We are waiting on final photos before moving to review."
      />
    </div>
  );
}

export function TaskClientSharingFields({
  initialValues,
}: {
  initialValues?: SharingValues;
}) {
  const [clientVisible, setClientVisible] = useState(initialValues?.clientVisible ?? false);

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="clientVisible" value={clientVisible ? "true" : "false"} />
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={clientVisible}
          onChange={(event) => setClientVisible(event.target.checked)}
          className="mt-0.5 rounded border-slate-300"
        />
        <span>
          <span className="block text-sm font-medium text-slate-800">Visible to Client</span>
          <span className="mt-0.5 block text-xs text-slate-500">
            Only share client-relevant tasks such as content requests or approvals.
          </span>
        </span>
      </label>
      <Textarea
        label="Client Note"
        name="clientNote"
        rows={3}
        defaultValue={initialValues?.clientNote ?? ""}
        placeholder="Please send the updated service descriptions for the homepage."
      />
    </div>
  );
}

export function InvoiceClientSharingFields({
  initialValues,
}: {
  initialValues?: SharingValues;
}) {
  const [clientVisible, setClientVisible] = useState(initialValues?.clientVisible ?? true);

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="clientVisible" value={clientVisible ? "true" : "false"} />
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={clientVisible}
          onChange={(event) => setClientVisible(event.target.checked)}
          className="mt-0.5 rounded border-slate-300"
        />
        <span>
          <span className="block text-sm font-medium text-slate-800">Visible to Client</span>
          <span className="mt-0.5 block text-xs text-slate-500">
            Invoices are visible by default unless you hide them.
          </span>
        </span>
      </label>
      <Textarea
        label="Client Note"
        name="clientNote"
        rows={3}
        defaultValue={initialValues?.clientNote ?? ""}
        placeholder="Payment for March website maintenance."
      />
    </div>
  );
}

export function DocumentClientSharingFields({
  initialValues,
}: {
  initialValues?: SharingValues;
}) {
  const [clientVisible, setClientVisible] = useState(initialValues?.clientVisible ?? false);

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="clientVisible" value={clientVisible ? "true" : "false"} />
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={clientVisible}
          onChange={(event) => setClientVisible(event.target.checked)}
          className="mt-0.5 rounded border-slate-300"
        />
        <span>
          <span className="block text-sm font-medium text-slate-800">Visible to Client</span>
          <span className="mt-0.5 block text-xs text-slate-500">
            Documents are hidden by default. Share only client-safe files and links.
          </span>
        </span>
      </label>
      <Textarea
        label="Client Description"
        name="clientDescription"
        rows={3}
        defaultValue={initialValues?.clientDescription ?? ""}
        placeholder="Website content folder for your review."
      />
    </div>
  );
}
