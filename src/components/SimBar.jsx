import { useState } from 'react'
export default function SimBar({ apiUrl, onDone }) {
  const [busy,setBusy]=useState(null)
  const run=async(ep,label)=>{setBusy(label);try{await fetch(`${apiUrl}/simulate/${ep}`,{method:'POST'});onDone()}finally{setBusy(null)}}
  const btn=(label,ep,color)=>(<button key={ep} onClick={()=>run(ep,label)} disabled={!!busy} style={{padding:'5px 13px',borderRadius:7,fontSize:11,fontWeight:600,cursor:busy?'not-allowed':'pointer',fontFamily:'inherit',border:`1px solid ${color}44`,background:`${color}18`,color,opacity:busy&&busy!==label?0.4:1,whiteSpace:'nowrap'}}>{busy===label?'⏳ ':''}{label}</button>)
  return (
    <div style={{display:'flex',gap:7,flexWrap:'wrap',alignItems:'center'}}>
      <span style={{fontSize:10,color:'#444',fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em'}}>Simulate:</span>
      {btn('Normal','normal','#34d399')}
      {btn('Concurrent IPs','concurrent','#f87171')}
      {btn('Pirate agent','suspicious_agent','#fb923c')}
      {btn('Geo mismatch','geo_mismatch','#facc15')}
      {btn('Expired token','expired_token','#f87171')}
      {btn('Token spray','token_spray','#a855f7')}
      {btn('🔥 All','all','#a78bfa')}
      <button onClick={()=>run('reset','reset')} style={{marginLeft:'auto',padding:'5px 12px',borderRadius:7,fontSize:11,cursor:'pointer',fontFamily:'inherit',border:'1px solid rgba(255,255,255,0.08)',background:'rgba(255,255,255,0.04)',color:'#555'}}>↺ Reset</button>
    </div>
  )
}
