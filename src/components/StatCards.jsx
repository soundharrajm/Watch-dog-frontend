// StatCards.jsx
export default function StatCards({ summary: s }) {
  const cards = [
    { label:'Events',      value: s?.total_events,       color: null },
    { label:'Tokens',      value: s?.unique_tokens,      color: null },
    { label:'IPs',         value: s?.unique_ips,         color: null },
    { label:'Suspicious',  value: s?.suspicious_tokens,  color: '#f87171', pulse: true },
    { label:'Critical',    value: s?.critical_alerts,    color: '#ef4444', pulse: true },
    { label:'High',        value: s?.high_alerts,        color: '#f97316' },
    { label:'Medium',      value: s?.medium_alerts,      color: '#eab308' },
    { label:'HLS',         value: s?.hls_events,         color: '#34d399' },
    { label:'DASH',        value: s?.dash_events,        color: '#60a5fa' },
    { label:'GCP events',  value: s?.gcp_events,         color: '#a78bfa' },
  ]
  return (
    <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16 }}>
      {cards.map(({ label, value, color, pulse }) => (
        <div key={label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px', flex:1, minWidth:90 }}>
          <div style={{ fontSize:10, color:'#555', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>{label}</div>
          <div style={{ fontSize:26, fontWeight:800, color:color||'#e8e8f0', display:'flex', alignItems:'center', gap:7 }}>
            {value ?? '—'}
            {pulse && value > 0 && <span style={{ width:7, height:7, borderRadius:'50%', background:color, display:'inline-block', animation:'pulse 1.5s infinite' }} />}
          </div>
        </div>
      ))}
    </div>
  )
}
