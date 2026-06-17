import { useState } from 'react'
import { apiFetch, encryptHybrid } from '../utils.js'
import { Btn, ResultBox, Section, Badge, inp, lbl } from '../ui.jsx'

const PRESETS = {
  'Auth secret'     : { secret: 'watchdog-admin' },
  'Cloud config'    : { provider: 'gcp', config: { enabled: true, project_id: 'ott-platform-prod' } },
  'Detection rules' : { max_concurrent_ips: 3, max_tokens_per_ip: 5, dedup_window_sec: 60 },
  'Change secret'   : { current_secret: 'watchdog-admin', new_secret: 'my-new-secret' },
  'Custom'          : {},
}

export default function Encryptor({ state, update }) {
  const [preset,    setPreset]    = useState('Auth secret')
  const [plaintext, setPlaintext] = useState(JSON.stringify({ secret: 'watchdog-admin' }, null, 2))
  const [loading,   setLoading]   = useState({})
  const [encResult, setEncResult] = useState(null)
  const [encType,   setEncType]   = useState('info')
  const [debugRes,  setDebugRes]  = useState(null)
  const [debugType, setDebugType] = useState('info')

  const setLoad = (k, v) => setLoading(p => ({ ...p, [k]: v }))

  const selectPreset = (name) => {
    setPreset(name)
    if (PRESETS[name] && Object.keys(PRESETS[name]).length > 0) {
      setPlaintext(JSON.stringify(PRESETS[name], null, 2))
    }
  }

  const encrypt = async () => {
    if (!state.publicKey) { setEncResult('⚠ Go to Key Manager and fetch the public key first'); setEncType('err'); return }
    setLoad('enc', true)
    try {
      const obj    = JSON.parse(plaintext)
      const result = await encryptHybrid(obj, state.publicKey)
      update({ encrypted: result })
      setEncResult(`✓ Encrypted successfully\n\nRSA (encrypted AES key):\n${result.rsa}\n\nAES (encrypted payload):\n${result.aes}\n\nPayload size: ${new TextEncoder().encode(plaintext).length} bytes → ${result.aes.length} chars (base64)`)
      setEncType('ok')
    } catch(e) {
      setEncResult(`✗ ${e.message}`); setEncType('err')
    } finally { setLoad('enc', false) }
  }

  const sendToDebug = async () => {
    if (!state.encrypted) { setDebugRes('⚠ Encrypt first'); setDebugType('err'); return }
    setLoad('debug', true)
    try {
      const r = await apiFetch(`${state.apiUrl}/debug/decrypt-test`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(state.encrypted),
      })
      const d = await r.json()
      if (d.status === 'ok') {
        setDebugRes(`✓ Backend decrypted successfully!\n\nDecrypted:\n${JSON.stringify(d.decrypted, null, 2)}\n\n${d.warning}`)
        setDebugType('ok')
      } else {
        setDebugRes(`✗ ${d.detail || JSON.stringify(d)}\n\nMake sure DEBUG=true in backend .env`)
        setDebugType('err')
      }
    } catch(e) {
      setDebugRes(`✗ ${e.message}`); setDebugType('err')
    } finally { setLoad('debug', false) }
  }

  return (
    <div className="max-w-4xl">
      <Section title="Encrypt payload" subtitle="Encrypt any JSON payload using RSA-OAEP + AES-256-GCM">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Preset:</span>
          {Object.keys(PRESETS).map(name => (
            <button key={name} onClick={() => selectPreset(name)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer
                ${preset === name ? 'bg-violet-600/20 border-violet-500/30 text-violet-300' : 'bg-white/[0.03] border-white/[0.08] text-slate-500 hover:text-slate-300'}`}>
              {name}
            </button>
          ))}
          {!state.publicKey && <Badge color="err">⚠ Fetch public key first</Badge>}
          {state.publicKey  && <Badge color="ok">Key ready</Badge>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Plaintext JSON</label>
            <textarea value={plaintext} onChange={e => setPlaintext(e.target.value)} rows={10}
              className={`${inp} resize-none`} placeholder='{"secret": "watchdog-admin"}' />
            <div className="mt-2">
              <Btn onClick={encrypt} disabled={loading.enc}>{loading.enc ? '⏳ Encrypting…' : '🔒 Encrypt'}</Btn>
            </div>
          </div>

          <div>
            <label className={lbl}>Encrypted output</label>
            <textarea value={state.encrypted ? JSON.stringify(state.encrypted, null, 2) : ''} readOnly rows={10}
              className={`${inp} resize-none text-[10px]`} placeholder="Encrypted { rsa, aes } appears here..." />
            <div className="mt-2 flex flex-wrap gap-2">
              <Btn onClick={() => navigator.clipboard.writeText(JSON.stringify(state.encrypted))} color="secondary" disabled={!state.encrypted}>📋 Copy</Btn>
              <Btn onClick={sendToDebug} color="green" disabled={!state.encrypted || loading.debug}>
                {loading.debug ? '⏳' : '📤 Verify with /debug/decrypt-test'}
              </Btn>
            </div>
          </div>
        </div>

        <ResultBox data={encResult} type={encType} />
      </Section>

      {debugRes && (
        <Section title="Debug verification result">
          <ResultBox data={debugRes} type={debugType} />
        </Section>
      )}
    </div>
  )
}
