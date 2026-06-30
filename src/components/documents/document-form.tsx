"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import type { DocumentActionState } from "@/lib/documents/action-state";
import {
  documentFileTypeOptions,
  formatFileSize,
  getAcceptAttributeForFileType,
  isLinkOnlyDocumentType,
} from "@/lib/documents/constants";
import type { DocumentFormInput } from "@/lib/validators/document";
import { DocumentClientSharingFields } from "@/components/client-sharing/client-sharing-fields";
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

type DocumentFormAction = (
  prevState: DocumentActionState,
  formData: FormData,
) => Promise<DocumentActionState>;

type DocumentFormProps = {
  mode: "create" | "edit";
  action: DocumentFormAction;
  clients: ClientOption[];
  projects: ProjectOption[];
  initialValues?: Partial<DocumentFormInput> & {
    sourceType?: "LINK" | "FILE";
    originalFileName?: string | null;
    fileSize?: number | null;
  };
  lockClientId?: boolean;
  lockProjectId?: boolean;
  relatedClientLabel?: string;
};

const initialState: DocumentActionState = {};

function entityLabel(name: string, businessName: string | null) {
  return businessName ? `${name} — ${businessName}` : name;
}

export function DocumentForm({
  mode,
  action,
  clients,
  projects,
  initialValues,
  lockClientId = false,
  lockProjectId = false,
  relatedClientLabel,
}: DocumentFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const initialLink =
    initialValues?.projectId ? "project" : initialValues?.clientId ? "client" : "client";

  const [linkType, setLinkType] = useState<"client" | "project">(initialLink);
  const [clientId, setClientId] = useState(initialValues?.clientId ?? "");
  const [projectId, setProjectId] = useState(initialValues?.projectId ?? "");
  const [fileType, setFileType] = useState(initialValues?.fileType ?? "OTHER");
  const [sourceType, setSourceType] = useState<"LINK" | "FILE">(
    initialValues?.sourceType ?? "LINK",
  );
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const linkOnly = isLinkOnlyDocumentType(fileType);
  const effectiveSourceType = linkOnly ? "LINK" : sourceType;
  const acceptAttribute = getAcceptAttributeForFileType(fileType);

  const visibleProjects = useMemo(
    () => (clientId ? projects.filter((p) => p.clientId === clientId) : projects),
    [clientId, projects],
  );

  const selectClass =
    "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  const locked = lockClientId || lockProjectId;

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-5">
      <Input
        label="Document name"
        name="name"
        defaultValue={initialValues?.name ?? ""}
        placeholder="e.g. Signed service agreement"
        required
        error={state.fieldErrors?.name}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="fileType" className="block text-sm font-medium text-slate-700">
            Document type
          </label>
          <select
            id="fileType"
            name="fileType"
            value={fileType}
            onChange={(event) => {
              const nextType = event.target.value as typeof fileType;
              setFileType(nextType);
              if (isLinkOnlyDocumentType(nextType)) {
                setSourceType("LINK");
              }
            }}
            required
            className={selectClass}
          >
            {documentFileTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.fileType ? (
            <p className="text-xs text-red-600">{state.fieldErrors.fileType}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-slate-700">Attachment method</span>
          {linkOnly ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Access credentials must be linked to a secure vault — file uploads are not
              allowed for this type.
            </p>
          ) : (
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sourceTypeUi"
                  checked={effectiveSourceType === "LINK"}
                  onChange={() => setSourceType("LINK")}
                />
                External link
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sourceTypeUi"
                  checked={effectiveSourceType === "FILE"}
                  onChange={() => setSourceType("FILE")}
                />
                Upload file
              </label>
            </div>
          )}
          <input type="hidden" name="sourceType" value={effectiveSourceType} />
        </div>
      </div>

      {effectiveSourceType === "LINK" ? (
        <Input
          label="Document URL"
          name="url"
          type="url"
          defaultValue={initialValues?.url ?? ""}
          placeholder="https://drive.google.com/..."
          required
          error={state.fieldErrors?.url}
        />
      ) : (
        <div className="space-y-1.5">
          <label htmlFor="file" className="block text-sm font-medium text-slate-700">
            File
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept={acceptAttribute}
            required={mode === "create"}
            onChange={(event) => {
              const file = event.target.files?.[0];
              setSelectedFileName(file?.name ?? null);
            }}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700"
          />
          {mode === "edit" && initialValues?.originalFileName ? (
            <p className="text-xs text-slate-500">
              Current file: {initialValues.originalFileName}
              {initialValues.fileSize ? ` (${formatFileSize(initialValues.fileSize)})` : ""}
              . Leave empty to keep it.
            </p>
          ) : null}
          {selectedFileName ? (
            <p className="text-xs text-slate-600">Selected: {selectedFileName}</p>
          ) : null}
          <p className="text-xs text-slate-500">
            Accepted formats depend on the document type. Max file size: 10 MB.
          </p>
          {state.fieldErrors?.file ? (
            <p className="text-xs text-red-600">{state.fieldErrors.file}</p>
          ) : null}
        </div>
      )}

      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-800">Attach to</p>

        {!locked ? (
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="linkTypeUi"
                checked={linkType === "client"}
                onChange={() => {
                  setLinkType("client");
                  setProjectId("");
                }}
              />
              Client
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="linkTypeUi"
                checked={linkType === "project"}
                onChange={() => {
                  setLinkType("project");
                }}
              />
              Project
            </label>
          </div>
        ) : null}

        {lockProjectId && projectId ? (
          <>
            <input type="hidden" name="projectId" value={projectId} />
            <input
              type="hidden"
              name="clientId"
              value={clientId || projects.find((p) => p.id === projectId)?.clientId || ""}
            />
            <p className="text-sm text-slate-700">
              Project:{" "}
              {visibleProjects.find((p) => p.id === projectId)?.name ?? "Selected project"}
            </p>
            {relatedClientLabel ? (
              <p className="text-sm text-slate-600">Client: {relatedClientLabel}</p>
            ) : null}
          </>
        ) : lockClientId && clientId ? (
          <>
            <input type="hidden" name="clientId" value={clientId} />
            <input type="hidden" name="projectId" value="" />
            <p className="text-sm text-slate-700">
              Client:{" "}
              {clients.find((c) => c.id === clientId)
                ? entityLabel(
                    clients.find((c) => c.id === clientId)!.name,
                    clients.find((c) => c.id === clientId)!.businessName,
                  )
                : "Selected client"}
            </p>
          </>
        ) : linkType === "project" ? (
          <>
            <div className="space-y-1.5">
              <label
                htmlFor="projectId"
                className="block text-sm font-medium text-slate-700"
              >
                Project
              </label>
              <select
                id="projectId"
                name="projectId"
                value={projectId}
                onChange={(e) => {
                  const next = e.target.value;
                  setProjectId(next);
                  const project = projects.find((p) => p.id === next);
                  if (project) setClientId(project.clientId);
                }}
                className={selectClass}
              >
                <option value="">Select a project</option>
                {visibleProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({entityLabel(project.client.name, project.client.businessName)})
                  </option>
                ))}
              </select>
            </div>
            <input type="hidden" name="clientId" value={clientId} />
          </>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="clientId" className="block text-sm font-medium text-slate-700">
              Client
            </label>
            <select
              id="clientId"
              name="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className={selectClass}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {entityLabel(client.name, client.businessName)}
                </option>
              ))}
            </select>
            <input type="hidden" name="projectId" value="" />
          </div>
        )}

        {state.fieldErrors?.clientId ? (
          <p className="text-xs text-red-600">{state.fieldErrors.clientId}</p>
        ) : null}
        {state.fieldErrors?.projectId ? (
          <p className="text-xs text-red-600">{state.fieldErrors.projectId}</p>
        ) : null}
      </div>

      <Textarea
        label="Notes"
        name="notes"
        rows={3}
        defaultValue={initialValues?.notes ?? ""}
        placeholder="What this document contains, version, or access instructions..."
      />

      <DocumentClientSharingFields initialValues={initialValues} />

      {linkOnly ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          For Access Credentials, link to a secure password manager or vault record. Never
          store passwords in OIS Command Center.
        </p>
      ) : null}

      {state.error && !state.fieldErrors ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Saving..."
          : mode === "create"
            ? "Save document"
            : "Save changes"}
      </Button>
    </form>
  );
}
