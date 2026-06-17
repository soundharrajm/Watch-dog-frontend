import { useState } from 'react'

const THREAT = {
  CRITICAL:{ dot:'bg-red-500',    text:'text-red-400',    ring:'border-red-500/30 bg-red-500/10'      },
  HIGH    :{ dot:'bg-orange-500', text:'text-orange-400', ring:'border-orange-500/30 bg-orange-500/10' },
  MEDIUM  :{ dot:'bg-yellow-500', text:'text-yellow-400', ring:'border-yellow-500/30 bg-yellow-500/10' },
  CLEAR   :{ dot:'bg-emerald-500',text:'text-emerald-400',ring:'border-emerald-500/30 bg-emerald-500/10'},
  UNKNOWN :{ dot:'bg-slate-500',  text:'text-slate-400',  ring:'border-slate-500/30 bg-slate-500/10'   },
}

export default function TopBar({ threat, liveAlerts, apiUrl, backendOk, onOpenSettings, onRetry }) {
  const [showLive, setShowLive] = useState(false)
  const t = THREAT[threat] || THREAT.UNKNOWN

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a14]/90 backdrop-blur-md border-b border-white/[0.07]">
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-red-600 flex items-center justify-center text-lg flex-shrink-0">🛡</div>
        <div>
          <p className="text-sm font-bold leading-tight">Watchdog</p>
          <p className="text-[10px] text-slate-500 leading-tight">Multi-cloud piracy detection · HLS · DASH · DRM</p>
        </div>
        <div className="flex-1"/>

        {/* Live alerts */}
        {liveAlerts.length > 0 && (
          <div className="relative">
            <button onClick={() => setShowLive(v=>!v)} className="flex items-center gap-1.5 btn border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot"/>
              {liveAlerts.length} live
            </button>
            {showLive && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-80 card border-red-500/20 bg-[#12121f] shadow-2xl z-50">
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/[0.06]">Live alerts</p>
                {liveAlerts.map((a,i) => (
                  <div key={i} className="px-3 py-2 border-b border-white/[0.05] animate-slide-in">
                    <p className="text-[11px] font-bold text-red-400">{a.severity?.toUpperCase()}</p>
                    <p className="text-xs text-slate-300">{a.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{new Date(a.timestamp+'Z').toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Threat badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold ${t.ring} ${t.text}`}>
          <span className={`w-2 h-2 rounded-full ${t.dot}`}/>
          Threat: {threat}
        </div>

        {/* Backend status */}
        <div onClick={backendOk===false ? onRetry : undefined}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all
            ${backendOk===true  ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400' :
              backendOk===false ? 'border-red-500/25 bg-red-500/5 text-red-400 cursor-pointer' :
                                  'border-white/[0.08] bg-white/[0.04] text-slate-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${backendOk===true?'bg-emerald-400':backendOk===false?'bg-red-400 animate-pulse-dot':'bg-slate-600'}`}/>
          {backendOk===true?'Connected':backendOk===false?'Disconnected ↺':'Connecting…'}
        </div>

        <span className="hidden md:block text-[10px] text-slate-600 font-mono">{apiUrl.replace(/https?:\/\//,'')}</span>
        <button onClick={onOpenSettings} className="btn border-white/[0.1] text-slate-400 hover:text-slate-200 hover:border-white/20">⚙ Settings</button>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </header>
  )
}
