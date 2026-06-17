export default function Sidebar({ pages, active, onSelect, apiUrl }) {
  return (
    <aside className="w-56 flex-shrink-0 bg-white/[0.02] border-r border-white/[0.07] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-sm">🔐</div>
          <div>
            <p className="text-sm font-bold leading-tight">Crypto Debug</p>
            <p className="text-[9px] text-slate-600 leading-tight">Watchdog · RSA + AES</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
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

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.07]">
        <p className="text-[9px] text-slate-700 font-mono leading-relaxed">RSA-OAEP + AES-256-GCM</p>
        <p className="text-[9px] text-slate-700 truncate">{apiUrl?.replace(/https?:\/\//, '')}</p>
      </div>
    </aside>
  )
}
