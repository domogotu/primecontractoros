import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { storagePut } from "../storage";

const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;
const MAX_REDIRECTS = 5;

const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "application/octet-stream",
]);

export interface PersistSamAttachmentInput {
  workspaceId: number;
  opportunityId: number;
  fileName: string;
  sourceUrl: string;
  declaredType?: string | null;
}

export interface PersistSamAttachmentResult {
  downloaded: boolean;
  storagePath?: string;
  contentType?: string;
  sizeBytes?: number;
  warning?: string;
}

function safeFileName(name: string): string {
  return (name || "attachment")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 180) || "attachment";
}

export function isPrivateAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    const parts = address.split(".").map(Number);
    if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;
    const [a, b] = parts;
    return a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 0) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 192 && b === 0 && parts[2] === 2) ||
      (a === 198 && b === 51 && parts[2] === 100) ||
      (a === 203 && b === 0 && parts[2] === 113) ||
      a >= 224;
  }
  if (version === 6) {
    const lower = address.toLowerCase();
    if (lower === "::" || lower === "::1") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb") || lower.startsWith("ff")) return true;
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return false;
  }
  return true;
}

export function isAllowedSamAttachmentUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

async function validatePublicHttpsUrl(rawUrl: string): Promise<URL> {
  if (!isAllowedSamAttachmentUrl(rawUrl)) throw new Error("Attachment URL must be credential-free HTTPS.");
  const url = new URL(rawUrl);
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) throw new Error("Local attachment hosts are not allowed.");
  if (isIP(host) && isPrivateAddress(host)) throw new Error("Private attachment hosts are not allowed.");
  const addresses = await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("Attachment host resolves to a non-public address.");
  }
  return url;
}

async function fetchValidated(rawUrl: string, redirects = 0): Promise<Response> {
  const target = await validatePublicHttpsUrl(rawUrl);
  const response = await fetch(target, {
    redirect: "manual",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { Accept: "*/*" },
  });
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    if (redirects >= MAX_REDIRECTS) throw new Error("Attachment exceeded redirect limit.");
    const location = response.headers.get("location");
    if (!location) throw new Error("Attachment redirect did not include a location.");
    return fetchValidated(new URL(location, target).toString(), redirects + 1);
  }
  return response;
}

export async function persistSamAttachment(input: PersistSamAttachmentInput): Promise<PersistSamAttachmentResult> {
  try {
    const response = await fetchValidated(input.sourceUrl);
    if (!response.ok) return { downloaded: false, warning: `Attachment download returned HTTP ${response.status}.` };

    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > MAX_ATTACHMENT_BYTES) {
      return { downloaded: false, warning: "Attachment exceeds the 25 MB automatic-download limit." };
    }

    const contentType = (response.headers.get("content-type") || input.declaredType || "application/octet-stream")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      return { downloaded: false, warning: `Attachment content type ${contentType} is not eligible for automatic storage.` };
    }

    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_ATTACHMENT_BYTES) {
      return { downloaded: false, warning: "Attachment exceeds the 25 MB automatic-download limit." };
    }

    const relKey = `workspaces/${input.workspaceId}/opportunities/${input.opportunityId}/sam/${safeFileName(input.fileName)}`;
    const stored = await storagePut(relKey, bytes, contentType);
    return { downloaded: true, storagePath: stored.key, contentType, sizeBytes: bytes.byteLength };
  } catch (error: any) {
    return { downloaded: false, warning: `Attachment could not be stored automatically: ${error?.message || "unknown error"}` };
  }
}
