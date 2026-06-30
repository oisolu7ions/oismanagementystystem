import { Badge } from "@/components/ui/badge";

export function ClientVisibilityBadge({ visible }: { visible: boolean }) {
  return (
    <Badge variant={visible ? "success" : "muted"}>
      {visible ? "Client Visible" : "Hidden from Client"}
    </Badge>
  );
}

export function InternalOnlyBadge() {
  return <Badge variant="warning">Internal Only</Badge>;
}
