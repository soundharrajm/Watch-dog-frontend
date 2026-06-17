import { useState } from 'react'
import { apiFetch } from '../utils.js'
import { Btn, ResultBox, Section, inp, lbl } from '../ui.jsx'

export default function Decryptor({ state, update }) {
  const [rsa,     setRsa]     = useState(state.encrypted?.rsa || '')
  const [aes,     setAes]     = useState(state.encrypted?.aes || '')
  const [result,  setResult]  = useState(null)
  const [resType, setResType] = useState('info')
  const [loading, setLoading] = useState(false)

  // Auto-fill from encrypted state
  const fillFromEncryptor = () => {
    if (state.encrypted) {
      setRsa(state.encrypted.rsa)
      setAes(state.encrypted.aes)
    }
  }

  const verify = async () => {
    if (!rsa || !aes) { setResult('⚠ Paste both rsa and aes values'); setResType('err'); return }
    setLoading(true)
    try {
      const r = await apiFetch(`${state.apiUrl}/debug/decrypt-test`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ rsa, aes }),
      })
      const d = await r.json()
      if (d.status === 'ok') {
        setResult(`✓ Decryption successful!\n\nDecrypted payload:\n${JSON.stringify(d.decrypted, null, 2)}`)
        setResType('ok')
      } else {
        setResult(`✗ ${d.detail || JSON.stringify(d)}\n\nCommon causes:\n• Backend restarted after payload was encrypted\n• Wrong rsa/aes values pasted\n• DEBUG=true not set in backend .env`)
        setResType('err')
      }
    } catch(e) {
      setResult(`✗ Request failed: ${e.message}\n\nMake sure:\n• Backend is running\n• DEBUG=true in backend .env\n• Backend URL is correct: ${state.apiUrl}`)
      setResType('err')
    } finally { setLoading(false) }
  }

  const clear = () => { setRsa(''); setAes(''); setResult(null) }

  return (
    <div className="max-w-4xl">
      <Section title="Paste & verify decryption"
        subtitle="Paste any { rsa, aes } payload captured from Network tab to verify backend can decrypt it">

        <div className="flex gap-2 mb-4">
          {state.encrypted && (
            <Btn onClick={fillFromEncryptor} color="secondary">⬆ Fill from Encryptor</Btn>
          )}
          <Btn onClick={clear} color="secondary">🗑 Clear</Btn>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>RSA value (base64) — encrypted AES key</label>
            <textarea value={rsa} onChange={e => setRsa(e.target.value)} rows={6}
              className={`${inp} resize-none text-[10px] mb-3`}
              placeholder="Paste rsa value from Network tab or Encryptor page..." />

            <label className={lbl}>AES value (base64) — encrypted payload</label>
            <textarea value={aes} onChange={e => setAes(e.target.value)} rows={4}
              className={`${inp} resize-none text-[10px]`}
              placeholder="Paste aes value..." />
          </div>

          <div>
            <label className={lbl}>Decrypted result</label>
            <textarea value={result && resType === 'ok' ?
              (() => { try { return JSON.stringify(JSON.parse(result.split('\n\nDecrypted payload:\n')[1]), null, 2) } catch { return result } })()
              : ''} readOnly rows={11}
              className={`${inp} resize-none`} placeholder="Decrypted JSON appears here..." />
          </div>
        </div>

        <div className="mt-4">
          <Btn onClick={verify} disabled={loading}>{loading ? '⏳ Verifying…' : '🔓 Decrypt & verify'}</Btn>
        </div>

        <ResultBox data={result} type={resType} />
      </Section>

      <Section title="How to capture payload from Network tab">
        <div className="space-y-2 text-xs text-slate-500">
          <div className="flex gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <span className="text-slate-400 font-bold w-5">1</span>
            <span>Open browser DevTools → Network tab → Filter by <code className="text-violet-400">Fetch/XHR</code></span>
          </div>
          <div className="flex gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <span className="text-slate-400 font-bold w-5">2</span>
            <span>In Watchdog Settings → enter secret → click Unlock</span>
          </div>
          <div className="flex gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <span className="text-slate-400 font-bold w-5">3</span>
            <span>Find the <code className="text-violet-400">auth</code> request → click it → Payload tab</span>
          </div>
          <div className="flex gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <span className="text-slate-400 font-bold w-5">4</span>
            <span>Copy the <code className="text-violet-400">rsa</code> value and <code className="text-violet-400">aes</code> value → paste above</span>
          </div>
          <div className="flex gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <span className="text-slate-400 font-bold w-5">5</span>
            <span>Click Decrypt & verify — backend decrypts and shows the original payload</span>
          </div>
        </div>
      </Section>
    </div>
  )
}
