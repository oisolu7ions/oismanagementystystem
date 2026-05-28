import { Badge } from "@/components/ui/badge";

export function PackageBadge({
  name,
  isActive = true,
}: {
  name: string;
  isActive?: boolean;
}) {
  return (
    <Badge variant={isActive ? "info" : "muted"}>
      {name}
      {!isActive ? " (inactive)" : ""}
    </Badge>
  );
}
