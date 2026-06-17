import { useState } from 'react'

const SEV = {
  critical: { bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.4)',  text:'#f87171', dot:'#ef4444' },
  high    : { bg:'rgba(249,115,22,0.12)', border:'rgba(249,115,22,0.4)', text:'#fb923c', dot:'#f97316' },
  medium  : { bg:'rgba(234,179,8,0.12)',  border:'rgba(234,179,8,0.4)',  text:'#facc15', dot:'#eab308' },
  low     : { bg:'rgba(59,130,246,0.12)', border:'rgba(59,130,246,0.4)', text:'#60a5fa', dot:'#3b82f6' },
}
const RULES = {
  concurrent_ip    : '🔀 Concurrent IPs',
  suspicious_agent : '🤖 Suspicious agent',
  geo_mismatch     : '🌍 Geo mismatch',
  expired_token    : '⏰ Expired token',
  token_spray      : '💣 Token spray',
}

function AlertRow({ alert, onResolve }) {
  const [open, setOpen] = useState(false)
  const sev  = SEV[alert.severity] || SEV.low
  return (
    <div style={{ background:sev.bg, border:`1px solid ${sev.border}`, borderRadius:10, overflow:'hidden', opacity:alert.resolved?0.45:1, marginBottom:8 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer' }} onClick={() => setOpen(o => !o)}>
        <span style={{ width:8, height:8, borderRadius:'50%', background:sev.dot, flexShrink:0 }} />
        <span style={{ fontSize:11, fontWeight:700, color:sev.text, textTransform:'uppercase', letterSpacing:'.05em', flexShrink:0 }}>{alert.severity}</span>
        <span style={{ fontSize:11, color:'#555', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:4, padding:'1px 7px', flexShrink:0 }}>{RULES[alert.rule] || alert.rule}</span>
        <span style={{ fontSize:12, fontWeight:600, color:'#ccc', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{alert.title}</span>
        <span style={{ fontSize:10, color:'#444', flexShrink:0 }}>{alert.timestamp ? new Date(alert.timestamp+'Z').toLocaleTimeString() : ''}</span>
        <span style={{ fontSize:12, color:'#555', flexShrink:0 }}>{open?'▾':'▸'}</span>
      </div>
      {open && (
        <div style={{ padding:'0 14px 12px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ margin:'10px 0 8px', fontSize:12, color:'#888' }}>{alert.detail}</p>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
            {alert.asset       && <span style={{ fontSize:10, fontWeight:700, color:'#a78bfa', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:4, padding:'1px 6px' }}>📺 {alert.asset}</span>}
            {alert.ip          && <span style={{ fontSize:10, fontWeight:700, color:'#60a5fa', background:'rgba(59,130,246,0.1)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:4, padding:'1px 6px' }}>🌐 {alert.ip}</span>}
            {alert.stream_type && <span style={{ fontSize:10, fontWeight:700, color:alert.stream_type==='HLS'?'#34d399':'#60a5fa', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:4, padding:'1px 6px' }}>{alert.stream_type}</span>}
            {alert.token       && <span style={{ fontSize:10, color:'#94a3b8', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:4, padding:'1px 6px', fontFamily:'monospace' }}>🔑 {alert.token.slice(0,20)}…</span>}
          </div>
          {!alert.resolved && (
            <button onClick={e => { e.stopPropagation(); onResolve(alert.id) }} style={{ padding:'4px 12px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', border:'1px solid rgba(52,211,153,0.3)', background:'rgba(52,211,153,0.08)', color:'#34d399' }}>
              ✓ Mark resolved
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function AlertFeed({ alerts, filter, onFilter, onResolve, onClear }) {
  return (
    <div>
      <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap', alignItems:'center' }}>
        {['all','unresolved','critical','high','medium'].map(f => (
          <button key={f} onClick={() => onFilter(f)} style={{ padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', border:filter===f?'1px solid #7c3aed':'1px solid rgba(255,255,255,0.08)', background:filter===f?'rgba(124,58,237,0.2)':'rgba(255,255,255,0.03)', color:filter===f?'#a78bfa':'#555', textTransform:'capitalize' }}>{f}</button>
        ))}
        <span style={{ fontSize:11, color:'#555', marginLeft:8 }}>{alerts.length} shown</span>
        {alerts.length > 0 && (
          <button onClick={onClear} style={{ marginLeft:'auto', padding:'3px 10px', borderRadius:6, fontSize:11, cursor:'pointer', fontFamily:'inherit', border:'1px solid rgba(239,68,68,0.25)', background:'rgba(239,68,68,0.06)', color:'#f87171' }}>Clear all</button>
        )}
      </div>
      {alerts.length === 0
        ? <div style={{ textAlign:'center', padding:'48px 20px', color:'#333' }}><div style={{fontSize:36,marginBottom:10}}>✅</div><p style={{margin:0,fontSize:13}}>No alerts — run simulations or upload cloud logs</p></div>
        : alerts.map(a => <AlertRow key={a.id} alert={a} onResolve={onResolve} />)
      }
    </div>
  )
}
