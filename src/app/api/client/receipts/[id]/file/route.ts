import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth/client-session";
import { clientVisibleReceiptWhere } from "@/lib/client-portal/visibility";
import { getReceiptFilePath } from "@/lib/receipts/storage";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getClientSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const receipt = await prisma.receipt.findFirst({
    where: {
      id,
      ...clientVisibleReceiptWhere(session.clientId),
    },
  });

  if (!receipt) {
    return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
  }

  try {
    const fileBuffer = await readFile(getReceiptFilePath(receipt.storedFileName));

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": receipt.mimeType,
        "Content-Disposition": `inline; filename="${receipt.originalFileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "Receipt file not found" }, { status: 404 });
  }
}
