import { useRef, useState } from 'react'
export default function GcpUpload({ apiUrl, onDone }) {
  const [dragging,setDragging]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [result,setResult]=useState(null)
  const fileRef=useRef(null)
  const upload=async(file)=>{
    setUploading(true);setResult(null)
    const fd=new FormData();fd.append('file',file)
    try{const r=await fetch(`${apiUrl}/ingest/upload`,{method:'POST',body:fd});const d=await r.json();setResult(d);onDone()}
    catch(e){setResult({error:e.message})}
    finally{setUploading(false)}
  }
  return (
    <div style={{maxWidth:640}}>
      <div onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);e.dataTransfer.files[0]&&upload(e.dataTransfer.files[0])}} onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${dragging?'#7c3aed':'rgba(255,255,255,0.12)'}`,borderRadius:10,padding:'32px 20px',textAlign:'center',cursor:'pointer',background:dragging?'rgba(124,58,237,0.08)':'rgba(255,255,255,0.02)'}}>
        <input ref={fileRef} type="file" accept=".json,.ndjson,.log,.txt" style={{display:'none'}} onChange={e=>e.target.files[0]&&upload(e.target.files[0])}/>
        <div style={{fontSize:32,marginBottom:8}}>☁️</div>
        {uploading?<p style={{fontSize:13,color:'#a78bfa'}}>⏳ Parsing logs…</p>:<p style={{fontSize:13,color:'#555'}}>Drop cloud log file here or click to browse<br/><span style={{fontSize:11,color:'#444'}}>GCP · AWS · Azure · CDN · NDJSON · JSON array</span></p>}
      </div>
      {result&&!result.error&&<div style={{marginTop:10,padding:'8px 14px',borderRadius:8,background:'rgba(52,211,153,0.08)',border:'1px solid rgba(52,211,153,0.25)',fontSize:12,color:'#34d399'}}>✓ {result.total} entries — {result.ingested} ingested, {result.skipped} skipped</div>}
      {result?.error&&<div style={{marginTop:10,padding:'8px 14px',borderRadius:8,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',fontSize:12,color:'#f87171'}}>✗ {result.error}</div>}
      <div style={{marginTop:16,padding:'14px 18px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:10}}>
        <div style={{fontSize:12,fontWeight:700,color:'#94a3b8',marginBottom:8}}>Export from GCP Cloud Logging</div>
        <div style={{fontSize:11,color:'#555',lineHeight:2,fontFamily:'monospace'}}>
          <div style={{color:'#a78bfa'}}>gcloud logging read 'resource.type="http_load_balancer"' \</div>
          <div style={{color:'#a78bfa',paddingLeft:16}}>--limit=1000 --format=json &gt; gcp_logs.json</div>
        </div>
      </div>
    </div>
  )
}
