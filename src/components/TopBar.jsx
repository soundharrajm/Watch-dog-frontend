import { useState } from 'react'

const THREAT_COLOR = { CRITICAL:'#ef4444', HIGH:'#f97316', MEDIUM:'#eab308', CLEAR:'#22c55e', UNKNOWN:'#555' }

export default function TopBar({ threat, liveAlerts, apiUrl, onOpenSettings }) {
  const [showLive, setShowLive] = useState(false)
  const c = THREAT_COLOR[threat] || '#555'

  return (
    <div style={{ background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'12px 24px', display:'flex', alignItems:'center', gap:14, position:'relative' }}>
      <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#dc2626)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🛡</div>
      <div>
        <div style={{ fontSize:15, fontWeight:800, letterSpacing:'-0.3px' }}>Watchdog</div>
        <div style={{ fontSize:11, color:'#444' }}>Multi-cloud piracy detection · HLS · DASH · DRM</div>
      </div>

      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
        {/* Live alert badge */}
        {liveAlerts.length > 0 && (
          <div style={{ position:'relative' }}>
            <button onClick={() => setShowLive(v => !v)} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, border:'1px solid rgba(239,68,68,0.4)', background:'rgba(239,68,68,0.1)', color:'#f87171', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:600 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#ef4444', display:'inline-block', animation:'pulse 1s infinite' }} />
              {liveAlerts.length} live
            </button>
            {showLive && (
              <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, width:340, background:'#1a1a2e', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:12, zIndex:100, boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
                <div style={{ fontSize:11, color:'#555', marginBottom:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Live alerts</div>
                {liveAlerts.map((a,i) => (
                  <div key={i} style={{ padding:'7px 10px', borderRadius:7, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', marginBottom:6 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#f87171', marginBottom:2 }}>{a.severity?.toUpperCase()}</div>
                    <div style={{ fontSize:12, color:'#e8e8f0' }}>{a.title}</div>
                    <div style={{ fontSize:10, color:'#555', marginTop:3 }}>{new Date(a.timestamp+'Z').toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Threat level */}
        <div style={{ padding:'5px 14px', borderRadius:8, border:`1px solid ${c}44`, background:`${c}15`, display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:c, display:'inline-block', boxShadow:threat==='CRITICAL'?`0 0 8px ${c}`:undefined }} />
          <span style={{ fontSize:12, fontWeight:700, color:c }}>Threat: {threat}</span>
        </div>

        <div style={{ fontSize:10, color:'#333' }}>{apiUrl.replace('http://','').replace('https://','')}</div>
        <button onClick={onOpenSettings} style={{ padding:'5px 12px', borderRadius:7, fontSize:12, cursor:'pointer', fontFamily:'inherit', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#888' }}>⚙ Settings</button>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )
}
