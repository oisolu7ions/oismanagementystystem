import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type ReceiptPdfInput = {
  receiptNumber: string;
  invoiceNumber: string;
  amount: string;
  paidAt: Date;
  clientName: string;
  clientBusiness?: string | null;
  clientEmail?: string | null;
  projectName?: string | null;
  notes?: string | null;
  billingPeriodLabel?: string | null;
};

const slate900 = rgb(0.06, 0.09, 0.16);
const slate600 = rgb(0.28, 0.34, 0.41);
const slate500 = rgb(0.39, 0.45, 0.55);
const slate400 = rgb(0.58, 0.64, 0.72);

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateReceiptPdf(input: ReceiptPdfInput): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width: pageWidth, height } = page.getSize();
  const margin = 56;
  const contentWidth = pageWidth - margin * 2;
  let y = height - margin;

  const logoBytes = await readFile(path.join(process.cwd(), "OIS.png"));
  const logo = await pdfDoc.embedPng(logoBytes);
  const logoWidth = 280;
  const logoHeight = logoWidth * (logo.height / logo.width);
  page.drawImage(logo, {
    x: (pageWidth - logoWidth) / 2,
    y: (height - logoHeight) / 2,
    width: logoWidth,
    height: logoHeight,
    opacity: 0.1,
  });

  const drawLine = (
    text: string,
    options: {
      size?: number;
      font?: typeof regular;
      color?: ReturnType<typeof rgb>;
      gap?: number;
    } = {},
  ) => {
    const size = options.size ?? 12;
    const font = options.font ?? regular;
    const color = options.color ?? slate900;
    const gap = options.gap ?? size * 1.45;

    page.drawText(text, {
      x: margin,
      y: y - size,
      size,
      font,
      color,
      maxWidth: contentWidth,
    });
    y -= gap;
  };

  drawLine("OIS — Owolabi IT Solutions", { size: 22, font: bold, gap: 28 });
  drawLine("Payment Receipt", { size: 11, color: slate500, gap: 34 });

  drawLine("RECEIPT NUMBER", { size: 10, color: slate400, gap: 16 });
  drawLine(input.receiptNumber, { size: 16, font: bold, gap: 28 });

  drawLine("PAID ON", { size: 10, color: slate400, gap: 16 });
  drawLine(formatDate(input.paidAt), { size: 12, gap: 30 });

  if (input.billingPeriodLabel) {
    drawLine("BILLING PERIOD", { size: 10, color: slate400, gap: 16 });
    drawLine(input.billingPeriodLabel, { size: 12, gap: 30 });
  }

  drawLine("BILLED TO", { size: 10, color: slate400, gap: 16 });
  drawLine(input.clientName, { size: 12, font: bold, gap: 18 });
  if (input.clientBusiness) {
    drawLine(input.clientBusiness, { size: 11, color: slate600, gap: 16 });
  }
  if (input.clientEmail) {
    drawLine(input.clientEmail, { size: 11, color: slate600, gap: 30 });
  } else {
    y -= 12;
  }

  drawLine("PAYMENT DETAILS", { size: 10, color: slate400, gap: 16 });
  drawLine(`Invoice: ${input.invoiceNumber}`, { size: 11, gap: 16 });
  if (input.projectName) {
    drawLine(`Project: ${input.projectName}`, { size: 11, gap: 18 });
  }
  drawLine(`Amount paid: ${input.amount}`, { size: 18, font: bold, gap: 30 });

  if (input.notes?.trim()) {
    drawLine("NOTES", { size: 10, color: slate400, gap: 16 });
    const notes = input.notes.trim();
    const notesHeight = Math.ceil(notes.length / 70) * 14 + 8;

    page.drawText(notes, {
      x: margin,
      y: y - 11,
      size: 11,
      font: regular,
      color: slate600,
      maxWidth: contentWidth,
      lineHeight: 14,
    });
    y -= notesHeight + 20;
  }

  drawLine(
    "Thank you for your payment. This receipt confirms that payment has been received by OIS — Owolabi IT Solutions.",
    { size: 10, color: slate500, gap: 14 },
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
