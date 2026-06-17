/**
 * crypto.js — RSA-OAEP + AES-256-GCM hybrid encryption
 * ======================================================
 * No hardcoded keys. Flow:
 *   1. Fetch RSA public key from backend
 *   2. Generate random AES-256 key in browser
 *   3. Encrypt payload with AES-256-GCM
 *   4. Encrypt AES key with RSA public key
 *   5. Send both — backend decrypts with private key (never exposed)
 *
 * Uses browser Web Crypto API — no external library.
 */

let _cachedPublicKey = null   // cache per session

/**
 * Fetch and import RSA public key from backend.
 */
async function getPublicKey(apiUrl) {
  if (_cachedPublicKey) return _cachedPublicKey
  const r    = await fetch(`${apiUrl}/config/public-key`)
  const data = await r.json()
  const pem  = data.public_key

  // Strip PEM headers and decode base64
  const b64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '')
  const der = Uint8Array.from(atob(b64), c => c.charCodeAt(0))

  _cachedPublicKey = await crypto.subtle.importKey(
    'spki', der.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  )
  return _cachedPublicKey
}

/**
 * Encrypt a payload object using hybrid RSA-OAEP + AES-256-GCM.
 * Returns { rsa: <base64>, aes: <base64> }
 */
export async function encryptPayload(obj, apiUrl) {
  const publicKey = await getPublicKey(apiUrl)

  // 1 — Generate random AES-256 key
  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,   // extractable so we can export it
    ['encrypt']
  )

  // 2 — Encrypt payload with AES-256-GCM
  const iv        = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = new TextEncoder().encode(JSON.stringify(obj))
  const aesCipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plaintext)

  // Combine iv + ciphertext
  const aesBytes = new Uint8Array(12 + aesCipher.byteLength)
  aesBytes.set(iv, 0)
  aesBytes.set(new Uint8Array(aesCipher), 12)

  // 3 — Export raw AES key bytes
  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey)

  // 4 — Encrypt AES key with RSA public key (RSA-OAEP)
  const rsaCipher = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    rawAesKey
  )

  // 5 — Base64 encode both
  const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)))

  return {
    rsa: toB64(rsaCipher),   // RSA-encrypted AES key
    aes: toB64(aesBytes),    // AES-encrypted payload
  }
}

/** Clear cached public key (call if backend restarts) */
export function clearKeyCache() {
  _cachedPublicKey = null
}
