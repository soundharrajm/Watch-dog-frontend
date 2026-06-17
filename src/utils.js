// utils.js — shared helpers for all pages

export const NGROK_HEADERS = {
  'bypass-tunnel-reminder'    : 'true',
  'ngrok-skip-browser-warning': 'true',
}

export const apiFetch = (url, opts = {}) =>
  fetch(url, { ...opts, headers: { ...NGROK_HEADERS, ...opts.headers } })

export const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)))

export const fromB64 = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0))

export async function importPublicKey(pem) {
  const b64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '')
  const der = fromB64(b64)
  return crypto.subtle.importKey(
    'spki', der.buffer,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    true,
    ['encrypt']
  )
}

export async function getFingerprint(pem) {
  const b64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '')
  const der  = fromB64(b64)
  const hash = await crypto.subtle.digest('SHA-256', der.buffer)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join(':')
    .slice(0, 47) + '...'
}

export async function encryptHybrid(obj, cryptoKey) {
  const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
  const iv     = crypto.getRandomValues(new Uint8Array(12))
  const pt     = new TextEncoder().encode(JSON.stringify(obj))
  const ct     = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, pt)

  const aesBytes = new Uint8Array(12 + ct.byteLength)
  aesBytes.set(iv, 0)
  aesBytes.set(new Uint8Array(ct), 12)

  const rawAes = await crypto.subtle.exportKey('raw', aesKey)
  const rsaCt  = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, cryptoKey, rawAes)

  return { rsa: toB64(rsaCt), aes: toB64(aesBytes) }
}
