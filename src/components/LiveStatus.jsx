import { useState, useEffect } from 'react'
import { apiFetch } from '../api.js'

const CLOUD_INFO = {
  gcp  : { label:'GCP Cloud Logging', icon:'☁️', color:'text-violet-400', bg:'bg-violet-500/10', border:'border-violet-500/25' },
  aws  : { label:'AWS CloudWatch',    icon:'🟠', color:'text-yellow-400', bg:'bg-yellow-500/10', border:'border-yellow-500/25' },
  azure: { label:'Azure Monitor',     icon:'🔵', color:'text-blue-400',   bg:'bg-blue-500/10',   border:'border-blue-500/25'   },
  cdn  : { label:'CDN Logs',          icon:'🌐', color:'text-orange-400', bg:'bg-orange-500/10', border:'border-orange-500/25' },
}

export default function LiveStatus({ apiUrl }) {
  const [health,    setHealth]    = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  const fetchStatus = async () => {
    try {
      const r = await apiFetch(`${apiUrl}/health`)
      const d = await r.json()
      setHealth(d)
      setLastFetch(new Date())
    } catch {}
  }

  useEffect(() => {
    fetchStatus()
    const t = setInterval(fetchStatus, 10000)
    return () => clearInterval(t)
  }, [apiUrl])

  const consumers = health?.consumers || {}

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live cloud consumers</span>
        <div className="flex items-center gap-2">
          {lastFetch && <span className="text-[10px] text-slate-600">Updated {lastFetch.toLocaleTimeString()}</span>}
          <button onClick={fetchStatus} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">↺ Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {Object.entries(CLOUD_INFO).map(([key, info]) => {
          const status = consumers[key] || 'stopped'
          const isRunning = status === 'running'
          return (
            <div key={key} className={`rounded-xl border p-3 ${isRunning ? `${info.bg} ${info.border}` : 'bg-white/[0.02] border-white/[0.06]'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{info.icon}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse-dot' : 'bg-slate-600'}`} />
                  <span className={`text-[10px] font-bold uppercase ${isRunning ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {isRunning ? 'Live' : 'Off'}
                  </span>
                </div>
              </div>
              <p className={`text-xs font-semibold ${isRunning ? info.color : 'text-slate-600'}`}>{info.label}</p>
              <p className="text-[10px] text-slate-600 mt-1">
                {isRunning ? 'Streaming logs in real time' : 'Configure in Settings → Clouds'}
              </p>
            </div>
          )
        })}
      </div>

      {Object.values(consumers).every(s => s === 'stopped') && (
        <div className="mt-3 px-4 py-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-xs text-yellow-400">
          ⚠ No live consumers running — go to <strong>Settings → Clouds</strong> and add credentials to connect real logs
        </div>
      )}
    </div>
  )
}
