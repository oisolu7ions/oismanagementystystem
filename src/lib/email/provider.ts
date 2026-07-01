import net from "net";
import tls from "tls";
import { getEmailSettings } from "@/lib/settings";

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

function buildRawMessage(message: EmailMessage, settings: EmailRuntimeSettings): string {
  const headers = [
    `From: ${normalizeHeaderValue(settings.from)}`,
    `To: ${normalizeHeaderValue(message.to)}`,
    `Subject: ${normalizeHeaderValue(message.subject)}`,
    "MIME-Version: 1.0",
    message.html ? "Content-Type: text/html; charset=utf-8" : "Content-Type: text/plain; charset=utf-8",
  ];

  if (settings.replyTo) {
    headers.splice(2, 0, `Reply-To: ${normalizeHeaderValue(settings.replyTo)}`);
  }

  return `${headers.join("\r\n")}\r\n\r\n${message.html ?? message.text}`;
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
  const emailSettings = await getEmailSettings();
  const provider = emailSettings.providerMode;
  const runtimeSettings: EmailRuntimeSettings = {
    from: emailSettings.from || "OIS Management Center <no-reply@localhost>",
    replyTo: emailSettings.replyTo || undefined,
  };

  if (provider === "disabled") {
    console.warn(`[OIS email:disabled] ${message.subject} to ${message.to}`);
    return "disabled";
  }

  if (provider === "smtp") {
    await sendSmtpEmail(message, runtimeSettings);
    return "smtp";
  }

  console.log("\n[OIS email:console]");
  console.log(`From: ${runtimeSettings.from}`);
  if (runtimeSettings.replyTo) console.log(`Reply-To: ${runtimeSettings.replyTo}`);
  console.log(`To: ${message.to}`);
  console.log(`Subject: ${message.subject}`);
  console.log(message.text);
  console.log("[/OIS email:console]\n");
  return "console";
}
