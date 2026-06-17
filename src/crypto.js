/**
 * crypto.js
 * AES-GCM encryption for sensitive payloads.
 * Uses the browser's native Web Crypto API — no external library needed.
 *
 * The APP_ENCRYPT_KEY is a shared secret baked into the build.
 * It's not a password — it protects the payload in transit from
 * network logs, proxies, and interceptors.
 */

const APP_ENCRYPT_KEY = import.meta.env.VITE_ENCRYPT_KEY || 'watchdog-aes-key-32chars-minimum!'

// Derive a CryptoKey from the string key
async function getKey() {
  const enc     = new TextEncoder()
  const keyMat  = await crypto.subtle.importKey('raw', enc.encode(APP_ENCRYPT_KEY.slice(0,32).padEnd(32,'0')), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', salt: enc.encode('watchdog-salt'), iterations: 100000, hash:'SHA-256' },
    keyMat,
    { name:'AES-GCM', length:256 },
    false,
    ['encrypt','decrypt']
  )
}

/**
 * Encrypt a string payload.
 * Returns base64-encoded string: iv(12 bytes) + ciphertext
 */
export async function encrypt(plaintext) {
  const key    = await getKey()
  const iv     = crypto.getRandomValues(new Uint8Array(12))
  const enc    = new TextEncoder()
  const cipher = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, enc.encode(plaintext))
  // Combine iv + cipher into one base64 blob
  const combined = new Uint8Array(iv.byteLength + cipher.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(cipher), iv.byteLength)
  return btoa(String.fromCharCode(...combined))
}

/**
 * Encrypt a JSON payload object — returns { _enc: "base64..." }
 * Backend receives this, decrypts, and gets the original object back.
 */
export async function encryptPayload(obj) {
  const json      = JSON.stringify(obj)
  const encrypted = await encrypt(json)
  return { _enc: encrypted }
}
