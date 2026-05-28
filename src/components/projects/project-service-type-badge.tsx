import {
  getServiceTypeLabel,
  type ServiceTypeValue,
} from "@/lib/projects/constants";
import { Badge } from "@/components/ui/badge";

export function ProjectServiceTypeBadge({
  serviceType,
}: {
  serviceType: ServiceTypeValue;
}) {
  return <Badge variant="info">{getServiceTypeLabel(serviceType)}</Badge>;
}
