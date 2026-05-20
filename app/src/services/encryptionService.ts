const APP_SECRET = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET ?? "pulsechat-e2e-secret-2024-xK9mP3qR";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function deriveKey(conversationId: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(APP_SECRET + conversationId),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: encoder.encode(conversationId), iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

const keyCache = new Map<string, CryptoKey>();

async function getKey(conversationId: string): Promise<CryptoKey> {
  if (keyCache.has(conversationId)) return keyCache.get(conversationId)!;
  const key = await deriveKey(conversationId);
  keyCache.set(conversationId, key);
  return key;
}

export async function encryptText(plaintext: string, conversationId: string): Promise<string> {
  if (!plaintext) return plaintext;
  try {
    const key = await getKey(conversationId);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(plaintext));
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);
    return btoa(String.fromCharCode(...combined));
  } catch {
    return plaintext;
  }
}

export async function decryptText(value: string, conversationId: string): Promise<string> {
  if (!value || !isEncrypted(value)) return value;
  try {
    const key = await getKey(conversationId);
    const combined = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return decoder.decode(plainBuffer);
  } catch {
    return value; // legacy plaintext — return as-is
  }
}

/**
 * AES-GCM output: 12 bytes IV + min 16 bytes tag = 28 bytes minimum → base64 length ≥ 40.
 * Plaintext messages have spaces or are short, so this heuristic is safe.
 */
function isEncrypted(value: string): boolean {
  if (value.length < 40) return false;
  if (value.includes(" ")) return false;
  return /^[A-Za-z0-9+/]+=*$/.test(value);
}
