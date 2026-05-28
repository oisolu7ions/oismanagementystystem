export const CLIENT_STATUS_VALUES = [
  "ACTIVE",
  "INACTIVE",
  "PAST_CLIENT",
  "PROSPECT",
] as const;

export type ClientStatusValue = (typeof CLIENT_STATUS_VALUES)[number];

export const clientStatusOptions: { value: ClientStatusValue; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "PAST_CLIENT", label: "Past Client" },
  { value: "PROSPECT", label: "Prospect" },
];

export function getClientStatusLabel(status: ClientStatusValue | string): string {
  return clientStatusOptions.find((o) => o.value === status)?.label ?? status;
}
