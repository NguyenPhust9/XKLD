import "server-only";

export const ADMIN_SESSION_COOKIE = "jinmu_admin_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

function getSessionSecret() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  return username && password ? `${username}:${password}:jinmu-admin-session` : null;
}

async function signatureFor(expiresAt: string) {
  const secret = getSessionSecret();
  if (!secret) return null;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(expiresAt));
  return Buffer.from(signature).toString("base64url");
}

export function hasAdminCredentials() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

export function isValidAdminLogin(username: string, password: string) {
  return hasAdminCredentials() && username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
}

export async function createAdminSession() {
  const expiresAt = String(Date.now() + SESSION_DURATION_MS);
  const signature = await signatureFor(expiresAt);
  return signature ? `${expiresAt}.${signature}` : null;
}

export async function verifyAdminSession(token: string | undefined) {
  if (!token) return false;
  const [expiresAt, signature, ...rest] = token.split(".");
  if (!expiresAt || !signature || rest.length || Number(expiresAt) <= Date.now()) return false;
  const expected = await signatureFor(expiresAt);
  if (!expected || expected.length !== signature.length) return false;

  const encoder = new TextEncoder();
  const suppliedBytes = encoder.encode(signature);
  const expectedBytes = encoder.encode(expected);
  let difference = 0;
  for (let index = 0; index < suppliedBytes.length; index += 1) difference |= suppliedBytes[index] ^ expectedBytes[index];
  return difference === 0;
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/admin",
  maxAge: SESSION_DURATION_MS / 1000,
};
