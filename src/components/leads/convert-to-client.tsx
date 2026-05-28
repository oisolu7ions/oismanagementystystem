"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { convertLeadToClientAction } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";

type ConvertToClientProps = {
  leadId: string;
  leadName: string;
  clientId?: string | null;
  clientName?: string | null;
  convertedAt?: Date | null;
};

export function ConvertToClient({
  leadId,
  leadName,
  clientId,
  clientName,
  convertedAt,
}: ConvertToClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  if (clientId) {
    return (
      <Card>
        <CardHeader
          title="Converted to client"
          description="This lead has been won and linked to a client record."
        />
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            {convertedAt ? (
              <p>Converted on {convertedAt.toLocaleString()}.</p>
            ) : null}
            {clientName ? (
              <p className="mt-1 font-medium text-slate-800">{clientName}</p>
            ) : null}
          </div>
          <Link href={`/dashboard/clients/${clientId}`}>
            <Button type="button">View client</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  function handleConvert() {
    setMessage(null);
    startTransition(async () => {
      const result = await convertLeadToClientAction(leadId);

      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }

      if (result.success && result.clientId) {
        setModalOpen(false);
        router.push(`/dashboard/clients/${result.clientId}?convertedFromLead=1`);
        router.refresh();
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader
          title="Convert to client"
          description="Create a client record from this lead and mark the lead as Won."
        />
        <CardBody className="space-y-4">
          <p className="text-sm text-slate-600">
            Contact details and notes will copy to the new client. The lead stays in
            your pipeline for history.
          </p>

          {message ? (
            <p
              className={[
                "rounded-lg border px-3 py-2 text-sm",
                message.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800",
              ].join(" ")}
            >
              {message.text}
            </p>
          ) : null}

          <Button type="button" onClick={() => setModalOpen(true)}>
            Convert to Client
          </Button>
        </CardBody>
      </Card>

      <Modal
        open={modalOpen}
        title="Convert lead to client?"
        description={`This will create a new client from "${leadName}", mark the lead as Won, and link them together.`}
        onClose={() => !pending && setModalOpen(false)}
      >
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>Creates a new client (status: Active)</li>
          <li>Copies name, business, contact, website, and notes</li>
          <li>Sets lead status to Won</li>
          <li>Keeps this lead record for history</li>
        </ul>
        <div className="mt-5 flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={pending} onClick={handleConvert}>
            {pending ? "Converting..." : "Confirm conversion"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
