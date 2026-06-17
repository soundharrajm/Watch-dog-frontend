const CARDS = [
  { label:'Events',     key:'total_events',     color:'text-slate-100' },
  { label:'Tokens',     key:'unique_tokens',    color:'text-slate-100' },
  { label:'IPs',        key:'unique_ips',       color:'text-slate-100' },
  { label:'Suspicious', key:'suspicious_tokens',color:'text-red-400',   pulse:true },
  { label:'Critical',   key:'critical_alerts',  color:'text-red-500',   pulse:true },
  { label:'High',       key:'high_alerts',      color:'text-orange-400' },
  { label:'Medium',     key:'medium_alerts',    color:'text-yellow-400' },
  { label:'HLS',        key:'hls_events',       color:'text-emerald-400'},
  { label:'DASH',       key:'dash_events',      color:'text-blue-400'   },
  { label:'GCP',        key:'gcp_events',       color:'text-violet-400' },
]
const PULSE = { 'text-red-400':'bg-red-400', 'text-red-500':'bg-red-500' }

export default function StatCards({ summary }) {
  return (
    <div className="grid grid-cols-5 xl:grid-cols-10 gap-2 mb-4">
      {CARDS.map(({ label, key, color, pulse }) => {
        const value = summary?.[key]
        return (
          <div key={key} className="card p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">{label}</p>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-extrabold leading-none ${value!=null?color:'text-slate-600'}`}>{value??'—'}</span>
              {pulse && value>0 && <span className={`w-2 h-2 rounded-full animate-pulse-dot ${PULSE[color]||'bg-red-400'}`}/>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
