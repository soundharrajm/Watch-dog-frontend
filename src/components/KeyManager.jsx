import { useState } from 'react'
import { apiFetch, importPublicKey, getFingerprint } from '../utils.js'
import { Btn, ResultBox, Section, Badge, inp, lbl } from '../ui.jsx'

export default function KeyManager({ state, update }) {
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [resType, setResType] = useState('info')

  const fetchKey = async () => {
    setLoading(true)
    try {
      const r = await apiFetch(`${state.apiUrl}/config/public-key`)
      if (!r.ok) throw new Error(`HTTP ${r.status} — make sure backend is running`)
      const d   = await r.json()
      const pem = d.public_key
      const key = await importPublicKey(pem)
      const fp  = await getFingerprint(pem)
      update({ publicKey: key, publicKeyPem: pem, fingerprint: fp })
      setResult(`✓ Public key loaded\n\nFingerprint: ${fp}\n\nKey type: RSA-OAEP SHA-256\nKey size: 2048 bits\n\nThis key is valid until the backend restarts.\nEvery restart generates a new keypair.`)
      setResType('ok')
    } catch(e) {
      setResult(`✗ Failed: ${e.message}`)
      setResType('err')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl">
      <Section title="RSA key management" subtitle="Fetch and inspect the backend RSA public key">
        <div className="flex items-center gap-3 mb-4">
          <Btn onClick={fetchKey} disabled={loading}>{loading ? '⏳ Fetching…' : '🔑 Fetch public key'}</Btn>
          {state.publicKey && <Badge color="ok">✓ Key loaded</Badge>}
          {state.fingerprint && <span className="text-[10px] text-slate-600 font-mono">{state.fingerprint}</span>}
        </div>

        {state.publicKeyPem && (
          <>
            <label className={lbl}>PEM (public key only — safe to share)</label>
            <textarea value={state.publicKeyPem} readOnly rows={8}
              className={`${inp} resize-none text-[10px] mb-3`} />
            <Btn onClick={() => navigator.clipboard.writeText(state.publicKeyPem)} color="secondary">📋 Copy PEM</Btn>
          </>
        )}

        <ResultBox data={result} type={resType} />
      </Section>

      <Section title="How the keypair works" subtitle="RSA-OAEP asymmetric encryption">
        <div className="space-y-3 text-xs text-slate-400">
          {[
            ['🔑 Public key',  'Served via GET /config/public-key — safe to expose. Used by frontend to ENCRYPT payloads. Cannot decrypt.'],
            ['🔒 Private key', 'Generated in backend RAM on startup. NEVER sent over network. Used to DECRYPT incoming payloads. Lost on restart.'],
            ['🔄 Rotation',    'Every backend restart generates a new keypair. Frontend must fetch fresh public key after each restart.'],
            ['🛡 Why hybrid',  'RSA can only encrypt small data. So we encrypt the payload with AES-256-GCM, then encrypt the AES key with RSA. Backend decrypts AES key with RSA, then decrypts payload with AES.'],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <span className="text-sm flex-shrink-0">{title.split(' ')[0]}</span>
              <div>
                <p className="font-semibold text-slate-300 mb-0.5">{title.split(' ').slice(1).join(' ')}</p>
                <p className="text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
