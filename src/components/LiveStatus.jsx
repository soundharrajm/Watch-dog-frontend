import { useState, useEffect } from 'react'
import { apiFetch } from '../api.js'
const CLOUD_INFO = {
  gcp  :{ label:'GCP Cloud Logging',icon:'☁️',color:'text-violet-400',bg:'bg-violet-500/10',border:'border-violet-500/25' },
  aws  :{ label:'AWS CloudWatch',   icon:'🟠',color:'text-yellow-400',bg:'bg-yellow-500/10',border:'border-yellow-500/25' },
  azure:{ label:'Azure Monitor',    icon:'🔵',color:'text-blue-400',  bg:'bg-blue-500/10',  border:'border-blue-500/25'   },
  cdn  :{ label:'CDN Logs',         icon:'🌐',color:'text-orange-400',bg:'bg-orange-500/10',border:'border-orange-500/25' },
}
const SVC_INFO = {
  database :{ label:'Database',        icon:'🗄' },
  engine   :{ label:'Detection engine',icon:'⚡' },
  websocket:{ label:'WebSocket push',  icon:'📡' },
  config   :{ label:'Config',          icon:'⚙' },
}
function StatusDot({ status }) {
  if (status==='ok'||status==='running') return <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot inline-block"/>
  if (status==='error')                  return <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse-dot inline-block"/>
  if (status==='degraded'||status==='misconfigured') return <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"/>
  return <span className="w-2 h-2 rounded-full bg-slate-600 inline-block"/>
}
function StatusBadge({ status }) {
  const cls =
    status==='ok'||status==='running'             ?'text-emerald-400 bg-emerald-500/10 border-emerald-500/25':
    status==='error'                              ?'text-red-400    bg-red-500/10    border-red-500/25':
    status==='degraded'||status==='misconfigured' ?'text-yellow-400 bg-yellow-500/10 border-yellow-500/25':
    status==='disabled'                           ?'text-slate-600  bg-white/[0.04]  border-white/[0.06]':
                                                   'text-slate-500  bg-white/[0.03]  border-white/[0.06]'
  return <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${cls}`}>{status}</span>
}
export default function LiveStatus({ apiUrl }) {
  const [health,setHealth]=useState(null)
  const [lastFetch,setLastFetch]=useState(null)
  const [loading,setLoading]=useState(false)
  const fetchStatus=async()=>{
    setLoading(true)
    try{const r=await apiFetch(`${apiUrl}/health`);const d=await r.json();setHealth(d);setLastFetch(new Date())}
    catch{}finally{setLoading(false)}
  }
  useEffect(()=>{fetchStatus();const t=setInterval(fetchStatus,10000);return()=>clearInterval(t)},[apiUrl])
  const checks=health?.checks||{}
  const consumers=checks.consumers||{}
  const overall=health?.status||'unknown'
  return (
    <div>
      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border mb-4 ${overall==='ok'?'border-emerald-500/25 bg-emerald-500/5':overall==='degraded'?'border-yellow-500/25 bg-yellow-500/5':overall==='error'?'border-red-500/25 bg-red-500/5':'border-white/[0.07] bg-white/[0.02]'}`}>
        <StatusDot status={overall}/>
        <span className={`text-xs font-bold uppercase ${overall==='ok'?'text-emerald-400':overall==='degraded'?'text-yellow-400':overall==='error'?'text-red-400':'text-slate-500'}`}>System {overall}</span>
        <span className="text-[10px] text-slate-600 ml-auto">{lastFetch?`Updated ${lastFetch.toLocaleTimeString()}`:'Checking…'}</span>
        <button onClick={fetchStatus} disabled={loading} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40">{loading?'⏳':'↺ Refresh'}</button>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Internal services</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        {Object.entries(SVC_INFO).map(([key,info])=>{
          const check=checks[key]||{}; const status=check.status||'unknown'
          return (
            <div key={key} className="card p-3">
              <div className="flex items-center justify-between mb-2"><span className="text-base">{info.icon}</span><StatusBadge status={status}/></div>
              <p className="text-xs font-semibold text-slate-300">{info.label}</p>
              <div className="text-[10px] text-slate-600 mt-1 space-y-0.5">
                {key==='database'  &&check.events!=null&&<p>Events: {check.events} · Alerts: {check.alerts}</p>}
                {key==='engine'    &&check.suspicious_agents&&<p>{check.suspicious_agents} rules · Max {check.max_concurrent_ips} IPs</p>}
                {key==='websocket' &&<p>{check.connected_clients} client{check.connected_clients!==1?'s':''} connected</p>}
                {key==='config'    &&check.clouds_configured!=null&&<p>{check.clouds_configured} cloud{check.clouds_configured!==1?'s':''} enabled</p>}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Cloud log consumers</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {Object.entries(CLOUD_INFO).map(([key,info])=>{
          const consumer=consumers[key]||{}; const status=consumer.status||'stopped'
          const isLive=status==='running'; const isErr=status==='error'||status==='misconfigured'
          return (
            <div key={key} className={`rounded-xl border p-3 transition-all ${isLive?`${info.bg} ${info.border}`:isErr?'bg-red-500/5 border-red-500/20':'bg-white/[0.02] border-white/[0.06]'}`}>
              <div className="flex items-center justify-between mb-2"><span className="text-base">{info.icon}</span><StatusBadge status={status}/></div>
              <p className={`text-xs font-semibold ${isLive?info.color:isErr?'text-red-400':'text-slate-600'}`}>{info.label}</p>
              <p className="text-[10px] text-slate-600 mt-1">
                {isLive?'Streaming live logs':isErr?`Missing: ${consumer.missing?.join(', ')||'credentials'}`:status==='disabled'?'Disabled in settings':'Configure in Settings → Clouds'}
              </p>
            </div>
          )
        })}
      </div>
      {Object.values(consumers).every(c=>['stopped','disabled'].includes(c.status))&&(
        <div className="mt-3 px-4 py-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-xs text-yellow-400">⚠ No live consumers running — go to <strong>⚙ Settings → Clouds</strong></div>
      )}
    </div>
  )
}
