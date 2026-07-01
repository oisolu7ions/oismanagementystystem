import { getSecurityRequestInfo, logClientSecurityEvent } from "@/lib/client-security/security-events";

type FileUploadAuditInput = {
  userId?: string;
  clientUserId?: string;
  file: File;
  accepted: boolean;
  message: string;
  reason?: string;
  context?: Record<string, string | number | boolean | null | undefined>;
};

export async function logFileUploadSecurityEvent({
  userId,
  clientUserId,
  file,
  accepted,
  message,
  reason,
  context,
}: FileUploadAuditInput): Promise<void> {
  await logClientSecurityEvent({
    userId,
    clientUserId,
    type: accepted ? "FILE_UPLOAD_ACCEPTED" : "FILE_UPLOAD_REJECTED",
    message,
    requestInfo: await getSecurityRequestInfo(),
    metadata: {
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      reason,
      ...context,
    },
  });
}
