import net from "net";
import tls from "tls";
import { getBusinessSettings, getEmailSettings } from "@/lib/settings";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type EmailDeliveryResult = "console" | "smtp" | "disabled";

type EmailRuntimeSettings = {
  from: string;
  replyTo?: string;
};

type BusinessEmailSettings = Awaited<ReturnType<typeof getBusinessSettings>>;

function getAppUrl(): string {
  return process.env.APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function getAbsoluteUrl(path: string): string {
  return `${getAppUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function extractEmailAddress(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match?.[1] ?? value).trim();
}

function normalizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function quoteDisplayName(value: string): string {
  return `"${normalizeHeaderValue(value).replace(/["\\]/g, "\\$&")}"`;
}

function withSenderDisplayName(from: string, senderName: string): string {
  const cleanFrom = normalizeHeaderValue(from);
  const cleanName = normalizeHeaderValue(senderName);
  const address = extractEmailAddress(cleanFrom);

  if (!cleanName || !address) return cleanFrom;
  return `${quoteDisplayName(cleanName)} <${address}>`;
}

function buildFooterLines(business: BusinessEmailSettings): string[] {
  const websiteUrl = business.websiteUrl.trim();
  return websiteUrl ? [`Website: ${websiteUrl}`] : [];
}

function appendBusinessFooter(message: EmailMessage, business: BusinessEmailSettings): EmailMessage {
  const footerLines = buildFooterLines(business);
  if (footerLines.length === 0) return message;

  const textFooter = ["", "--", ...footerLines].join("\n");
  const htmlFooter = [
    "<hr>",
    ...footerLines.map((line) => `<p>${escapeHtml(line)}</p>`),
  ].join("");

  return {
    ...message,
    text: `${message.text}${textFooter}`,
    html: message.html ? `${message.html}${htmlFooter}` : undefined,
  };
}

function createMimeBoundary(): string {
  return `ois-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function formatMimePart(contentType: string, body: string): string {
  return [
    `Content-Type: ${contentType}; charset=utf-8`,
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
  ].join("\r\n");
}

function buildMultipartAlternativeBody(text: string, html: string, boundary: string): string {
  return [
    `--${boundary}`,
    formatMimePart("text/plain", text),
    `--${boundary}`,
    formatMimePart("text/html", html),
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

function buildRawMessage(message: EmailMessage, settings: EmailRuntimeSettings): string {
  const headers = [
    `From: ${normalizeHeaderValue(settings.from)}`,
    `To: ${normalizeHeaderValue(message.to)}`,
    `Subject: ${normalizeHeaderValue(message.subject)}`,
    "MIME-Version: 1.0",
  ];

  if (settings.replyTo) {
    headers.splice(2, 0, `Reply-To: ${normalizeHeaderValue(settings.replyTo)}`);
  }

  if (message.html) {
    const boundary = createMimeBoundary();
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    const body = buildMultipartAlternativeBody(message.text, message.html, boundary);
    return `${headers.join("\r\n")}\r\n\r\n${body}`;
  }

  headers.push("Content-Type: text/plain; charset=utf-8");
  return `${headers.join("\r\n")}\r\n\r\n${message.text}`;
}

function readSmtpResponse(socket: net.Socket): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines.at(-1);

      if (lastLine && /^\d{3} /.test(lastLine)) {
        cleanup();
        resolve(lines.join("\n"));
      }
    };

    socket.on("error", onError);
    socket.on("data", onData);
  });
}

function upgradeToTls(socket: net.Socket, host: string): Promise<tls.TLSSocket> {
  return new Promise((resolve, reject) => {
    const secureSocket = tls.connect({ socket, servername: host }, () => {
      resolve(secureSocket);
    });
    secureSocket.once("error", reject);
  });
}

async function smtpCommand(socket: net.Socket, command: string, expected: number[]): Promise<string> {
  socket.write(`${command}\r\n`);
  const response = await readSmtpResponse(socket);
  const code = Number(response.slice(0, 3));
  if (!expected.includes(code)) {
    throw new Error(`SMTP command failed: ${response.trim()}`);
  }
  return response;
}

async function sendSmtpEmail(message: EmailMessage, settings: EmailRuntimeSettings): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    throw new Error("SMTP_HOST is required when email provider mode is smtp");
  }

  let socket: net.Socket = secure
    ? tls.connect({ host, port, servername: host })
    : net.connect({ host, port });

  await new Promise<void>((resolve, reject) => {
    socket.once(secure ? "secureConnect" : "connect", resolve);
    socket.once("error", reject);
  });

  try {
    await readSmtpResponse(socket);
    await smtpCommand(socket, "EHLO localhost", [250]);

    if (!secure) {
      await smtpCommand(socket, "STARTTLS", [220]);
      socket = await upgradeToTls(socket, host);
      await smtpCommand(socket, "EHLO localhost", [250]);
    }

    if (user && pass) {
      const auth = Buffer.from(`\0${user}\0${pass}`).toString("base64");
      await smtpCommand(socket, `AUTH PLAIN ${auth}`, [235]);
    }

    await smtpCommand(socket, `MAIL FROM:<${extractEmailAddress(settings.from)}>`, [250]);
    await smtpCommand(socket, `RCPT TO:<${extractEmailAddress(message.to)}>`, [250, 251]);
    await smtpCommand(socket, "DATA", [354]);
    socket.write(`${buildRawMessage(message, settings).replace(/\r?\n\./g, "\r\n..")}\r\n.\r\n`);
    const dataResponse = await readSmtpResponse(socket);
    const dataCode = Number(dataResponse.slice(0, 3));
    if (dataCode !== 250) {
      throw new Error(`SMTP DATA failed: ${dataResponse.trim()}`);
    }
    await smtpCommand(socket, "QUIT", [221]);
  } finally {
    socket.end();
  }
}

export async function sendEmail(message: EmailMessage): Promise<EmailDeliveryResult> {
  const [emailSettings, businessSettings] = await Promise.all([
    getEmailSettings(),
    getBusinessSettings(),
  ]);
  const provider = emailSettings.providerMode;
  const fromAddress = emailSettings.from || "no-reply@localhost";
  const senderName = businessSettings.defaultSenderName || businessSettings.name || "OIS Management Center";
  const decoratedMessage = appendBusinessFooter(message, businessSettings);
  const runtimeSettings: EmailRuntimeSettings = {
    from: withSenderDisplayName(fromAddress, senderName),
    replyTo: emailSettings.replyTo || businessSettings.supportEmail || undefined,
  };

  if (provider === "disabled") {
    console.warn(`[OIS email:disabled] ${decoratedMessage.subject} to ${decoratedMessage.to}`);
    return "disabled";
  }

  if (provider === "smtp") {
    await sendSmtpEmail(decoratedMessage, runtimeSettings);
    return "smtp";
  }

  console.log("\n[OIS email:console]");
  console.log(`From: ${runtimeSettings.from}`);
  if (runtimeSettings.replyTo) console.log(`Reply-To: ${runtimeSettings.replyTo}`);
  console.log(`To: ${decoratedMessage.to}`);
  console.log(`Subject: ${decoratedMessage.subject}`);
  if (decoratedMessage.html) {
    console.log("--- text/plain ---");
    console.log(decoratedMessage.text);
    console.log("--- text/html ---");
    console.log(decoratedMessage.html);
  } else {
    console.log(decoratedMessage.text);
  }
  console.log("[/OIS email:console]\n");
  return "console";
}
