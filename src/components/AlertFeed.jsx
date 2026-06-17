import { useState } from 'react'

const SEV = {
  critical : { bar:'bg-red-500',    bg:'bg-red-500/5    border-red-500/25',    badge:'bg-red-500/15    text-red-400    border-red-500/30'    },
  high     : { bar:'bg-orange-500', bg:'bg-orange-500/5 border-orange-500/25', badge:'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  medium   : { bar:'bg-yellow-500', bg:'bg-yellow-500/5 border-yellow-500/25', badge:'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  low      : { bar:'bg-blue-500',   bg:'bg-blue-500/5   border-blue-500/25',   badge:'bg-blue-500/15   text-blue-400   border-blue-500/30'   },
}

const RULES = {
  concurrent_ip    : '🔀 Concurrent IPs',
  suspicious_agent : '🤖 Suspicious Agent',
  geo_mismatch     : '🌍 Geo Mismatch',
  expired_token    : '⏰ Expired Token',
  token_spray      : '💣 Token Spray',
}

function AlertRow({ alert, onResolve }) {
  const [open, setOpen] = useState(false)
  const s = SEV[alert.severity] || SEV.low

  return (
    <div className={`relative border rounded-xl mb-2 overflow-hidden animate-slide-in transition-opacity ${s.bg} ${alert.resolved ? 'opacity-40' : ''}`}>
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${s.bar}`} />

      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setOpen(o => !o)}>
        <span className={`badge border ${s.badge} text-[10px] uppercase font-bold min-w-[68px] justify-center`}>{alert.severity}</span>
        <span className="badge border border-white/[0.08] bg-white/[0.04] text-slate-400">{RULES[alert.rule] || alert.rule}</span>
        <span className="text-sm font-semibold text-slate-200 flex-1 truncate">{alert.title}</span>
        <span className="text-[10px] text-slate-500 flex-shrink-0">{alert.timestamp ? new Date(alert.timestamp+'Z').toLocaleTimeString() : ''}</span>
        <span className="text-slate-500 text-sm">{open ? '▾' : '▸'}</span>
      </div>

      {open && (
        <div className="px-4 pb-3 border-t border-white/[0.06] pt-3">
          <p className="text-sm text-slate-400 mb-3">{alert.detail}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {alert.asset       && <span className="badge border border-violet-500/25 bg-violet-500/10 text-violet-300">📺 {alert.asset}</span>}
            {alert.ip          && <span className="badge border border-blue-500/25   bg-blue-500/10   text-blue-300  ">🌐 {alert.ip}</span>}
            {alert.stream_type && <span className={`badge border ${alert.stream_type==='HLS'?'border-emerald-500/25 bg-emerald-500/10 text-emerald-300':'border-blue-500/25 bg-blue-500/10 text-blue-300'}`}>{alert.stream_type}</span>}
            {alert.token       && <span className="badge border border-white/[0.08] bg-white/[0.04] text-slate-400 font-mono">🔑 {alert.token.slice(0,20)}…</span>}
          </div>
          {!alert.resolved
            ? <button onClick={e => { e.stopPropagation(); onResolve(alert.id) }} className="btn border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">✓ Mark resolved</button>
            : <span className="badge border border-emerald-500/30 text-emerald-400">✓ Resolved</span>
          }
        </div>
      )}
    </div>
  )
}

const FILTERS = ['all','unresolved','critical','high','medium']

export default function AlertFeed({ alerts, filter, onFilter, onResolve, onClear }) {
  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
          {FILTERS.map(f => (
            <button key={f} onClick={() => onFilter(f)}
              className={`px-3 py-1.5 text-[11px] font-semibold capitalize transition-all ${filter===f ? 'bg-violet-600 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'}`}>
              {f}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500">{alerts.length} shown</span>
        {alerts.length > 0 && (
          <button onClick={onClear} className="btn ml-auto border-red-500/25 text-red-400 hover:bg-red-500/10">Clear all</button>
        )}
      </div>

      {alerts.length === 0
        ? <div className="text-center py-16 text-slate-600"><div className="text-4xl mb-3">✅</div><p className="text-sm">No alerts — simulate events or upload cloud logs</p></div>
        : alerts.map(a => <AlertRow key={a.id} alert={a} onResolve={onResolve} />)
      }
    </div>
  )
}
