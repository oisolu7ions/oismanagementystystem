"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

type LinkRow = { id: string };

export function UpdateRequestAttachmentsFields({
  showHelp = false,
}: {
  showHelp?: boolean;
}) {
  const [linkRows, setLinkRows] = useState<LinkRow[]>([{ id: "link-0" }]);

  function addLinkRow() {
    setLinkRows((rows) => [...rows, { id: `link-${rows.length}` }]);
  }

  function removeLinkRow(id: string) {
    setLinkRows((rows) => (rows.length === 1 ? rows : rows.filter((row) => row.id !== id)));
  }

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div>
        <p className="text-sm font-medium text-slate-900">
          Attach screenshots, files, or links
        </p>
        {showHelp ? (
          <p className="mt-1 text-xs text-slate-500">
            Upload images, PDFs, or Word documents — or paste Google Drive, Dropbox, or
            Nextcloud links.
          </p>
        ) : null}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Upload files</label>
        <input
          type="file"
          name="files"
          multiple
          accept=".pdf,.doc,.docx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.gif,.svg,.zip"
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-700">External links</p>
          <Button type="button" size="sm" variant="secondary" onClick={addLinkRow}>
            <Plus className="h-4 w-4" />
            Add link
          </Button>
        </div>

        {linkRows.map((row, index) => (
          <div key={row.id} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3">
            <Input
              label="Link URL"
              name="externalUrl"
              type="url"
              placeholder="https://drive.google.com/..."
            />
            <Input
              label="Link label (optional)"
              name="externalName"
              placeholder="Logo files folder"
            />
            <Textarea
              label="Notes (optional)"
              name="externalNotes"
              rows={2}
              placeholder="These are the updated homepage photos."
            />
            {linkRows.length > 1 ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => removeLinkRow(row.id)}
              >
                <Trash2 className="h-4 w-4" />
                Remove link
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
