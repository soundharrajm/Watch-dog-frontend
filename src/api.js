/**
 * Centralised fetch wrapper.
 * Adds ngrok bypass headers so all requests pass through the tunnel.
 */
const NGROK_HEADERS = {
  'bypass-tunnel-reminder'    : 'true',
  'ngrok-skip-browser-warning': 'true',
}

export async function apiFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      ...NGROK_HEADERS,
      ...options.headers,
    },
  })
}

export async function apiJson(url, options = {}) {
  const r = await apiFetch(url, options)
  return r.json()
}
