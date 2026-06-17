import { useState } from 'react'
import { apiFetch } from '../api.js'
const SCENARIOS = [
  { label:'Normal',        ep:'normal',          cls:'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' },
  { label:'Concurrent IPs',ep:'concurrent',      cls:'border-red-500/30    text-red-400    hover:bg-red-500/10'    },
  { label:'Pirate agent',  ep:'suspicious_agent',cls:'border-orange-500/30 text-orange-400 hover:bg-orange-500/10' },
  { label:'Geo mismatch',  ep:'geo_mismatch',    cls:'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10' },
  { label:'Expired token', ep:'expired_token',   cls:'border-red-500/30    text-red-400    hover:bg-red-500/10'    },
  { label:'Token spray',   ep:'token_spray',     cls:'border-purple-500/30 text-purple-400 hover:bg-purple-500/10' },
  { label:'🔥 All',        ep:'all',             cls:'border-violet-500/40 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20' },
]
export default function SimBar({ apiUrl, onDone }) {
  const [busy, setBusy] = useState(null)
  const run = async (ep, label) => {
    setBusy(label)
    try { await apiFetch(`${apiUrl}/simulate/${ep}`, { method:'POST' }); onDone() }
    finally { setBusy(null) }
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mr-1">Simulate:</span>
      {SCENARIOS.map(({ label, ep, cls }) => (
        <button key={ep} onClick={() => run(ep,label)} disabled={!!busy}
          className={`btn ${cls} ${busy&&busy!==label?'opacity-30':''}`}>
          {busy===label?'⏳':label}
        </button>
      ))}
      <button onClick={() => run('reset','reset')} className="btn border-white/[0.08] text-slate-500 hover:text-slate-300 ml-auto">↺ Reset</button>
    </div>
  )
}
