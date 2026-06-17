import { useState } from 'react'
import { apiFetch, encryptHybrid, importPublicKey, getFingerprint } from '../utils.js'
import { Btn, ResultBox, Section, Badge, inp, lbl } from '../ui.jsx'

export default function AuthTester({ state, update }) {
  const [secret,  setSecret]  = useState('watchdog-admin')
  const [loading, setLoading] = useState(false)
  const [steps,   setSteps]   = useState([])
  const [result,  setResult]  = useState(null)
  const [resType, setResType] = useState('info')

  const addStep = (icon, text, status = 'ok') =>
    setSteps(p => [...p, { icon, text, status, time: new Date().toLocaleTimeString() }])

  const runFullAuth = async () => {
    setLoading(true)
    setSteps([])
    setResult(null)
    try {
      // Step 1 — Fetch public key
      addStep('⏳', 'Fetching RSA public key from backend...', 'pending')
      const kr = await apiFetch(`${state.apiUrl}/config/public-key`)
      if (!kr.ok) throw new Error(`Public key fetch failed: HTTP ${kr.status}`)
      const kd  = await kr.json()
      const key = await importPublicKey(kd.public_key)
      const fp  = await getFingerprint(kd.public_key)
      update({ publicKey: key, publicKeyPem: kd.public_key, fingerprint: fp })
      setSteps(p => p.map((s,i) => i === p.length-1 ? { ...s, icon:'✓', text:`Public key fetched\nFingerprint: ${fp}`, status:'ok' } : s))

      // Step 2 — Generate AES key
      addStep('⏳', 'Generating random AES-256 key...', 'pending')
      await new Promise(r => setTimeout(r, 100)) // visual pause
      setSteps(p => p.map((s,i) => i === p.length-1 ? { ...s, icon:'✓', text:'AES-256 key generated in browser memory', status:'ok' } : s))

      // Step 3 — Encrypt
      addStep('⏳', 'Encrypting payload with AES-256-GCM...', 'pending')
      const encrypted = await encryptHybrid({ secret }, key)
      setSteps(p => p.map((s,i) => i === p.length-1 ? { ...s, icon:'✓', text:`Payload encrypted\nRSA: ${encrypted.rsa.slice(0,40)}...\nAES: ${encrypted.aes.slice(0,40)}...`, status:'ok' } : s))

      // Step 4 — Encrypt AES key with RSA
      addStep('✓', 'AES key encrypted with RSA public key', 'ok')

      // Step 5 — POST auth
      addStep('⏳', 'POSTing encrypted payload to /config/auth...', 'pending')
      const ar = await apiFetch(`${state.apiUrl}/config/auth`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(encrypted),
      })
      const ad = await ar.json()

      if (ad.session_token) {
        setSteps(p => p.map((s,i) => i === p.length-1 ? { ...s, icon:'✓', text:`Auth successful!\nSession token: ${ad.session_token.slice(0,20)}...\nTTL: ${ad.ttl}s`, status:'ok' } : s))
        update({ sessionToken: ad.session_token, encrypted })
        setResult(`✓ Full auth flow complete!\n\nSession token: ${ad.session_token}\nExpires in: ${ad.ttl/3600}h\n\nEncrypted payload that was sent:\n${JSON.stringify(encrypted, null, 2)}\n\nNetwork tab shows only the encrypted blob — secret never in plaintext.`)
        setResType('ok')
      } else {
        setSteps(p => p.map((s,i) => i === p.length-1 ? { ...s, icon:'✗', text:`Auth failed: ${JSON.stringify(ad)}`, status:'err' } : s))
        setResult(`✗ Auth failed: ${JSON.stringify(ad, null, 2)}`)
        setResType('err')
      }

    } catch(e) {
      setSteps(p => [...p.slice(0,-1), { ...p[p.length-1], icon:'✗', status:'err' }, { icon:'✗', text: e.message, status:'err', time: new Date().toLocaleTimeString() }])
      setResult(`✗ ${e.message}`)
      setResType('err')
    } finally { setLoading(false) }
  }

  const testWithSessionToken = async () => {
    if (!state.sessionToken) return
    try {
      const r = await apiFetch(`${state.apiUrl}/config/?secret=${state.sessionToken}`)
      const d = await r.json()
      setResult(`✓ Session token works!\n\nConfig retrieved:\n${JSON.stringify(d, null, 2)}`)
      setResType('ok')
    } catch(e) {
      setResult(`✗ Session token test failed: ${e.message}`)
      setResType('err')
    }
  }

  return (
    <div className="max-w-4xl">
      <Section title="Full auth flow test"
        subtitle="Runs the complete authentication flow and shows each step">
        <label className={lbl}>Admin secret</label>
        <input type="password" value={secret} onChange={e => setSecret(e.target.value)}
          className={`${inp} max-w-xs mb-4`} placeholder="watchdog-admin" />

        <div className="flex gap-2 mb-6">
          <Btn onClick={runFullAuth} disabled={loading}>{loading ? '⏳ Running…' : '▶ Run full auth test'}</Btn>
          {state.sessionToken && (
            <Btn onClick={testWithSessionToken} color="green">🔑 Test session token</Btn>
          )}
        </div>

        {/* Step timeline */}
        {steps.length > 0 && (
          <div className="mb-4 space-y-2">
            <p className={`${lbl} mb-2`}>Execution steps</p>
            {steps.map((s, i) => (
              <div key={i} className={`flex gap-3 p-3 rounded-lg border text-xs
                ${s.status === 'ok'      ? 'border-emerald-500/20 bg-emerald-500/5' :
                  s.status === 'err'     ? 'border-red-500/20    bg-red-500/5'    :
                                           'border-white/[0.06]  bg-white/[0.02]'}`}>
                <span className="text-base flex-shrink-0">{s.icon}</span>
                <div className="flex-1">
                  <p className={`font-mono whitespace-pre-wrap ${s.status === 'ok' ? 'text-emerald-300' : s.status === 'err' ? 'text-red-300' : 'text-slate-400'}`}>
                    {s.text}
                  </p>
                </div>
                <span className="text-slate-600 text-[10px] flex-shrink-0">{s.time}</span>
              </div>
            ))}
          </div>
        )}

        {state.sessionToken && (
          <div className="mb-4 p-3 rounded-lg border border-violet-500/25 bg-violet-500/5">
            <p className="text-[10px] font-bold uppercase text-violet-400 mb-1">Active session token</p>
            <p className="text-xs font-mono text-violet-300 break-all">{state.sessionToken}</p>
          </div>
        )}

        <ResultBox data={result} type={resType} />
      </Section>

      <Section title="What this proves">
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
          {[
            ['🔐 Secret never in plaintext', 'Network tab shows only { rsa, aes } — not the actual secret'],
            ['🔑 Key exchange is secure',    'Public key encrypts, private key (backend RAM only) decrypts'],
            ['🎟 Session token returned',    'All subsequent API calls use this token, not the secret'],
            ['⏰ Token expires in 1 hour',   'After expiry, user must re-authenticate — fetches fresh key'],
          ].map(([title, desc]) => (
            <div key={title} className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <p className="font-semibold text-slate-300 mb-1">{title}</p>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
