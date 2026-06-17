// EventStream.jsx
export function EventStream({ events }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:10 }}>
      {events.length === 0
        ? <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'#333', fontSize:13 }}>No events yet</div>
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

// GcpUpload.jsx
import { useRef, useState } from 'react'

export function GcpUpload({ apiUrl, onDone }) {
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result,    setResult]    = useState(null)
  const fileRef = useRef(null)

  const upload = async (file) => {
    setUploading(true); setResult(null)
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await fetch(`${apiUrl}/ingest/upload`, { method:'POST', body:fd })
      const d = await r.json(); setResult(d); onDone()
    } catch(e) { setResult({ error: e.message }) }
    finally { setUploading(false) }
  }

  return (
    <div style={{ maxWidth:640 }}>
      <div
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={()=>setDragging(false)}
        onDrop={e=>{e.preventDefault();setDragging(false);e.dataTransfer.files[0]&&upload(e.dataTransfer.files[0])}}
        onClick={()=>fileRef.current?.click()}
        style={{ border:`2px dashed ${dragging?'#7c3aed':'rgba(255,255,255,0.12)'}`, borderRadius:10, padding:'32px 20px', textAlign:'center', cursor:'pointer', background:dragging?'rgba(124,58,237,0.08)':'rgba(255,255,255,0.02)' }}
      >
        <input ref={fileRef} type="file" accept=".json,.ndjson,.log,.txt" style={{display:'none'}} onChange={e=>e.target.files[0]&&upload(e.target.files[0])} />
        <div style={{ fontSize:32, marginBottom:8 }}>☁️</div>
        {uploading
          ? <p style={{ fontSize:13, color:'#a78bfa' }}>⏳ Parsing logs…</p>
          : <p style={{ fontSize:13, color:'#555' }}>Drop cloud log file here or click to browse<br/><span style={{fontSize:11,color:'#444'}}>GCP · AWS · Azure · CDN · NDJSON · JSON array</span></p>
        }
      </div>
      {result && !result.error && (
        <div style={{ marginTop:10, padding:'8px 14px', borderRadius:8, background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)', fontSize:12, color:'#34d399' }}>
          ✓ {result.total} entries parsed — {result.ingested} ingested, {result.skipped} skipped
        </div>
      )}
      {result?.error && (
        <div style={{ marginTop:10, padding:'8px 14px', borderRadius:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', fontSize:12, color:'#f87171' }}>✗ {result.error}</div>
      )}
      <div style={{ marginTop:16, padding:'14px 18px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', marginBottom:8 }}>Export from GCP Cloud Logging</div>
        <div style={{ fontSize:11, color:'#555', lineHeight:2, fontFamily:'monospace' }}>
          <div style={{color:'#a78bfa'}}>gcloud logging read \</div>
          <div style={{color:'#a78bfa',paddingLeft:16}}>'resource.type="http_load_balancer"' \</div>
          <div style={{color:'#a78bfa',paddingLeft:16}}>--limit=1000 --format=json &gt; gcp_logs.json</div>
        </div>
      </div>
    </div>
  )
}

// SimBar.jsx
export function SimBar({ apiUrl, onDone }) {
  const [busy, setBusy] = useState(null)
  const run = async (ep, label) => {
    setBusy(label)
    try { await fetch(`${apiUrl}/simulate/${ep}`, {method:'POST'}); onDone() }
    finally { setBusy(null) }
  }
  const btn = (label, ep, color) => (
    <button key={ep} onClick={()=>run(ep,label)} disabled={!!busy}
      style={{ padding:'5px 13px', borderRadius:7, fontSize:11, fontWeight:600, cursor:busy?'not-allowed':'pointer', fontFamily:'inherit', border:`1px solid ${color}44`, background:`${color}18`, color, opacity:busy&&busy!==label?0.4:1, whiteSpace:'nowrap' }}>
      {busy===label?'⏳ ':''}{label}
    </button>
  )
  return (
    <div style={{ display:'flex', gap:7, flexWrap:'wrap', alignItems:'center' }}>
      <span style={{ fontSize:10, color:'#444', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Simulate:</span>
      {btn('Normal',        'normal',           '#34d399')}
      {btn('Concurrent IPs','concurrent',       '#f87171')}
      {btn('Pirate agent',  'suspicious_agent', '#fb923c')}
      {btn('Geo mismatch',  'geo_mismatch',     '#facc15')}
      {btn('Expired token', 'expired_token',    '#f87171')}
      {btn('Token spray',   'token_spray',      '#a855f7')}
      {btn('🔥 All',        'all',              '#a78bfa')}
      <button onClick={()=>run('reset','reset')} style={{ marginLeft:'auto', padding:'5px 12px', borderRadius:7, fontSize:11, cursor:'pointer', fontFamily:'inherit', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', color:'#555' }}>↺ Reset</button>
    </div>
  )
}
