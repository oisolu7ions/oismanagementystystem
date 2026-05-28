import { Button } from "@/components/ui/button";

function normalizePaymentUrl(url: string) {
  return url.startsWith("http") ? url : `https://${url}`;
}

export function InvoicePaymentLink({ paymentLink }: { paymentLink: string | null }) {
  if (!paymentLink?.trim()) {
    return <span className="text-slate-500">—</span>;
  }

  const href = normalizePaymentUrl(paymentLink.trim());

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-sm text-slate-700 underline hover:text-slate-900"
      >
        {paymentLink}
      </a>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Button type="button" size="sm" variant="secondary">
          Open payment link
        </Button>
      </a>
    </div>
  );
}
