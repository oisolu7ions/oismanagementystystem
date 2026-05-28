import { Badge } from "@/components/ui/badge";

export function PackageStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "success" : "muted"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
