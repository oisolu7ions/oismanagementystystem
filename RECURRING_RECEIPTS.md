# Recurring receipts

This guide explains how recurring invoice receipts work in OIS Management Center, what triggers generation today, and how to set up **automatic** receipt creation when a new billing period starts (for example, creating July’s receipt on 1 July).

---

## Overview

Recurring invoices can generate **one PDF receipt per billing period**. Each receipt is linked to the invoice and tagged with a `billingPeriod` key (for example `2026-07` for July 2026 on a monthly invoice).

One-time invoices behave differently: a single receipt is created automatically when the invoice is marked **Paid**.

| Invoice type | Receipt behaviour |
|--------------|-------------------|
| One-time | One receipt when status changes to **Paid** |
| Recurring | One receipt per billing period (weekly, monthly, etc.) |

Receipt PDFs are stored on disk under `uploads/receipts/`. The database stores metadata including `billingPeriod`.

---

## How billing periods work

There is **no timer** or background process tracking periods inside the app.

When code needs the current period, it **calculates** it from today’s date and the invoice’s `recurrenceInterval` using `getBillingPeriodKey()` in `src/lib/receipts/billing-period.ts`.

| Interval | Period key example | Label example |
|----------|-------------------|---------------|
| Weekly | `2026-W24` | Week 24, 2026 |
| Biweekly | `2026-B12` | Period 12, 2026 |
| Monthly | `2026-07` | July 2026 |
| Quarterly | `2026-Q3` | Q3 2026 |
| Yearly | `2026` | 2026 |

When the calendar moves into a new period, a **new** receipt *can* be created — but only if something runs the generation logic on or after that date.

Duplicate receipts for the same invoice and period are blocked by a unique constraint on `(invoiceId, billingPeriod)`.

---

## What triggers receipt generation today

Recurring receipts are **not** created automatically when a new month (or week/quarter/year) starts unless you configure a scheduled job (see below).

### 1. Manual — single invoice

On the invoice detail page, recurring invoices show a **Recurring receipt** card with:

**Generate receipt for [current period]**

This creates the PDF for the current billing period without changing invoice status.

### 2. Manual — batch

On **Dashboard → Invoices**, if any recurring invoices are missing a receipt for the current period, a **Recurring receipts due** card appears with:

**Generate all due receipts**

This calls `generateDueRecurringReceipts()` for every eligible recurring invoice.

### 3. Mark as paid

When a recurring invoice is marked **Paid**, the app attempts to create a receipt for the **current** billing period. If a receipt for that period already exists, nothing new is created.

### What does not trigger generation

- Opening the invoices page (only lists what is due)
- The date changing at midnight (no built-in scheduler)
- Re-running generation for a period that already has a receipt

---

## Key code locations

| File | Purpose |
|------|---------|
| `src/lib/receipts/billing-period.ts` | Period key and display label |
| `src/lib/receipts/create-receipt.ts` | `createRecurringReceiptForPeriod`, `generateDueRecurringReceipts` |
| `src/actions/receipt-mutations.ts` | Server actions for manual and batch generation |
| `src/components/invoices/invoice-recurring-receipt-actions.tsx` | Per-invoice generate button |
| `src/components/invoices/recurring-receipts-batch-actions.tsx` | Batch generate on invoices list |

Core batch logic:

```ts
// src/lib/receipts/create-receipt.ts
export async function generateDueRecurringReceipts(referenceDate: Date = new Date())
```

This function:

1. Finds invoices where `isRecurring` is true, `recurrenceInterval` is set, and status is not `CANCELLED`
2. Computes the billing period for `referenceDate`
3. Skips invoices that already have a receipt for that period
4. Creates a new PDF receipt for the rest

---

## Automatic generation on period change

To answer **yes** to “Does it auto-create July’s receipt on 1 July?”, add a **scheduled job** that calls `generateDueRecurringReceipts()` on a regular cadence.

### Recommended approach

1. Add a protected API route (for example `GET /api/cron/recurring-receipts`)
2. Set a `CRON_SECRET` environment variable
3. Run a daily cron job on the server that calls that URL

Running **daily** is recommended (not only on the 1st of the month):

| Date | Monthly invoice behaviour |
|------|---------------------------|
| 30 June | Period `2026-06` — receipt exists → skip |
| 1 July | Period `2026-07` — no receipt → **create** |
| 2 July+ | Period `2026-07` — receipt exists → skip |

Duplicate protection makes daily runs safe.

### Step 1 — Environment variable

Add to `.env` on the server:

```env
CRON_SECRET="replace-with-a-long-random-secret"
```

Generate a secret:

```bash
openssl rand -base64 48
```

### Step 2 — API route (to implement)

Create `src/app/api/cron/recurring-receipts/route.ts` that:

1. Verifies `Authorization: Bearer <CRON_SECRET>` (or an equivalent shared secret query param)
2. Calls `generateDueRecurringReceipts()`
3. Returns JSON with counts: `created`, `skipped`, `failed`

**Important:** Do not expose this endpoint without authentication. Anyone with the URL could otherwise trigger receipt generation.

**Middleware:** Cron routes under `/api/cron/` should **not** require a user session. The existing middleware protects `/api/receipts/` for downloads; the cron route must use `CRON_SECRET` only, not login cookies.

Example request after deploy:

```bash
curl -fsS \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/recurring-receipts
```

Example response shape:

```json
{
  "created": 2,
  "skipped": 5,
  "failed": 0,
  "total": 7
}
```

### Step 3 — Schedule on the VPS

OIS Management Center is intended to run on a VPS with persistent disk (see [PRODUCTION.md](./PRODUCTION.md)). Use **crontab** or a **systemd timer** on that server.

#### Option A — crontab (simplest)

```bash
crontab -e
```

Add (runs daily at 00:05 server time):

```cron
5 0 * * * curl -fsS -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/recurring-receipts >> /var/log/ois-recurring-receipts.log 2>&1
```

#### Option B — systemd timer

Use a `.service` unit that runs `curl` and a `.timer` unit that triggers it daily. Prefer this if you want journald logging and clearer operational control.

#### Option C — External cron service

Services such as [cron-job.org](https://cron-job.org) can HTTP-call your endpoint on a schedule if you prefer not to manage cron on the server. Still protect the route with `CRON_SECRET`.

---

## Timezone

Period keys use the **date at the moment the job runs** (server local time unless you pass an explicit `referenceDate`).

If the server is UTC but you want “1 July” in UK time:

- Set the server or cron timezone to `Europe/London`, or
- Adjust the cron route to compute `referenceDate` in your business timezone before calling `generateDueRecurringReceipts(referenceDate)`.

---

## Eligibility rules

By default, automatic and batch generation include recurring invoices that:

- Have `isRecurring: true`
- Have a `recurrenceInterval` set
- Are **not** `CANCELLED`

Invoice status does **not** need to be `PAID`. If you only want receipts for paid recurring invoices, filter by status inside the cron route or in `generateDueRecurringReceipts()`.

---

## Operations checklist

After enabling the cron job:

- [ ] `CRON_SECRET` set in production `.env`
- [ ] Cron API route deployed and returns 401 without the secret
- [ ] Daily cron entry added on the VPS (or external scheduler)
- [ ] `uploads/receipts/` is on persistent disk (same as document uploads)
- [ ] Spot-check on the 1st of a month: new receipts appear on recurring invoice detail pages
- [ ] Monitor logs for `failed` counts in the JSON response

---

## Manual workflow (no cron)

If you do not use a scheduler:

1. Each month (or period), open **Dashboard → Invoices**
2. Use **Generate all due receipts**, or open each recurring invoice and use **Generate receipt for [period]**

The **Recurring receipts due** card on the invoices list shows which invoices still need a receipt for the current period.

---

## Related docs

- [PRODUCTION.md](./PRODUCTION.md) — VPS deployment, env vars, persistent storage
- [README.md](./README.md) — Local development setup
