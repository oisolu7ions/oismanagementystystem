import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getDocumentFilePath } from "@/lib/documents/storage";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const document = await prisma.documentLink.findUnique({ where: { id } });

  if (!document || document.sourceType !== "FILE" || !document.storedFileName) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const fileBuffer = await readFile(getDocumentFilePath(document.storedFileName));
    const fileName = document.originalFileName ?? document.name;

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.mimeType ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
