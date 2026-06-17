import { useState } from 'react'
import { apiFetch } from '../utils.js'
import { Btn, ResultBox, Section, inp, lbl } from '../ui.jsx'

export default function HealthCheck({ state, update, saveUrl }) {
  const [url,     setUrl]     = useState(state.apiUrl)
  const [loading, setLoading] = useState({})
  const [results, setResults] = useState({})

  const setLoad = (k, v) => setLoading(p => ({ ...p, [k]: v }))
  const setRes  = (k, v, t) => setResults(p => ({ ...p, [k]: { data: v, type: t } }))

  const check = async (path, key, label) => {
    setLoad(key, true)
    try {
      const r = await apiFetch(`${url}${path}`)
      const d = await r.json()
      setRes(key, d, r.ok ? 'ok' : 'err')
    } catch(e) {
      setRes(key, `✗ ${label} unreachable: ${e.message}`, 'err')
    } finally { setLoad(key, false) }
  }

  const saveAndTest = () => {
    saveUrl(url)
    check('/health', 'health', 'Backend')
  }

  const ENDPOINTS = [
    { path:'/health',           key:'health',  label:'GET /health',           desc:'Backend status, version, consumers' },
    { path:'/config/public-key',key:'pubkey',  label:'GET /config/public-key',desc:'RSA public key for encryption' },
    { path:'/streams/summary',  key:'summary', label:'GET /streams/summary',  desc:'Event and alert counts' },
    { path:'/alerts/',          key:'alerts',  label:'GET /alerts/',           desc:'All alerts' },
    { path:'/debug/decrypt-test',key:'debug',  label:'POST /debug/decrypt-test (DEBUG=true)', desc:'Decryption test endpoint' },
  ]

  return (
    <div className="max-w-3xl">
      <Section title="Backend connection" subtitle="Configure and test your backend URL">
        <label className={lbl}>Backend URL</label>
        <div className="flex gap-2 mb-4">
          <input value={url} onChange={e => setUrl(e.target.value)} className={`${inp} flex-1`} placeholder="http://localhost:8001" />
          <Btn onClick={saveAndTest} disabled={loading.health}>{loading.health ? '⏳' : '🔌 Test & save'}</Btn>
        </div>
        <ResultBox data={results.health?.data} type={results.health?.type} />
      </Section>

      <Section title="Endpoint status" subtitle="Check each API endpoint individually">
        <div className="space-y-2">
          {ENDPOINTS.map(e => (
            <div key={e.key} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
              <div className="flex-1">
                <p className="text-xs font-mono font-semibold text-slate-300">{e.label}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{e.desc}</p>
              </div>
              {results[e.key] && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${results[e.key].type === 'ok' ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' : 'border-red-500/25 bg-red-500/10 text-red-400'}`}>
                  {results[e.key].type === 'ok' ? '✓ OK' : '✗ ERR'}
                </span>
              )}
              <Btn onClick={() => check(e.path, e.key, e.label)} disabled={loading[e.key]} color="secondary">
                {loading[e.key] ? '⏳' : 'Check'}
              </Btn>
            </div>
          ))}
        </div>
        {Object.keys(results).length > 0 && (
          <div className="mt-4">
            {Object.entries(results).filter(([,v]) => v).map(([k, v]) => (
              <div key={k}>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-3 mb-1">{k}</p>
                <ResultBox data={v.data} type={v.type} />
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
