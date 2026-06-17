export default function EventStream({ events }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:10 }}>
      {events.length === 0
        ? <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'#333', fontSize:13 }}>No events yet — simulate or upload logs</div>
        : events.map((e, i) => (
          <div key={e.id||i} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'10px 14px' }}>
            <div style={{ display:'flex', gap:6, marginBottom:5, alignItems:'center' }}>
              <span style={{ fontSize:10, fontWeight:700, color:e.stream_type==='HLS'?'#34d399':'#60a5fa', background:e.stream_type==='HLS'?'rgba(52,211,153,0.1)':'rgba(96,165,250,0.1)', border:`1px solid ${e.stream_type==='HLS'?'rgba(52,211,153,0.25)':'rgba(96,165,250,0.25)'}`, borderRadius:3, padding:'1px 5px' }}>{e.stream_type||'HLS'}</span>
              {e.source==='gcp'   && <span style={{ fontSize:10, color:'#a78bfa', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:3, padding:'1px 5px', fontWeight:700 }}>GCP</span>}
              {e.source==='aws'   && <span style={{ fontSize:10, color:'#facc15', background:'rgba(234,179,8,0.1)',  border:'1px solid rgba(234,179,8,0.2)',  borderRadius:3, padding:'1px 5px', fontWeight:700 }}>AWS</span>}
              {e.source==='azure' && <span style={{ fontSize:10, color:'#60a5fa', background:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.2)', borderRadius:3, padding:'1px 5px', fontWeight:700 }}>Azure</span>}
              {e.source==='cdn'   && <span style={{ fontSize:10, color:'#fb923c', background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)', borderRadius:3, padding:'1px 5px', fontWeight:700 }}>CDN</span>}
              <span style={{ fontSize:10, color:'#444', marginLeft:'auto' }}>{e.timestamp ? new Date(e.timestamp+'Z').toLocaleTimeString() : ''}</span>
            </div>
            <div style={{ fontSize:11, color:'#94a3b8', fontFamily:'monospace', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.asset||'—'}</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:10, color:'#555' }}>🌐 {e.ip}</span>
              {e.geo && <span style={{ fontSize:10, color:'#444' }}>📍 {e.geo}</span>}
              {e.registered_country && e.geo && e.registered_country !== e.geo && (
                <span style={{ fontSize:10, fontWeight:700, color:'#eab308', background:'rgba(234,179,8,0.1)', border:'1px solid rgba(234,179,8,0.2)', borderRadius:3, padding:'1px 5px' }}>⚠ Geo</span>
              )}
            </div>
            {e.user_agent && <div style={{ fontSize:10, color:'#383838', marginTop:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.user_agent}</div>}
          </div>
        ))
      }
    </div>
  )
}
