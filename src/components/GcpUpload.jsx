import { useRef, useState } from 'react'
import { apiFetch } from '../api.js'

export default function GcpUpload({ apiUrl, onDone }) {
  const [dragging,  setDragging]  = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result,    setResult]    = useState(null)
  const fileRef = useRef(null)

  const upload = async (file) => {
    setUploading(true); setResult(null)
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await apiFetch(`${apiUrl}/ingest/upload`, { method:'POST', body:fd })
      setResult(await r.json()); onDone()
    } catch(e) { setResult({ error: e.message }) }
    finally { setUploading(false) }
  }

  return (
    <div className="max-w-xl">
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); e.dataTransfer.files[0] && upload(e.dataTransfer.files[0]) }}
        className={`rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200
          ${dragging ? 'border-violet-500 bg-violet-500/5' : 'border-white/[0.12] hover:border-violet-500/50 hover:bg-white/[0.02]'}`}
      >
        <input ref={fileRef} type="file" accept=".json,.ndjson,.log,.txt" className="hidden" onChange={e => e.target.files[0] && upload(e.target.files[0])} />
        <div className="text-4xl mb-3">☁️</div>
        <p className="text-sm text-slate-400 mb-3">
          {uploading ? '⏳ Parsing cloud logs…' : 'Drop log file here or click to browse'}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['GCP','AWS','Azure','CDN','NDJSON','JSON array'].map(t => (
            <span key={t} className="badge border border-white/[0.08] text-slate-500 text-[10px]">{t}</span>
          ))}
        </div>
      </div>

      {result && !result.error && (
        <div className="mt-3 px-4 py-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 text-sm text-emerald-400">
          ✓ Parsed <strong>{result.total}</strong> entries — <strong>{result.ingested}</strong> ingested, <strong>{result.skipped}</strong> skipped
        </div>
      )}
      {result?.error && (
        <div className="mt-3 px-4 py-3 rounded-lg border border-red-500/25 bg-red-500/5 text-sm text-red-400">✗ {result.error}</div>
      )}

      <div className="mt-4 section">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Export from GCP Cloud Logging</p>
        <pre className="text-[11px] text-violet-400 font-mono leading-loose overflow-x-auto">{`gcloud logging read 'resource.type="http_load_balancer"' \\\n  --limit=1000 --format=json > gcp_logs.json`}</pre>
      </div>
    </div>
  )
}
