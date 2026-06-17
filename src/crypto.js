let _cachedPublicKey = null

async function getPublicKey(apiUrl) {
  if (_cachedPublicKey) return _cachedPublicKey
  const r = await fetch(`${apiUrl}/config/public-key`, {
    headers: { 'bypass-tunnel-reminder':'true', 'ngrok-skip-browser-warning':'true' }
  })
  const data = await r.json()
  const pem  = data.public_key
  const b64  = pem.replace('-----BEGIN PUBLIC KEY-----','').replace('-----END PUBLIC KEY-----','').replace(/\s/g,'')
  const der  = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  _cachedPublicKey = await crypto.subtle.importKey(
    'spki', der.buffer,
    { name:'RSA-OAEP', hash:'SHA-256' },
    false, ['encrypt']
  )
  return _cachedPublicKey
}

export async function encryptPayload(obj, apiUrl) {
  const publicKey = await getPublicKey(apiUrl)
  const aesKey    = await crypto.subtle.generateKey({ name:'AES-GCM', length:256 }, true, ['encrypt'])
  const iv        = crypto.getRandomValues(new Uint8Array(12))
  const pt        = new TextEncoder().encode(JSON.stringify(obj))
  const ct        = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, aesKey, pt)
  const aesBytes  = new Uint8Array(12 + ct.byteLength)
  aesBytes.set(iv, 0); aesBytes.set(new Uint8Array(ct), 12)
  const rawAes    = await crypto.subtle.exportKey('raw', aesKey)
  const rsaCt     = await crypto.subtle.encrypt({ name:'RSA-OAEP' }, publicKey, rawAes)
  const toB64     = buf => btoa(String.fromCharCode(...new Uint8Array(buf)))
  return { rsa: toB64(rsaCt), aes: toB64(aesBytes) }
}

export function clearKeyCache() { _cachedPublicKey = null }
