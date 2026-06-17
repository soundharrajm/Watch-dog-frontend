const NGROK_HEADERS = {
  'bypass-tunnel-reminder'    : 'true',
  'ngrok-skip-browser-warning': 'true',
}
export async function apiFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { ...NGROK_HEADERS, ...options.headers },
  })
}
