import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getUpdateRequestFilePath } from "@/lib/update-requests/storage";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string; attachmentId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id, attachmentId } = await context.params;

  const attachment = await prisma.updateRequestAttachment.findFirst({
    where: {
      id: attachmentId,
      updateRequestId: id,
    },
  });

  if (!attachment?.storedFileName) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const fileBuffer = await readFile(getUpdateRequestFilePath(attachment.storedFileName));
    const fileName = attachment.fileName ?? "attachment";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": attachment.mimeType ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
