const SRC = {
  gcp  :'border-violet-500/25 bg-violet-500/10 text-violet-300',
  aws  :'border-yellow-500/25 bg-yellow-500/10 text-yellow-300',
  azure:'border-blue-500/25   bg-blue-500/10   text-blue-300',
  cdn  :'border-orange-500/25 bg-orange-500/10 text-orange-300',
}
export default function EventStream({ events }) {
  if (!events.length) return (
    <div className="text-center py-16 text-slate-600"><div className="text-4xl mb-3">📡</div><p className="text-sm">No events yet — simulate or upload logs</p></div>
  )
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {events.map((e,i) => (
        <div key={e.id||i} className="card p-3 card-hover">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`badge border ${e.stream_type==='HLS'?'border-emerald-500/25 bg-emerald-500/10 text-emerald-300':'border-blue-500/25 bg-blue-500/10 text-blue-300'} text-[10px] font-bold`}>{e.stream_type||'HLS'}</span>
            {e.source&&e.source!=='direct'&&<span className={`badge border ${SRC[e.source]||'border-white/[0.08] bg-white/[0.04] text-slate-400'} text-[10px] font-bold`}>{e.source?.toUpperCase()}</span>}
            <span className="text-[10px] text-slate-600 ml-auto font-mono">{e.timestamp?new Date(e.timestamp+'Z').toLocaleTimeString():''}</span>
          </div>
          <p className="text-xs text-slate-400 font-mono truncate mb-2">{e.asset||'—'}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] text-slate-500">🌐 {e.ip}</span>
            {e.geo&&<span className="text-[10px] text-slate-600">📍 {e.geo}</span>}
            {e.registered_country&&e.geo&&e.registered_country!==e.geo&&<span className="badge border border-yellow-500/25 bg-yellow-500/10 text-yellow-400 text-[9px]">⚠ Geo</span>}
          </div>
          {e.user_agent&&<p className="text-[10px] text-slate-700 mt-1.5 truncate">{e.user_agent}</p>}
        </div>
      ))}
    </div>
  )
}
