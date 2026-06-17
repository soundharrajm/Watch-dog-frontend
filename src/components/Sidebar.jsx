import { useState } from 'react'

export default function Sidebar({ pages, active, onSelect, apiUrl, onSaveUrl }) {
  const [url, setUrl] = useState(apiUrl)

  const save = () => onSaveUrl(url)

  return (
    <aside className="w-60 flex-shrink-0 bg-white/[0.02] border-r border-white/[0.07] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-sm">🔐</div>
          <div>
            <p className="text-sm font-bold leading-tight">Crypto Debug</p>
            <p className="text-[9px] text-slate-600 leading-tight">RSA-OAEP + AES-256-GCM</p>
          </div>
        </div>
      </div>

      {/* Backend URL */}
      <div className="px-4 py-3 border-b border-white/[0.07]">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1.5">Backend URL</p>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onBlur={save}
          onKeyDown={e => e.key === 'Enter' && save()}
          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-300 outline-none focus:border-violet-500"
          placeholder="http://localhost:8001"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2">Encryption tools</p>
        {pages.map(p => (
          <button key={p.id} onClick={() => onSelect(p.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left
              ${active === p.id
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'}`}>
            <span className="text-base">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </nav>

      {/* Swagger link */}
      <div className="px-4 py-4 border-t border-white/[0.07] space-y-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-2">API testing</p>
        <a href={`${url}/docs`} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all">
          <span>📋</span>
          <span>Swagger UI</span>
          <span className="ml-auto text-[9px] text-slate-600">↗</span>
        </a>
        <a href={`${url}/redoc`} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all">
          <span>📄</span>
          <span>ReDoc</span>
          <span className="ml-auto text-[9px] text-slate-600">↗</span>
        </a>
        <a href={`${url}/openapi.json`} target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all">
          <span>{ }</span>
          <span>OpenAPI JSON</span>
          <span className="ml-auto text-[9px] text-slate-600">↗</span>
        </a>
      </div>
    </aside>
  )
}
